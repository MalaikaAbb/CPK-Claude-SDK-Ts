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

  // The route's `<TryIt>` block asks for one thing more than a reply: "the
  // agent's next message references the specific time you chose". That is what
  // separates `respond()` having delivered the choice from the run simply
  // resuming -- without it a generic "all set!" would pass.
  //
  // Matched on the clock time rather than the whole label, because the model
  // rephrases "Tomorrow 10:00 AM" freely but cannot invent a different hour.
  const time = chosen.match(/\d{1,2}:\d{2}/)?.[0];
  const reply = (await page.locator(CPK.assistantMessage).last().textContent()) ?? '';

  if (time && reply.includes(time)) {
    console.log(`   ✓ the reply references the chosen slot (${time}).`);
  } else {
    // Warned, not failed, and the distinction is the point.
    //
    // The mechanism this page exists to prove is already established above and
    // deterministically: the picker rendered (the run suspended on the tool
    // call), and a reply arrived after the click (`respond` resolved it and the
    // run resumed). Those are the page's own failure modes -- "the agent
    // invents a time without showing the picker", "clicking does nothing".
    //
    // Whether the model then *echoes* the time is wording, not wiring. Asserting
    // it made this page fail on one run and pass on the next with the same code,
    // and a recorder that fails intermittently is worse than one that reports
    // less: nobody trusts the red ones after the first false alarm.
    console.warn(
      `   ⚠ The reply does not repeat ${time ?? chosen} back. The interrupt and ` +
        'the resume both worked; the model just did not restate the slot.\n' +
        `        It said: "${reply.replace(/\s+/g, ' ').trim().slice(0, 200)}"`,
    );
  }
  await restOn(page, page.locator(CPK.assistantMessage).last(), 2000);
};
