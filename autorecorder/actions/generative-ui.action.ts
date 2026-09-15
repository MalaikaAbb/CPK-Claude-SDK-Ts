import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { CPK, assertNoErrorBanner, noteIfVisible, requireVisible, restOn } from './_shared';
import { waitForDomSettled } from './page-ready';

/**
 * The Generative UI routes, which split cleanly into two groups.
 *
 * Working: `useComponent` (Components as Tools) and the A2UI dynamic-schema
 * catalog. Both draw through *frontend* tools, which travel in the AG-UI run
 * input -- `ClaudeAgentAdapter` turns `input.tools` into its own in-process
 * `ag_ui` MCP server, so nothing has to be registered on the agent server.
 * These two are asserted: no rendered surface means a real failure.
 *
 * Documented gaps: Tool Call Rendering and A2UI fixed-schema. Both depend on a
 * *backend* tool (`get_weather`, `display_flight`), and registering one needs
 * `buildBackendToolServer` -- a function the Quickstart calls and which no doc
 * page in this framework's docs defines. The model is never offered the tool,
 * never calls it, and the renderers never fire. Those two are recorded with the
 * gap on screen rather than failed, because failing them would report a
 * correctly wired page as broken. See README §9.
 */

/** Recharts renders an `<svg class="recharts-surface">` once it has data. */
const BAR_CHART = 'svg.recharts-surface';

/**
 * `useComponent` -- the component *is* the tool, so the chart is the assertion.
 *
 * A prose answer here is a genuine failure: it means the model was not offered
 * `render_bar_chart`, or offered it and declined, and either way the page's
 * claim did not happen.
 */
