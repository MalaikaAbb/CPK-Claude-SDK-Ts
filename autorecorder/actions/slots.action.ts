import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { CPK, assertNoErrorBanner, requireVisible, restOn } from './_shared';

/**
 * Three slot overrides on one `<CopilotChat>`.
 *
 * This app's Slots demo is a single chat carrying `welcomeScreen`,
 * `messageView.assistantMessage` and `input.disclaimer` at once -- not the
 * tabbed, one-level-per-tab arrangement the reference implementation drove.
 * Each override renders a labelled badge, which is what makes the override
 * checkable rather than merely plausible.
 *
 * The ordering matters and is the reason this is a handler at all. The welcome
 * screen *is* the entire chat while the message list is empty, so it can only
 * be shown before the first prompt; the assistant-message override can only be
 * shown after one. A single standard prompt would record the page in a state
 * where two thirds of its subject had already gone.
 */
const WELCOME_BADGE = 'text=welcomeScreen slot';
const ASSISTANT_BADGE = 'text=assistantMessage slot';
const DISCLAIMER_BADGE = 'text=disclaimer slot';

export const runSlotsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Slots] 1/3: the welcomeScreen override owns the empty state...`);
  const welcome = await requireVisible(
    page,
    WELCOME_BADGE,
    'The custom welcome screen',
    { timeoutMs: 15000 },
  );
  await restOn(page, welcome, 2200);

  console.log(`   [Slots] 2/3: the disclaimer override, under the composer...`);
  const disclaimer = await requireVisible(
    page,
    DISCLAIMER_BADGE,
    'The custom disclaimer',
    { timeoutMs: 10000 },
  );
  await restOn(page, disclaimer, 1800);

  console.log(`   [Slots] 3/3: prompting, so the assistantMessage override takes over...`);
  const before = await sendPrompt(page, config.prompt);
  await waitForAgentResponseCompletion(page, 1500, before);
  await assertNoErrorBanner(page);

  // The override wraps CopilotKit's own assistant message rather than replacing
  // it, so the default test id still resolves -- which is why the standard
  // detector above works here and the badge below is a separate check.
  const badge = await requireVisible(
    page,
    ASSISTANT_BADGE,
    'The custom assistant-message wrapper',
    { timeoutMs: 15000 },
  );
  await restOn(page, badge, 2000);

  await restOn(page, page.locator(CPK.assistantMessage).last(), config.waitAfterPromptMs ?? 3000);
};
