import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import {
  getAssistantMessageCount,
  promptsFor,
  sendPrompt,
  waitForAgentResponseCompletion,
} from '../core/actions';
import { waitForDomSettled } from './page-ready';
import {
  CPK,
  assertNoErrorBanner,
  clickLikeAPerson,
  requireVisible,
  restOn,
  sleep,
  textOf,
} from './_shared';

/**
 * Governed actions -- both patterns on the page, one per tab, one clip.
 *
 *   1. `useInterrupt` tab: a 20% discount. Policy says require_approval, so
 *      the run finishes on an interrupt and the card waits. Approve it; the
 *      resume run executes server-side and the ledger row turns
 *      `approved / executed` with a receipt.
 *   2. `useHumanInTheLoop` tab: an external email. Same verdict, but this time
 *      Reject; the ledger row must read `rejected / skipped`.
 *
 * Both halves click, because in both the run is genuinely paused: nothing
 * further streams until the card is answered, so a prompt-and-wait handler
 * would hang and report the page dead.
 *
 * The pass conditions are read off the audit ledger, not the chat. The ledger
 * is written by the agent server only -- the browser cannot execute a side
 * effect -- so an `executed` row is proof the gate opened, and a `skipped` row
 * after Reject is proof it held. The model's prose is checked only loosely.
 */
const CARD = '[data-testid="governed-action-card"]';
const APPROVE = '[data-testid="governed-action-approve"]';
const REJECT = '[data-testid="governed-action-reject"]';
const LEDGER = '[data-testid="governed-audit-ledger"]';
const ENTRY = '[data-testid="governed-audit-entry"]';
const TAB = (id: 'interrupt' | 'hitl') => `[data-testid="governed-pattern-${id}"]`;

const DEFAULT_PROMPTS = [
  'Apply a 20% discount for customer Globex.',
  'Email the Q3 pricing sheet to jane@globex.com.',
];

/** Wait for the newest ledger row to reach a given decision/outcome. */
async function requireLedgerRow(
  page: Page,
  decision: string,
  outcome: string,
  what: string,
  timeoutMs = 90000,
) {
  return requireVisible(
    page,
    `${ENTRY}[data-decision="${decision}"][data-outcome="${outcome}"]`,
    what,
    { timeoutMs },
  );
}

async function pendingCard(page: Page, label: string) {
  const card = await requireVisible(page, `${CARD}[data-verdict="require_approval"]`, label, {
    timeoutMs: 60000,
  });
  console.log('   ✓ the run paused on a "User approval required" card.');
  await restOn(page, card, 2800);
  return card;
}

export const runGovernedActionsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const prompts = promptsFor(config);
  const [interruptPrompt, hitlPrompt] = [
    prompts[0] ?? DEFAULT_PROMPTS[0],
    prompts[1] ?? DEFAULT_PROMPTS[1],
  ];

  // ── 1. useInterrupt → Approve ─────────────────────────────────────────────
  console.log(`   [Governed 1/2] useInterrupt: "${interruptPrompt}"`);
  await restOn(page, page.locator(TAB('interrupt')), 1200);
  await sendPrompt(page, interruptPrompt);

  await pendingCard(page, 'The interrupt approval card');
  await restOn(page, page.locator(`${ENTRY}[data-decision="pending"]`), 1800);

  // Counted at the click, not at the prompt: the paused run already wrote an
  // assistant message, and it must not pass for the resumed run's reply.
  let before = await getAssistantMessageCount(page);
  console.log('   [Governed 1/2] Approving...');
  await clickLikeAPerson(page, page.locator(APPROVE).first(), 'Approve and run');

  const executed = await requireLedgerRow(
    page,
    'approved',
    'executed',
    'An approved + executed ledger row',
  );
  const receipt = await textOf(page, `${ENTRY}[data-outcome="executed"] [data-testid="governed-audit-receipt"]`);
  console.log(`   ✓ the server executed the approved action (receipt ${receipt || 'n/a'}).`);
  await restOn(page, executed, 2200);

  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, before);
  await assertNoErrorBanner(page);
  const reply1 = ((await page.locator(CPK.assistantMessage).last().textContent()) ?? '').trim();
  if (receipt && !reply1.includes(receipt)) {
    console.log(`   ℹ the reply does not quote ${receipt}; the ledger is the authority here.`);
  }
  await restOn(page, page.locator(CPK.assistantMessage).last(), 2000);

  // ── 2. useHumanInTheLoop → Reject ─────────────────────────────────────────
  console.log('   [Governed 2/2] Switching to the useHumanInTheLoop tab...');
  await clickLikeAPerson(page, page.locator(TAB('hitl')), 'useHumanInTheLoop tab');
  await waitForDomSettled(page);
  await requireVisible(page, CPK.textarea, 'The HITL chat input', { timeoutMs: 20000 });
  await restOn(page, page.locator(LEDGER), 1200);

  console.log(`   [Governed 2/2] useHumanInTheLoop: "${hitlPrompt}"`);
  await sendPrompt(page, hitlPrompt);

  await pendingCard(page, 'The HITL approval card');
  before = await getAssistantMessageCount(page);

  console.log('   [Governed 2/2] Rejecting...');
  await clickLikeAPerson(page, page.locator(REJECT).first(), 'Reject');

  const skipped = await requireLedgerRow(
    page,
    'rejected',
    'skipped',
    'A rejected + skipped ledger row',
  );
  if ((await page.locator(`${ENTRY}[data-outcome="executed"]`).count()) > 0) {
    throw new Error(
      'The HITL ledger shows an executed action after the user rejected it -- ' +
        'the server ran a side effect it was told not to.',
    );
  }
  console.log('   ✓ the rejected action was logged and not executed.');
  await restOn(page, skipped, 2200);

  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, before);
  await assertNoErrorBanner(page);
  await sleep(300);
  await restOn(page, page.locator(CPK.assistantMessage).last(), 2000);
};
