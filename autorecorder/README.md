# Autorecorder

Automated screen-recording suite for CopilotKit framework integrations. It
produces one narrated-looking demo video per documentation page: read the doc,
switch to VS Code and show the code that implements it, switch to the browser and
drive the live feature.

Currently configured for **Claude Agent SDK (TypeScript) + React** — the 27 routes of
this repo that have a chrome-free `demo-chat` page. The remaining doc routes are
reference pages with nothing to drive; see *Scope* below.

> **Porting this to another framework?** Read **[ADAPT.md](ADAPT.md)** first. It
> is written for the person or agent doing the port, and it is the contract the
> `doctor` command enforces.

---

## Run it

Both services must be up first — the recorder refuses to start otherwise, because
a video of a dead page is worse than no video.

```bash
cd backend && npm run dev                           # http://localhost:8000
cd frontend && npm run dev                           # :3000
```

Both default ports are assumed. If something else already owns them, start this
stack elsewhere and point the recorder at it — every URL derives from these:

```bash
# start the agent server on a spare port, and the app on another
PORT=3001 npm run dev

FRONTEND_URL=http://localhost:3001 BACKEND_URL=http://localhost:8001 npm run doctor:online
```

Then:

```bash
cd autorecorder
npm install
npx playwright install chromium

npm run doctor            # is the configuration sane?
npm run record -- --list  # what will be recorded
npm run record -- --quickstart
npm run record            # all pages, in order
```

| Flag | Effect |
|---|---|
| `--list`, `--help` | Print every registered route and exit |
| `--doctor` | Validate the configuration; exits 1 on error |
| `--doctor --online` | Also probe every doc/demo URL and the selectors |
| `--<page-id>` | Record one page — `--quickstart`, `--slots` |
| `--page=<id>` | Same thing, explicit form |
| `--filter=<query>` | Record every page whose id or name contains the query |
| `--force` | Record even if the pre-flight health check fails |

### Testing the actions without filming them

```bash
npm run dryrun                     # every page's action, headless, no video
npm run dryrun -- shared-state     # substring match on the page id
npm run dryrun -- slots --headed   # watch it drive
```

`dryrun` runs exactly what a recording runs on the demo page — the same
`executePageAction`, the same selectors, the same assertions — and skips the doc
page, the IDE simulator and the capture. That turns "did I break a selector?"
from an hour of filming and ~140MB of footage into a few minutes and a pass/fail
table, and it exits 1 on any failure, so it is the thing to gate CI on.

It cannot tell you the cursor rested somewhere useful or the IDE highlighted the
right lines. Run a real recording for that, and watch it.

