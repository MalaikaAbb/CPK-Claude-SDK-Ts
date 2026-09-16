import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { promptsFor, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { CPK, assertNoErrorBanner, restOn, sleep } from './_shared';

/**
 * The same question twice, with the config changed in between.
 *
 * Straight from the route's `<TryIt>` block: "Explain what an API is. (then
 * switch tone to enthusiastic and ask again)", passing when you get "Same
 * question, visibly different answer -- length and register track the selects",
 * and failing on "Identical phrasing across settings".
 *
 * That failure line is also the assertion. It is the right one, and two weaker
 * ones were tried first:
 *
 *   - "did the second answer get longer under `detailed`?" -- reply length
 *     varies with the question and with what the model already said in the
 *     thread. A run here produced 408 characters on `concise` and 223 on
 *     `detailed`, which says nothing about whether the config arrived.
 *   - "ask the agent to name its own settings" -- deterministic, but it tests
 *     that the values are *in* the prompt rather than that they *change the
 *     answer*, which is the thing the page claims.
 *
 * Comparing the two answers tests exactly what the page says it tests, and the
 * only way to fake it is for the model to answer identically twice.
 */
const SELECTS = 'main select';

/** [before, after] for the one select this handler changes. */
const TONE = ['professional', 'enthusiastic'] as const;

async function latestReply(page: Page): Promise<string> {
  return ((await page.locator(CPK.assistantMessage).last().textContent()) ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const runAgentConfigAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const prompts = promptsFor(config);

  console.log(`   [Agent config] 1/2: "${prompts[0]}" on tone ${TONE[0]}...`);
  await restOn(page, page.locator('main pre').first(), 1800, { x: 400, y: 620 });

  let before = await sendPrompt(page, prompts[0]);
  await waitForAgentResponseCompletion(page, 1500, before);
  await assertNoErrorBanner(page);

  const first = await latestReply(page);
  console.log(`   ✓ first answer: ${first.length} characters.`);

  // Tone only -- the first of the page's three selects. Expertise and response
  // length stay where they were, so any difference in the answer is the tone.
  console.log(`   [Agent config] Switching tone to ${TONE[1]}...`);
  const tone = page.locator(SELECTS).nth(0);
  await restOn(page, tone, 800);
  await tone.selectOption(TONE[1]);
  await sleep(800);

  // The JSON block under the form is the live config; resting on it makes the
  // change legible before the second turn asks the same question again.
  await restOn(page, page.locator('main pre').first(), 2500, { x: 400, y: 620 });

  console.log(`   [Agent config] 2/2: the same question, same thread, new config...`);
  before = await sendPrompt(page, prompts[1] ?? prompts[0]);
  await waitForAgentResponseCompletion(page, 1500, before);
  await assertNoErrorBanner(page);

  const second = await latestReply(page);
  console.log(`   ✓ second answer: ${second.length} characters.`);

  if (second === first) {
    throw new Error(
      `Both turns produced identical text after tone changed to ${TONE[1]}. That ` +
        "is this route's documented failure: \"Identical phrasing across " +
        'settings means the context never reached the prompt; check the ' +
        'Inspector\'s context tab."',
    );
  }
  console.log(`   ✓ same question, different answer -- the agent reread the config.`);

  await restOn(page, page.locator(CPK.assistantMessage).last(), config.waitAfterPromptMs ?? 3000);
};

/**
 * The supervisor, and the delegation log that stays empty.
 *
 * The doc publishes the supervisor prompt and the three delegation tool
 * schemas, but not the run loop that would execute them -- "the run loop in
 * `agent_server.ts` runs the matching sub-agent synchronously, records the
 * delegation into shared agent state, and returns the sub-agent's output as a
 * tool_result" is the entire specification it gives. The tools are backend
 * tools besides, so they would need the equally unpublished
 * `buildBackendToolServer`.
 *
 * The route's own `<TryIt>` block states the expected outcome: "Currently: the
 * supervisor answers directly and the delegation log stays empty with all three
 * role chips dimmed. That is the documented-gap behaviour." Requiring a
 * delegation would therefore fail a page wired exactly as published, so the run
 * asserts the reply and puts the empty log on screen. See README §9.
 */
const DELEGATION_LOG = '[data-testid="delegation-log"]';
const DELEGATION_ENTRY = '[data-testid="delegation-entry"]';

export const runSubagentsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Sub-agents] Showing the log the delegations would populate...`);
  await restOn(page, page.locator(DELEGATION_LOG).first(), 2000, { x: 400, y: 300 });

  console.log(`   [Sub-agents] "${config.prompt}"`);
  const before = await sendPrompt(page, config.prompt);
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, before);
  await assertNoErrorBanner(page);

  const entries = await page.locator(DELEGATION_ENTRY).count().catch(() => 0);
  if (entries > 0) {
    console.log(`   ✓ ${entries} delegation(s) recorded into shared state.`);
  } else {
    console.log(
      '   ℹ No delegations recorded -- the behaviour this route documents. The ' +
        'supervisor has the prompt but not the tools: the delegation run loop is ' +
        'never published, and the tools are backend tools with no registration ' +
        'bridge. See README §9.',
    );
  }
  await restOn(page, page.locator(DELEGATION_LOG).first(), 2500, { x: 400, y: 300 });
};
