import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { promptsFor, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import {
  CPK,
  assertNoErrorBanner,
  clickLikeAPerson,
  noteIfVisible,
  requireVisible,
  restOn,
  sleep,
} from './_shared';

/**
 * The three Shared State routes. All of them share one agent,
 * `shared-state-read-write`, and therefore one state object.
 *
 * What separates them is which direction they demonstrate and where the state
 * is rendered -- inside the chat panel, as the page's own primary UI, or as
 * read-only context the agent cannot write back to.
 */

/** Sends each prompt in turn, waiting for its reply before the next. */
async function converse(
  page: Page,
  label: string,
  prompts: string[],
  onReply?: (turn: number, reply: string) => Promise<void> | void,
): Promise<void> {
  for (let i = 0; i < prompts.length; i++) {
    console.log(`   [${label}] ${i + 1}/${prompts.length}: "${prompts[i]}"`);
    const before = await sendPrompt(page, prompts[i]);
    await waitForAgentResponseCompletion(page, 1500, before);
    await assertNoErrorBanner(page);

    const reply = ((await page.locator(CPK.assistantMessage).last().textContent()) ?? '')
      .replace(/\s+/g, ' ')
      .trim();
    await onReply?.(i, reply);
    await restOn(page, page.locator(CPK.assistantMessage).last(), 1500);
  }
}

/** The `<details>` pane printing `JSON.stringify(agent.state)`. */
const RAW_STATE = 'details summary:text-is("Raw agent state")';

const NAME_INPUT = '[data-testid="preferences-name"]';
const NOTES_CARD = '[data-testid="notes-card"]';
const NOTES_LIST = '[data-testid="notes-list"]';

/**
 * Three prompts, one by one, against the preferences the form already holds:
 *
 *   1. "Explain recursion."                               -> follows the form
 *   2. "Remember that I drink my espresso as a cortado."  -> asks for a write
 *   3. "What do you know about me so far?"                -> repeats the form
 *
 * The pass condition lives in the third turn. The form's values reach the
 * agent through `agent.setState` (the page seeds them on mount), so the only
 * way the agent can name the user is by having read that state -- which is
 * checked against whatever the name field actually holds, rather than a value
 * assumed here.
 *
 * Turn two is reported, not asserted. With the `set_notes` backend tool
 * commented out in the registry there is nothing for the agent to call, and
 * the notes page says the Scratch pad stays empty today.
 */
export const runSharedStateAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const nameField = await requireVisible(page, NAME_INPUT, 'The preferences form', {
    timeoutMs: 20000,
  });
  const name = (await nameField.inputValue().catch(() => '')).trim();
  console.log(`   [Shared state] The form holds name "${name}".`);
  await restOn(page, nameField, 1500);

  // Open the raw pane so the state being read is on screen throughout.
  await clickLikeAPerson(page, page.locator(RAW_STATE).first(), 'raw state').catch(() => {});
  await sleep(800);
  await restOn(page, page.locator('details pre').first(), 1800, { x: 400, y: 700 });

  await converse(page, 'Shared state', promptsFor(config), async (turn, reply) => {
    if (turn === 1) {
      const filled = await noteIfVisible(page, NOTES_LIST, 'The agent scratch pad', {
        timeoutMs: 6000,
      });
      if (!filled) {
        console.log(
          '   ℹ Scratch pad empty -- expected. `set_notes` is a backend tool and ' +
            "this repo's registry entry for it is commented out. See README §9.",
        );
      }
      await restOn(page, page.locator(NOTES_CARD).first(), 1800);
    }

    if (turn === 2 && name && !reply.includes(name)) {
      throw new Error(
        `Asked what it knows, the agent never mentioned "${name}" -- the name in ` +
          'the preferences form -- so the shared state never reached it.\n' +
          `        It said: "${reply.slice(0, 240)}"`,
      );
    }
    if (turn === 2) {
      console.log(`   ✓ the agent read the form back: it named "${name}".`);
    }
  });

  await sleep(config.waitAfterPromptMs ?? 3000);
};

/**
 * The same state, rendered as the page rather than inside the chat.
 *
 * The canvas is seeded with a "Project launch" list. The agent is asked to add
 * "designing" to it, and the assertion is on the page body: a new item has to
 * appear in the canvas list, and it has to be the one asked for. A reply that
 * only *says* it added something, with the canvas unchanged, is the failure
 * this route exists to catch.
 */
