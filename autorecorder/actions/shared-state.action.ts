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
 *
 * Every prompt and every pass condition below comes from the `<TryIt>` block on
 * the matching notes page (`frontend/src/app/shared-state/**\/page.tsx`), which
 * is where this repo declares what each route is supposed to do. Those blocks
 * are the contract; these handlers are that contract executed.
 */

/** The `<details>` pane printing `JSON.stringify(agent.state)`. */
const RAW_STATE = 'details summary:text-is("Raw agent state")';

const NAME_INPUT = '[data-testid="preferences-name"]';
const TONE_SELECT = '[data-testid="preferences-tone"]';
const NOTES_CARD = '[data-testid="notes-card"]';
const NOTES_LIST = '[data-testid="notes-list"]';

/** Distinctive enough that a reply containing it cannot be coincidence. */
const NAME = 'Rosalind';

/**
 * Read, write, read back -- the three turns the route's `<TryIt>` prescribes.
 *
 *   1. "Explain recursion."                     -> must follow the form
 *   2. "Remember that I drink my espresso..."   -> asks the agent to write
 *   3. "What do you know about me so far?"      -> must repeat the form back
 *
 * The pass condition lives in the third turn, which is why two turns would not
 * do. Turn one *looking* right is unfalsifiable -- any explanation of recursion
 * is consistent with the preferences having been ignored. Turn three is not:
 * the agent can only name the value this handler typed into the form if the
 * form's `agent.setState` write reached the system prompt.
 *
 * ── Why turn two does not fail the run ─────────────────────────────────────
 * The notes page says it plainly: "The second only produces prose today: with
 * the backend tool commented out there is no `set_notes` to call, so the Agent
 * Scratch pad stays empty." The scratch pad is checked and reported, never
 * asserted.
 */
export const runSharedStateAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const prompts = promptsFor(config);

  console.log(`   [Shared state] The UI writes first -- every edit is agent.setState...`);
  const nameField = await requireVisible(page, NAME_INPUT, 'The preferences form', {
    timeoutMs: 20000,
  });
  await clickLikeAPerson(page, nameField, 'name field');
  await page.keyboard.press('Control+A');
  await page.keyboard.type(NAME, { delay: 45 });
  await sleep(600);

  const tone = page.locator(TONE_SELECT).first();
  await tone.selectOption('playful').catch(() => {});
  await restOn(page, tone, 1500);

  // Open the raw pane so the state the form just wrote is on screen before the
  // agent is asked anything -- that is what makes the replies below evidence.
  await clickLikeAPerson(page, page.locator(RAW_STATE).first(), 'raw state').catch(() => {});
  await sleep(800);
  await restOn(page, page.locator('details pre').first(), 2200, { x: 400, y: 700 });

  console.log(`   [Shared state] 1/3: "${prompts[0]}" -- the reply should follow the form...`);
  let before = await sendPrompt(page, prompts[0]);
  await waitForAgentResponseCompletion(page, 1500, before);
  await assertNoErrorBanner(page);
  await restOn(page, page.locator(CPK.assistantMessage).last(), 2000);

  console.log(`   [Shared state] 2/3: "${prompts[1]}" -- asking the agent to write...`);
  before = await sendPrompt(page, prompts[1]);
  await waitForAgentResponseCompletion(page, 1500, before);
  await assertNoErrorBanner(page);

  const filled = await noteIfVisible(page, NOTES_LIST, 'The agent scratch pad', {
    timeoutMs: 6000,
  });
  if (!filled) {
    console.log(
      '   ℹ Scratch pad empty -- the behaviour this route documents. `set_notes` ' +
        "is a backend tool and this repo's registry entry for it is commented " +
        'out, so there is nothing for the agent to call. See README §9.',
    );
  }
  await restOn(page, page.locator(NOTES_CARD).first(), 2000);

  console.log(`   [Shared state] 3/3: "${prompts[2]}" -- the turn that proves the channel...`);
  before = await sendPrompt(page, prompts[2]);
  await waitForAgentResponseCompletion(page, 1500, before);
  await assertNoErrorBanner(page);

  const recall = (await page.locator(CPK.assistantMessage).last().textContent()) ?? '';
  if (!recall.includes(NAME)) {
    throw new Error(
      `The agent could not repeat back "${NAME}", the name typed into the ` +
        'preferences form. The UI\'s `agent.setState` write never reached the ' +
        "system prompt, which is the route's documented failure mode: \"The reply " +
        'ignores the name and tone in the form, or the third turn cannot repeat ' +
        'them back."',
    );
  }
  console.log(`   ✓ the agent read the form back: it named "${NAME}".`);

  await restOn(page, page.locator(CPK.assistantMessage).last(), config.waitAfterPromptMs ?? 3000);
};

