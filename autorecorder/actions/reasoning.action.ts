import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { CPK, assertNoErrorBanner, noteIfVisible, restOn } from './_shared';

/**
 * The two reasoning routes, which differ only in how the slot is filled.
 *
 * `/custom-look-and-feel/reasoning-messages` passes the sub-slot object
 * (`{ header, contentView }`); `/generative-ui/reasoning` passes a whole
 * component. Either way the card only exists if the model emitted a thinking
 * block, and that is not something the page controls.
 *
 * ── Why absence is not a failure here ──────────────────────────────────────
 * `ClaudeAgentAdapter` is constructed in `backend/src/agent-server.ts` without
 * extended thinking enabled, so the model answers these prompts with no
 * thinking blocks and the adapter emits no REASONING_* events. That is
 * observable directly on /backend/copilot-runtime, whose event pane lists every
 * reasoning callback and prints none. The slot is wired correctly and simply
 * has nothing to render.
 *
 * Failing the run would report the override as broken when it is not. So the
 * handler prompts for work the model might think through, says plainly whether
 * a card appeared, and still requires the reply itself -- which is the part
 * that can genuinely break.
 */
const REASONING_CARD =
  '[data-testid="reasoning-block"], [data-testid="copilot-reasoning-message"]';

export const runReasoningAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Reasoning] Prompting for work the model may think through...`);
  const before = await sendPrompt(page, config.prompt);

  // Look while the reply streams: a reasoning card renders before the answer
  // and collapses once text starts, so checking afterwards can miss it.
  const rendered = await noteIfVisible(page, REASONING_CARD, 'A reasoning card', {
    timeoutMs: 20000,
  });
  if (rendered) {
    await restOn(page, page.locator(REASONING_CARD).last(), 2500);
  }

  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, before);
  await assertNoErrorBanner(page);

  if (!rendered) {
    console.log(
      '   ℹ No thinking blocks were emitted, so the custom reasoning slot had ' +
        'nothing to render. The override is wired; extended thinking is not ' +
        'enabled on the adapter. See README §9.',
    );
    await restOn(page, page.locator(CPK.assistantMessage).last(), 2000);
  }
};