const CANVAS_ITEM = 'main ul li label';

export const runSharedStateCanvasAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  await page.locator(CANVAS_ITEM).first().waitFor({ state: 'visible', timeout: 20000 });
  const startingItems = await page.locator(CANVAS_ITEM).count();
  console.log(`   [Canvas] ${startingItems} seeded item(s) on the page.`);
  await restOn(page, page.locator('main ul').first(), 2000, { x: 400, y: 260 });

  await converse(page, 'Canvas', [config.prompt]);

  // The write arrives as a state snapshot and re-renders the canvas, which can
  // land a beat after the reply finishes streaming.
  const added = await page
    .waitForFunction(
      ([sel, n]) => {
        const items = Array.from(document.querySelectorAll(sel as string));
        return (
          items.length > (n as number) &&
          items.some((el) => /design/i.test(el.textContent ?? ''))
        );
      },
      [CANVAS_ITEM, startingItems] as const,
      { timeout: 20000 },
    )
    .then(() => true)
    .catch(() => false);

  if (!added) {
    const labels = await page.locator(CANVAS_ITEM).allTextContents().catch(() => []);
    throw new Error(
      'No "designing" item appeared on the canvas. The agent answered without ' +
        'writing to shared state, so nothing re-rendered outside the chat.\n' +
        `        Canvas now: ${labels.map((l) => l.trim()).join(' | ')}`,
    );
  }

  const item = page.locator(CANVAS_ITEM).filter({ hasText: /design/i }).first();
  console.log(
    `   ✓ the agent's write reached the page body: "${((await item.textContent()) ?? '').trim()}".`,
  );
  await restOn(page, item, config.waitAfterPromptMs ?? 3000, { x: 400, y: 320 });
};

/**
 * `useAgentContext` -- props for the agent, one way, with no setter.
 *
 * Two prompts, one by one, each answerable only from a different context
 * entry the page publishes:
 *
 *   1. "What's my name and what have I been doing?"  -> name + activity
 *   2. "What time is it for me right now?"           -> timezone
 *
 * Nothing on the backend is involved: `ClaudeAgentAdapter.buildOptions()` walks
 * `input.context` and appends it to the system prompt every run. Each answer is
 * checked against what the form actually holds, and the failure the notes page
 * names -- a generic "I don't have access to that" -- fails both checks.
 */
const NAME_FIELD = 'main label:has-text("Display name") input';
const TZ_FIELD = 'main label:has-text("Timezone") input';

/** Ways a model names an IANA zone like `America/Los_Angeles`. */
function timezonePattern(tz: string): RegExp {
  const city = tz.split('/').pop()?.replace(/_/g, ' ') ?? tz;
  const known: Record<string, string[]> = {
    'America/Los_Angeles': ['pacific', '\\bP[DS]?T\\b'],
    'America/New_York': ['eastern', '\\bE[DS]?T\\b'],
    'Europe/London': ['\\bGMT\\b', '\\bBST\\b'],
  };
  const escaped = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    [escaped(tz), escaped(city), ...(known[tz] ?? [])].join('|'),
    'i',
  );
}

export const runAgentReadonlyAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const nameField = await requireVisible(page, NAME_FIELD, 'The display-name field', {
    timeoutMs: 20000,
  });
  const name = (await nameField.inputValue().catch(() => '')).trim();
  const tz = (await page.locator(TZ_FIELD).first().inputValue().catch(() => '')).trim();
  console.log(`   [Agent context] The form holds "${name}", ${tz}.`);
  await restOn(page, nameField, 1500);

  await converse(page, 'Agent context', promptsFor(config), (turn, reply) => {
    if (turn === 0) {
      if (name && !reply.includes(name)) {
        throw new Error(
          `The reply never mentioned "${name}", the name in the form -- no ` +
            '`useAgentContext` entries reached the run.\n' +
            `        It said: "${reply.slice(0, 240)}"`,
        );
      }
      console.log(`   ✓ answered from the name entry: "${name}".`);
    }

    if (turn === 1 && tz) {
      if (!timezonePattern(tz).test(reply)) {
        throw new Error(
          `The reply never referred to ${tz}, the timezone in the form -- the ` +
            'timezone entry did not reach the run.\n' +
            `        It said: "${reply.slice(0, 240)}"`,
        );
      }
      console.log(`   ✓ answered from the timezone entry (${tz}).`);
    }
  });

  await sleep(config.waitAfterPromptMs ?? 3000);
};