/**
 * The same state, rendered as the page rather than inside the chat.
 *
 * Two turns, because the notes page's pass condition spans both: "A checklist
 * rendered in the page body, not in the chat. Ticking a box and then asking the
 * second question gets an answer that reflects your ticks."
 *
 * So turn one has to land on the canvas (not in the message list), a box is
 * ticked through `toggleItem` -> `agent.setState`, and turn two has to come back
 * knowing about it. That closes the loop in both directions; asserting only the
 * first half would miss `setState` failing to round-trip, which the page names
 * as its other failure mode.
 */
const CANVAS_ITEM = 'main ul li label';

export const runSharedStateCanvasAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const prompts = promptsFor(config);
  const startingItems = await page.locator(CANVAS_ITEM).count().catch(() => 0);
  console.log(`   [Canvas] ${startingItems} seeded item(s) on screen before the turn.`);

  console.log(`   [Canvas] 1/2: "${prompts[0]}"`);
  let before = await sendPrompt(page, prompts[0]);
  await waitForAgentResponseCompletion(page, 1500, before);
  await assertNoErrorBanner(page);

  // The write arrives as a state snapshot and re-renders the canvas, which can
  // land a beat after the reply finishes streaming.
  const grew = await page
    .waitForFunction(
      ([sel, n]) => document.querySelectorAll(sel as string).length > (n as number),
      [CANVAS_ITEM, startingItems] as const,
      { timeout: 20000 },
    )
    .then(() => true)
    .catch(() => false);

  if (!grew) {
    throw new Error(
      `The canvas still shows ${startingItems} item(s): the agent wrote prose ` +
        'instead of state, so nothing re-rendered outside the chat -- which is ' +
        'the only thing this page demonstrates.',
    );
  }
  const now = await page.locator(CANVAS_ITEM).count();
  console.log(`   ✓ the agent's write reached the page body: ${startingItems} -> ${now} items.`);

  const firstItem = page.locator(CANVAS_ITEM).first();
  const ticked = ((await firstItem.textContent()) ?? '').trim();
  await restOn(page, firstItem, 2200, { x: 400, y: 320 });

  console.log(`   [Canvas] Ticking "${ticked}" -- the write goes back the other way...`);
  await clickLikeAPerson(page, firstItem, 'checklist item');
  await sleep(1200);

  // Confirm the tick landed in the UI before asking the agent about it. Without
  // this, a click that missed and a state write that never round-tripped fail
  // identically -- and they are completely different bugs.
  const isChecked = await firstItem
    .locator('input[type="checkbox"]')
    .isChecked()
    .catch(() => false);
  if (!isChecked) {
    throw new Error(
      `Clicking "${ticked}" did not tick its checkbox, so the second turn would ` +
        'be asking about a tick that never happened. The click missed the label, ' +
        'or `toggleItem` threw.',
    );
  }
  console.log(`   ✓ the checkbox is ticked in the page.`);

  console.log(`   [Canvas] 2/2: "${prompts[1]}" -- can the agent see the tick?`);
  before = await sendPrompt(page, prompts[1]);
  await waitForAgentResponseCompletion(page, 1500, before);
  await assertNoErrorBanner(page);

  // Match on a distinctive word from the ticked label rather than the whole
  // string: the model paraphrases list items, but it has to name the thing.
  const keyword = ticked
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .sort((a, b) => b.length - a.length)[0];
  const reply = ((await page.locator(CPK.assistantMessage).last().textContent()) ?? '')
    .toLowerCase();

  if (keyword && !reply.includes(keyword.toLowerCase())) {
    // Known failure, and the blame is narrower than it looks. Capturing the
    // POST to /api/copilotkit on this turn shows the tick *does* reach the
    // wire -- the run input carries
    //   "state":{"items":[{"id":"clothes","label":"...","done":true}, ...]}
    // with the ticked item's `done` already true. So `toggleItem` ->
    // `agent.setState` -> run input is working end to end, and the frontend
    // half of this page is correct.
    //
    // What does not happen is the agent being shown it. `ClaudeAgentAdapter`
    // caches a Claude Code session per `threadId` and resumes it, sending only
    // the newest message; on a resumed turn the model reads the state the
    // session already had rather than the state this request carried. Hence an
    // agent that confidently reports "all 4 are still unchecked" while holding
    // the ticked list in its own input.
    //
    // Left failing rather than downgraded to a note: unlike the four
    // documented gaps, this route's notes list it as a failure ("ticks the
    // agent cannot see means setState is not round-tripping"), and it is a
    // real defect rather than an unpublished bridge.
    throw new Error(
      `Asked which items were ticked, the agent never mentioned "${keyword}" -- ` +
        'the box this run ticked.\n' +
        `        It said: "${reply.replace(/\s+/g, ' ').trim().slice(0, 240)}"\n` +
        '        The tick IS on the wire: the run input for this turn carries ' +
        'state.items with done:true for it. The adapter resumes a cached ' +
        'session per threadId and the model reads that session’s state ' +
        'instead. See README §9.',
    );
  }
  console.log(`   ✓ the agent saw the tick the page made.`);

  await restOn(page, firstItem, config.waitAfterPromptMs ?? 2500, { x: 400, y: 320 });
};