export const runToolBasedAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Components as Tools] Asking for a chart...`);
  const before = await sendPrompt(page, config.prompt);

  const chart = await requireVisible(page, BAR_CHART, 'The generative bar chart', {
    timeoutMs: 45000,
  });
  console.log(`   ✓ the agent called render_bar_chart and the component mounted inline.`);
  await restOn(page, chart, 3000);

  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 3000, before);

  // Deliberately no `assertNoErrorBanner` here, unlike every other route.
  //
  // This page's `<TryIt>` block expects a chart "followed by an error banner",
  // and the panel beneath it explains why: `useComponent` is render-only, so
  // the tool result sent back is empty; the adapter derives its prompt from the
  // last message only, so the follow-up run CopilotKit issues is `query({
  // prompt: "" })`, which Anthropic rejects with `cache_control cannot be set
  // for empty text blocks`. Both defects are in `@ag-ui/claude-agent-sdk`
  // 0.0.3, not in this repo.
  //
  // The chart is the part that works, and the chart is what is asserted.
  const banner = await noteIfVisible(page, CPK.errorBanner, 'The follow-up-run error banner', {
    timeoutMs: 6000,
  });
  if (banner) {
    console.log(
      '   ℹ Banner present, as documented: the chart rendered, then the ' +
        'follow-up run failed on an empty prompt. See the route notes.',
    );
  }
};

/**
 * Either renderer, keyed on what each one uniquely puts on screen: the named
 * `get_weather` card labels its stat tiles "Humidity", and the wildcard
 * catch-all prints the raw tool payload in a `<pre>`. Both are scoped to the
 * message list so neither can match page chrome.
 */
const WEATHER_CARD =
  '[data-testid="copilot-message-list"] :text-is("Humidity"), [data-testid="copilot-message-list"] pre';

/**
 * Tool Call Rendering -- a documented gap, recorded as one.
 *
 * The page wires a named renderer for `get_weather` and a `useDefaultRenderTool`
 * wildcard, both verbatim from the doc. Neither can fire, for the reason the
 * demo's own rose banner states on screen. The run therefore shows the banner,
 * sends the prompt, and requires only that the agent answers -- while saying in
 * the log whether a card appeared, so the day the bridge is published this
 * handler starts reporting it without being edited.
 */
export const runToolRenderingAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Tool Rendering] Showing the gap this page documents...`);
  await restOn(page, page.locator('p.text-rose-800, p[class*="rose"]').first(), 2500, {
    x: 700,
    y: 120,
  });

  console.log(`   [Tool Rendering] Asking for weather, which has no registered tool...`);
  const before = await sendPrompt(page, config.prompt);

  const rendered = await noteIfVisible(page, WEATHER_CARD, 'A tool-call card', {
    timeoutMs: 15000,
  });

  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, before);
  await assertNoErrorBanner(page);

  if (!rendered) {
    console.log(
      '   ℹ Prose answer, no card -- expected. `get_weather` is a backend tool ' +
        'and the docs publish no bridge that registers one, so the model is ' +
        'never offered it. Both renderers stay wired. See README §9.',
    );
  }
  await restOn(page, page.locator(CPK.assistantMessage).last(), 2000);
};

/**
 * A2UI dynamic schema -- the agent designs a surface from the catalog.
 *
 * `a2ui={{ catalog }}` on the provider registers the component vocabulary and
 * auto-injects `generate_a2ui`, which is a frontend tool, so this one genuinely
 * works and is asserted. The catalog's own renderers carry `declarative-*` test
 * ids; matching the prefix means a dashboard built from any combination of them
 * counts, which is the point -- the model chooses the composition.
 */
const A2UI_SURFACE = '[data-testid^="declarative-"]';

/**
 * The fixed-schema route draws with a *different* catalog, so it needs its own
 * selector: its renderers emit `a2ui-fixed-card`, not the dynamic catalog's
 * `declarative-*` ids. Pointing the gap check at the dynamic ids would have
 * reported "no surface" even on the day a drawing tool got registered.
 */
const A2UI_FIXED_CARD = '[data-testid="a2ui-fixed-card"]';

export const runA2uiDynamicAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [A2UI dynamic] Asking the agent to design a surface...`);
  await sendPrompt(page, config.prompt);

  const surface = await requireVisible(page, A2UI_SURFACE, 'An A2UI surface', {
    timeoutMs: 60000,
  });
  console.log(`   ✓ the agent called generate_a2ui and the catalog rendered it.`);
  await assertNoErrorBanner(page);

  // Deliberately NOT waitForAgentResponseCompletion. On this route the drawn
  // surface *is* the reply: the agent answers by calling `generate_a2ui`, and
  // it frequently emits no accompanying text at all -- so the shared text
  // detector waits out its full 30s and then reports that the agent never
  // responded, on a page whose dashboard is sitting on screen.
  //
  // The surface above is the stronger check anyway. It could only have been
  // built by a completed tool call, which means the run reached the agent
  // server and came back. What is left is to let the surface finish assembling
  // rather than cutting at the first rendered child.
  await waitForDomSettled(page, { settleMs: 1200, timeoutMs: 20000 });
  await restOn(page, surface, config.waitAfterPromptMs ?? 3500);
};

/**
 * A2UI fixed schema -- the other documented gap.
 *
 * This route's runtime sets `injectA2UITool: false`, exactly as the page
 * prescribes, on the grounds that the agent owns its own `display_flight`. That
 * tool is a backend tool and cannot be registered, so the agent ends up with no
 * drawing tool at all. Left as published rather than flipping injection back
 * on, which would quietly demonstrate the dynamic-schema path under this page's
 * name -- so the recording shows prose, and says why.
 */
export const runA2uiFixedAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [A2UI fixed] Asking about a flight, which has no drawing tool...`);
  const before = await sendPrompt(page, config.prompt);

  const rendered = await noteIfVisible(page, A2UI_FIXED_CARD, 'The flight card', {
    timeoutMs: 15000,
  });

  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, before);
  await assertNoErrorBanner(page);

  if (!rendered) {
    console.log(
      '   ℹ Prose answer, no card -- which is what this route’s own notes call ' +
        'for: "Currently: a one-sentence prose reply and no card. That is the ' +
        'documented-gap behaviour this route records." `display_flight` is a ' +
        'backend tool with no published registration bridge, and A2UI injection ' +
        'is off for this agent by the doc page’s own instruction. See README §9.',
    );
  }
  await restOn(page, page.locator(CPK.assistantMessage).last(), 2000);
};
