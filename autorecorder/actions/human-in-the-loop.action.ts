import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import {
  CPK,
  assertNoErrorBanner,
  clickLikeAPerson,
  requireVisible,
  restOn,
  sleep,
} from './_shared';

/**
 * `useHumanInTheLoop` -- the agent-initiated pause.
 *
 * The LLM decides to call `book_call`; CopilotKit routes the call through
 * `render`, which shows the picker; `respond(...)` resolves the promise the
 * tool call is awaiting; the same run continues with the user's choice as the
 * tool result.
 *
 * The click is therefore not decoration. Nothing further streams until it
 * happens -- the run is genuinely suspended -- and the string the button sends
 * becomes what the model reads next. A handler that only waited for a reply
 * would hang here and report the page as dead.
 *
 * The slots are fixed strings the page hard-codes (`DEFAULT_SLOTS`), and the
 * card exposes its own test ids, so both the card and the confirmation state
 * can be matched exactly rather than by text the model chose.
 */
const CARD = '[data-testid="time-picker-card"]';
const SLOT = '[data-testid="time-picker-slot"]';
const PICKED = '[data-testid="time-picker-picked"]';

export const runHumanInTheLoopAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [HITL] Prompting so the agent calls book_call...`);
  const before = await sendPrompt(page, config.prompt);

  const card = await requireVisible(page, CARD, 'The time-picker card', {
    timeoutMs: 45000,
  });
  console.log(`   ✓ the run suspended on the tool call and rendered the picker.`);

  // Let the proposed slots sit on screen long enough to read before choosing.
  await restOn(page, card, 2500);

  const slots = page.locator(SLOT);
  const count = await slots.count();
  if (count === 0) {
    throw new Error(
      'The picker rendered with no selectable slots, so `respond` can never ' +
        'fire and the run stays suspended forever.',
    );
  }
  const chosen = ((await slots.first().textContent()) ?? '').trim();
  console.log(`   [HITL] Choosing "${chosen}" out of ${count} offered slots...`);
  await clickLikeAPerson(page, slots.first(), 'time slot');

  const picked = await requireVisible(page, PICKED, 'The booked confirmation', {
    timeoutMs: 15000,
  });
  await restOn(page, picked, 1800);
  await sleep(200);

  // Only now does the run resume, so this is the reply that matters.
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, before);
  await assertNoErrorBanner(page);

  // Pass condition, second half: "the agent's next message references the
  // specific time you chose". That is what separates `respond()` having
  // delivered the choice from the run merely resuming -- without it a generic
  // "all set!" would pass.
  //
  // Matched on the hour in any of the ways the model writes it ("10:00",
  // "10 AM", "10am", "10 a.m."), because it rephrases the label freely but
  // cannot name a different hour without having been told a different slot.
  const clock = chosen.match(/(\d{1,2}):(\d{2})\s*([AP]M)?/i);

  if (clock) {
    const [, hour, minutes, meridiem = ''] = clock;
    const m = meridiem ? `${meridiem[0]}\\.?\\s*m\\.?` : '';
    const forms = [
      `\\b${hour}:${minutes}`,
      ...(minutes === '00' && m ? [`\\b${hour}\\s*${m}`] : []),
    ];
    const pattern = new RegExp(forms.join('|'), 'i');

    // Poll rather than read once. The agent often writes "All set! Here's a
    // summary of what was scheduled:" and then pauses before the summary --
    // longer than the shared detector's stability window -- so a single read
    // lands on the lead-in and misses the time that follows it.
    let reply = '';
    let mentioned = false;
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      // The agent's own words only. The picker lives inside an assistant
      // message too, and its confirmation reads "Booked for <slot>" -- counting
      // that text would pass this check without the model saying anything.
      reply = await page
        .evaluate((sel) => {
          const msgs = Array.from(document.querySelectorAll(sel as string));
          const last = msgs[msgs.length - 1];
          if (!last) return '';
          const copy = last.cloneNode(true) as HTMLElement;
          copy.querySelectorAll('[data-testid^="time-picker"]').forEach((n) => n.remove());
          return (copy.textContent ?? '').replace(/\s+/g, ' ').trim();
        }, CPK.assistantMessage)
        .catch(() => '');
      if (pattern.test(reply)) {
        mentioned = true;
        break;
      }
      await sleep(500);
    }

    if (!mentioned) {
      throw new Error(
        `The agent's reply never mentions ${hour}:${minutes}${meridiem ? ' ' + meridiem : ''}, ` +
          'the slot this run picked -- so the choice did not reach the model as ' +
          'its tool result, and the run resumed without it.\n' +
          `        It said: "${reply.slice(0, 240)}"`,
      );
    }
    console.log(`   ✓ the reply references the chosen time (${chosen}).`);
  }
  await restOn(page, page.locator(CPK.assistantMessage).last(), 2000);
};