/**
 * `useAgentContext` -- props for the agent, one way, with no setter.
 *
 * Nothing on the backend is involved: `ClaudeAgentAdapter.buildOptions()` walks
 * `input.context` and appends a "Context from the application" block to the
 * system prompt every run.
 *
 * The notes page's pass condition is specifically about *re-publishing*: "The
 * agent answers with the current form values. Change the name, ask again in the
 * same thread, and the new one comes back -- the entries re-publish on every
 * render." So the same question is asked twice with the name changed in
 * between, and each answer is checked against the name in force at the time. A
 * single turn would show the context arriving once, which is the weaker claim.
 */
const NAME_FIELD = 'main label:has-text("Display name") input';
const RENAMED = 'Rosalind';

export const runAgentReadonlyAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const prompts = promptsFor(config);
  const nameField = await requireVisible(page, NAME_FIELD, 'The display-name field', {
    timeoutMs: 20000,
  });
  const original = (await nameField.inputValue().catch(() => '')).trim();
  console.log(`   [Agent context] The form starts on "${original}".`);
  await restOn(page, nameField, 1500);

  console.log(`   [Agent context] 1/2: "${prompts[0]}"`);
  let before = await sendPrompt(page, prompts[0]);
  await waitForAgentResponseCompletion(page, 1500, before);
  await assertNoErrorBanner(page);

  let reply = (await page.locator(CPK.assistantMessage).last().textContent()) ?? '';
  if (original && !reply.includes(original)) {
    throw new Error(
      `The reply never mentioned "${original}", the name currently in the form. ` +
        'No `useAgentContext` entries reached the run -- the documented failure ' +
        'is a generic "I don\'t have access to that", and the Inspector\'s ' +
        'context tab will show them empty.',
    );
  }
  console.log(`   ✓ turn one answered from the form: it used "${original}".`);
  await restOn(page, page.locator(CPK.assistantMessage).last(), 2000);

  console.log(`   [Agent context] Renaming to "${RENAMED}" mid-thread...`);
  await clickLikeAPerson(page, nameField, 'display name');
  await page.keyboard.press('Control+A');
  await page.keyboard.type(RENAMED, { delay: 60 });
  await sleep(800);
  await restOn(page, nameField, 1800);

  console.log(`   [Agent context] 2/2: the same question, same thread, new value...`);
  before = await sendPrompt(page, prompts[1] ?? prompts[0]);
  await waitForAgentResponseCompletion(page, 1500, before);
  await assertNoErrorBanner(page);

  reply = (await page.locator(CPK.assistantMessage).last().textContent()) ?? '';
  if (!reply.includes(RENAMED)) {
    throw new Error(
      `Turn two still does not say "${RENAMED}" after the form was renamed. The ` +
        'context entries are published once rather than re-published on every ' +
        'render, so the agent is answering from a stale copy.',
    );
  }
  console.log(`   ✓ turn two picked up the edit: the entries re-publish per render.`);

  await restOn(page, page.locator(CPK.assistantMessage).last(), config.waitAfterPromptMs ?? 3000);
};