Videos land in `videos/` as `CLAUDESDK-TS-react-<NN>-<name>.webm`, 1920×1080, ~25fps
(Playwright's capture rate; it is not configurable).

**`videos/` is gitignored on purpose.** Recordings are build output — reproducible
from this folder plus `npm run record` — and committing them is expensive: 17 clips
at ~5MB, rewritten on every re-record, took one repo's `.git` to 348MB before its
history had to be rewritten. Publish them as release assets or to a bucket. Keep
this policy when you copy the folder into another repo.

---

## Scope in this repo

A page is recordable only if it has something to drive, and the recorder reaches
every demo at `<route>/demo-chat`. This app tracks 29 doc routes; the 2 that carry no
`demo-chat` page are reference material and are deliberately **not** registered.

Registering one anyway would fail `doctor --online`, because `demoUrl` is always
`route + demoSuffix` and there is no per-page way to say "this one has no demo".
That is a gap in `core/`, not something to work around here — see ADAPT.md.

**Two registered routes currently return 500** and therefore fail both
`doctor --online` and their recording: `/shared-state/streaming/demo-chat` and
`/generative-ui/state-rendering/demo-chat`, which redirects to it. The cause is in
the frontend, not here — `shared-state/streaming/demo-chat/page.tsx` was reduced to
the doc's published snippet and has no default export, so Next cannot render the
route. They are left registered on purpose: dropping a page to make the doctor
exit 0 hides the finding, which ADAPT.md is explicit about.

**This list is derived, not hand-written.** `config/pages.config.ts` is generated
from `frontend/src/lib/nav-config.ts` — the app's own source of truth for route →
doc-page mapping — so the recorder cannot drift from the nav. Re-derive it when the
nav changes, then re-check the line ranges.

**So are the prompts.** Every route's notes page carries a
`<TryIt prompts={…} expect={…} fail={…} />` block — this repo's own declaration of
what to send, what a pass looks like and what a failure looks like. Each entry in
`pages.config.ts` is copied from that block, and each handler's assertion is the
matching `expect`/`fail` line executed rather than described.

That coupling is the point. A recorder with prompts of its own invention can film
a page doing something the route never claimed, and a green run then means
nothing. Where a `<TryIt>` entry is an instruction to the reader rather than
chat text — "Drag a PNG onto the composer, then ask: what is in this image?",
"Click “Try a sample audio”, then send" — the handler performs the action and the
registry carries the typed half, with a comment saying so. **When you change a
`<TryIt>` block, change the matching page entry.**

**Most pages have a handler — 22 of the 27.** Three routes fall through to
`runStandardAction`, the ones where sending a prompt genuinely *is* the whole
demonstration: Quickstart, CopilotChat and CSS Customization. (The other two
without a handler are the pair that 500 above.) Everywhere else a
reply arriving and the feature working are different claims, and only the handler
can tell them apart:

| Page | What a prompt-and-wait handler would have missed |
|---|---|
| Frontend Tools | The agent answers in prose whether or not the browser-side handler ran. The handler reads the page state the tool is supposed to mutate. |
| Human in the Loop | The run *suspends* on the tool call. Nothing further streams until a slot is clicked, so prompt-and-wait hangs and then reports the page dead. |
| Slots | The `welcomeScreen` override **is** the chat while the message list is empty. Prompting first destroys two thirds of the page's subject. |
| Headless UI, Copilot Runtime | Neither renders CopilotKit chrome, so the global selectors match nothing. Both get their own input selector, including for the readiness gate. |
| Agent Config | One turn cannot distinguish a config being honoured from one being ignored. Two turns, with the form changed in between, can. |
| A2UI dynamic schema | The drawn surface *is* the reply; the agent often emits no text at all, so the shared text detector times out on a working page. |
| Multimodal, Voice | The `attachments` config and the transcription path are invisible until a file is attached or the sample clip fires. |

Four routes are **documented gaps** rather than failures — Tool Call Rendering,
A2UI fixed schema, Sub-Agents, and the scratch-pad half of Shared State. Each
depends on a *backend* tool, and registering one needs `buildBackendToolServer`,
which the Quickstart calls and no doc page defines. Their handlers look for the
feature, say in the run log that it did not appear and why, and pass on the reply
alone — so the recording shows the gap instead of either hiding it or failing a
correctly wired page. The day a bridge is published they start reporting success
without being edited.

**Selectors come from CopilotKit's own test ids.** `copilot-chat-textarea`,
`copilot-send-button`, `copilot-assistant-message` and friends are shipped by the
library and are identical across `<CopilotChat>`, `<CopilotSidebar>` and
`<CopilotPopup>` — which is why one contract in `selectors.config.ts` covers all
three, and why the send button is now clicked rather than fallen back from to the
Enter key. `actions/_shared.ts` collects them in one place as `CPK`.


---

## Tracking recordings

Clips are **not** in git, and every run overwrites the same 16 filenames in place
— so nothing about the files themselves says which are fresh. `npm run manifest`
is what closes that gap:

```bash
npm run record            # produces the clips
npm run manifest          # records their state — run this straight after
```

It writes two committed files next to the (uncommitted) videos:

| File | For |
|---|---|
| `videos/manifest.json` | source of truth — per clip: mtime, size, sha256, the source files it shows, and a hash of those files plus the page definition |
| `videos/MANIFEST.md` | the same thing as a table, readable on GitHub |

Commit both. **The diff on those files is the record of what a run changed** —
that is the whole mechanism. Together they are ~12KB, against ~84MB of video.

| Status | Means |
|---|---|
| ✅ current | clip matches the code it shows |
| 🆕 new | the clip changed since the last manifest — this run re-recorded it |
| ⚠️ stale | a source file was modified *after* the clip was recorded |
| ⚠️ drifted | mtimes look fine but the source content hash moved (mtimes all reset on a fresh clone, which hides staleness — this catches it) |
| ❌ missing | a registered page with no clip on disk |

A clip is judged against the files it actually puts on screen — its `ideFile` and
any `extraTabs` — plus its own page definition, so changing a prompt or a
highlighted line range marks it stale exactly as an edit to the code does.

`npm run manifest:check` prints without writing and exits 1 if anything is stale
or missing, which is the form to put in CI.

**What it does not tell you: whether the run passed.** Playwright saves the video
even when a page fails, so a clip from a failed run still looks current. Freshness
and correctness are different questions — the run summary answers the second one.

---

## Reading the summary

```
   ✅ [PASS]  (24.1s) Quickstart -> MSPY-react-01-Quickstart.webm
   ⚠️  [PASS*] (31.7s) Inspector -> MSPY-react-06-Inspector.webm
        · Doc page (…/inspector): Timeout 25000ms exceeded
   ❌ [FAIL]  (19.4s) AG-UI -> MSPY-react-17-AgUi.webm
        · Demo step failed: Agent never produced a response within 30s
```

- **PASS** — every step completed.
- **PASS\*** — recorded, but the external doc page misbehaved. The intro footage
  is degraded; the feature under test is not implicated.
- **FAIL** — the demo route 404'd, never rendered a chat surface, the agent never
  answered, or the IDE view could not be built. The process exits 1, so this is
  safe to gate CI on.

---

## Layout

The split between what you edit and what you don't is the point of this folder.

```
autorecorder/
├── ADAPT.md                    ← how to port this; read before editing
├── cli.ts                      ← entrypoint, arg parsing, summary
│
├── config/                     ← ★ THE ADAPTATION SURFACE
│   ├── project.config.ts         framework slug, doc root, URLs, start commands
│   ├── pages.config.ts           one entry per doc page
│   └── selectors.config.ts       how to find the chat surface
│
├── actions/                    ← ★ what to DO on each page
│   ├── index.ts                  page id → handler registry
│   └── *.action.ts               per-page interaction scripts
│
├── core/                       ← ✖ DO NOT EDIT — no framework knowledge here
│   ├── engine.ts                 browser lifecycle, the 3-step sequence, pass/fail
│   ├── actions.ts                sendPrompt, response detection, standard action
│   ├── doctor.ts                 the adaptation contract, as a command
│   ├── diagnostics.ts            pre-flight health check
│   ├── types.ts                  PageDefinition → PageRecordConfig
│   ├── ide/generator.ts          VS Code simulator, Shiki-highlighted from disk
│   └── overlays/                 Windows 11 taskbar + virtual cursor
│
└── videos/                     ← output
```

Every framework-specific value lives in `config/`. If something in `core/` needs
to change for a port, that is a bug in this folder — see ADAPT.md.

---

## What a recording actually does

1. **Doc page** — opens the real documentation URL, waits for hydration, then
   scrolls at reading pace and rests the cursor on a code block. Clicks VS Code
   on the simulated taskbar.
2. **IDE** — renders the project's own source, read from disk and highlighted
   with Shiki, with the page's line range selected. Multi-tab pages switch tabs.
   Served from the frontend's origin via an intercepted route, so the doc page is
   fully unloaded rather than painted over. Clicks Chrome on the taskbar.
3. **Demo** — opens the chrome-free demo route, waits for it to be genuinely
   ready, types the prompt, waits for the reply to finish streaming, and pauses
   for reading.

Two details worth knowing, because both were bugs once:

- Overlays are injected as children of `<html>`, which React owns on any App
  Router page. `ensureOverlays` installs a MutationObserver that re-attaches them
  if a render pass deletes them, and step 1 waits for hydration before scrolling
  so a remount cannot snap the page back to the top.
- Playwright starts recording when the page is created, so the first navigation
  is dead footage. The doc URL is warmed in a throwaway page first, which cuts
  it roughly in half; removing the rest would need an ffmpeg trim in post.
- A dev server serves markup before it serves behaviour. "The route responded"
  and "the chat works" are different claims: client chunks compile lazily, and
  API routes compile on their *first request* — which would otherwise be the
  prompt. `actions/page-ready.ts` waits for the document to finish, the DOM to
  stop changing, the input to be genuinely enabled, and `runtimeWarmPath` to be
  built, before any handler types anything. Without it a cold route produces a
  video of a prompt that was never really sent.

---

## Known issues found while building this

### `/shared-state/rendering-in-app` — the agent cannot see the page's ticks

Not exercised by the recording, which only asks the agent to add an item. Found
by hand, and worth knowing before anyone adds a tick-then-ask step back.

Ask for a packing list, tick one of the items the agent wrote, then ask which
items are ticked. It answers:

> based on the current list, none of the items have been ticked off yet — all 4
> are still unchecked.

The frontend is not at fault, and it is worth being precise about that because
the route's own notes page blames it ("ticks the agent cannot see means setState
is not round-tripping"). Capturing the POST to `/api/copilotkit` on that turn
shows the tick reaching the wire intact:

```json
"state": { "title": "Weekend Trip Packing List",
           "items": [ { "id": "clothes", "label": "Clothes & extra layers", "done": true }, ... ] }
```

`toggleItem` → `agent.setState` → run input works end to end. What does not
happen is the model being shown it. `ClaudeAgentAdapter` caches a Claude Code
session per `threadId` and resumes it, sending only the newest message — so on a
resumed turn the model reads the state that session already held rather than the
state this request carried. It is the same session-cache behaviour the Components
as Tools route documents from the other direction.

Reproduced three times before the recording flow was narrowed.

### `/programmatic-control` — the demo and its notes page disagree

The notes page's `<TryIt>` block drives four controls — `addMessage only`,
`runAgent`, `addMessage + runAgent`, `stopAgent` — and an event log "on the
right" showing `onRunStartedEvent → onRunFinalized` per turn. The demo renders
two buttons (`Run agent`, `Stop`), a `<CopilotSidebar>`, and no event log; its
own header says `PARTIAL CODE - AND IMPORTS ARE MISSING`.

The handler drives what is actually there — Run agent, wait 10s, Stop, Run agent
again — so the route passes, but the recording shows less than the notes page
promises. Either the demo needs the
missing controls or the `<TryIt>` block needs trimming to match; that is a call
for whoever owns the route, not for the recorder.

---

## Troubleshooting

**`Aborting before launching a browser`** — a service is down. The message names
which one and the command to start it. `--force` overrides.

**A page fails with "Agent never produced a response within 30s"** — either the
demo is genuinely broken, or `selectors.config.ts → assistantMessage` does not
match this app's messages. Run `npm run doctor --online` to tell the two apart.

**The IDE highlights the wrong lines** — the line range drifted. `npm run doctor`
names the file and where its markers actually are now.

**A page fails only on the first run after starting the dev server** — it was
still compiling. The readiness gate absorbs this (it will log
`agent endpoint compiled in Ns` when it did real work), but the *agent's* own
cold start is separate: the first model call after starting the backend can take
~60s, which is longer than the 30s response window. Send one message by hand, or
record a single page, before running the full suite.

**A recording passes but the video is wrong** — the doctor cannot see cursor
placement or highlight correctness. Watch it.
