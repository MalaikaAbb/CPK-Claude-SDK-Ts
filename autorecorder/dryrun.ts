/**
 * Run every page's ACTION, with no camera.
 *
 * `npm run dryrun` executes exactly what `npm run record` executes on the demo
 * page -- the same `executePageAction`, the same selectors, the same
 * assertions -- and skips the parts that only exist for the video: the doc
 * page, the IDE simulator, the overlays, the reading pauses' companion footage,
 * and video capture itself.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 * The action layer is the part that breaks when the frontend changes, and it
 * was previously only reachable through a full recording: three steps, a
 * visible browser, and a ~5MB clip per page. Checking one selector meant
 * watching a video; checking all of them meant the better part of an hour and
 * ~140MB of footage to throw away.
 *
 * This is the same coverage in a headless browser, in parallel-free but
 * unadorned sequence, printing a pass/fail table. It is what to run after
 * touching `actions/`, `selectors.config.ts`, or any demo page in the frontend.
 * Run a real recording afterwards to check the things a dry run cannot see --
 * cursor placement, IDE highlighting, whether the video is watchable.
 *
 * ```bash
 * npm run dryrun                      # every registered page
 * npm run dryrun -- shared-state      # substring match on the page id
 * npm run dryrun -- slots --headed    # watch it drive
 * ```
 *
 * Exits 1 if any page failed, so it is safe to gate CI on.
 *
 * ── Portability ───────────────────────────────────────────────────────────
 * Nothing here is framework-specific: it reads the page registry and calls the
 * action dispatcher, both of which every adaptation already has. It belongs in
 * `core/` and should be promoted and ported to the other framework repos, which
 * all have the same "the only way to test an action is to film it" problem.
 */
import { chromium, type Browser } from 'playwright';
import { PAGES } from './config/pages.config';
import { PROJECT } from './config/project.config';
import { checkServicesHealth } from './core/diagnostics';
import { executePageAction } from './actions';

const flags = process.argv.slice(2).filter((a) => a.startsWith('-'));
const queries = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const headed = flags.includes('--headed');

const targets = queries.length
  ? PAGES.filter((p) => queries.some((q) => p.id.toLowerCase().includes(q.toLowerCase())))
  : PAGES;

if (targets.length === 0) {
  console.error(`No page id matches: ${queries.join(' ')}`);
  console.error(`Available: ${PAGES.map((p) => p.id).join(', ')}`);
  process.exit(1);
}

// Same pre-flight as the recorder: a dry run against a dead service produces a
// page of failures that all say the same thing.
const health = await checkServicesHealth();
if (!health.frontendOk || !health.backendOk) {
  if (!health.backendOk) {
    console.error(`[x] Agent backend ${PROJECT.backendUrl}: ${health.backendError}`);
    console.error(`    Fix: ${PROJECT.backendStartCmd}`);
  }
  if (!health.frontendOk) {
    console.error(`[x] Frontend ${PROJECT.frontendUrl}: ${health.frontendError}`);
    console.error(`    Fix: ${PROJECT.frontendStartCmd}`);
  }
  process.exit(1);
}

interface Result {
  id: string;
  ok: boolean;
  secs: number;
  error?: string;
}

const browser: Browser = await chromium.launch({ headless: !headed });
const results: Result[] = [];

for (const p of targets) {
  // A fresh context per page, so one page's thread, storage or agent state
  // cannot make the next one pass.
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  const consoleErrors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200));
  });

  console.log(`\n=================== ${p.id}`);
  console.log(`   ${p.demoUrl}`);

  const started = Date.now();
  let ok = true;
  let error: string | undefined;

  try {
    const response = await page.goto(p.demoUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    const status = response?.status() ?? 0;
    if (status >= 400) {
      throw new Error(`demo route returned HTTP ${status}`);
    }
    await executePageAction(page, p, process.cwd());
  } catch (e: unknown) {
    ok = false;
    error = e instanceof Error ? e.message.split('\n').slice(0, 3).join(' ') : String(e);
    console.log(`   ❌ ${error}`);
    if (consoleErrors.length > 0) {
      console.log(`   console: ${consoleErrors.slice(0, 3).join(' | ')}`);
    }
  }

  const secs = Number(((Date.now() - started) / 1000).toFixed(1));
  console.log(`   ${ok ? '✅ PASS' : '❌ FAIL'} in ${secs}s`);
  results.push({ id: p.id, ok, secs, error });
  await ctx.close();
}

await browser.close();

console.log(`\n\n================ SUMMARY ================`);
for (const r of results) {
  console.log(`${r.ok ? '✅' : '❌'} ${String(r.secs).padStart(6)}s  ${r.id}`);
  if (r.error) console.log(`        ${r.error}`);
}

const failed = results.filter((r) => !r.ok);
const total = ((results.reduce((sum, r) => sum + r.secs, 0)) / 60).toFixed(1);
console.log(`\n${results.length - failed.length}/${results.length} passed in ${total} min.`);
process.exit(failed.length > 0 ? 1 : 0);
