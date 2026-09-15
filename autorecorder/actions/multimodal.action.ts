import { type Page } from 'playwright';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { CPK, assertNoErrorBanner, clickLikeAPerson, restOn, sleep } from './_shared';

/**
 * Attaching a file, which is the only thing this page is about.
 *
 * Sending a text prompt here would record a video indistinguishable from
 * /prebuilt-components/chat: the `attachments` config -- `enabled`, `accept`,
 * `maxSize`, and the `onUpload` that turns a File into an AG-UI content part --
 * is entirely invisible until something is actually attached.
 *
 * The image is generated here rather than committed as a fixture. It is a 1x1
 * PNG, the smallest thing that satisfies `accept: "image/*"`, and inlining it
 * keeps the recorder self-contained -- a fixture file is one more thing to lose
 * when this folder is copied into the next framework's repo.
 *
 * The upload goes through the hidden `<input type="file">` rather than the
 * paperclip's file chooser. Same code path -- CopilotKit listens for the input's
 * change event either way -- but a native file dialog is browser chrome, so
 * driving it would leave the recording showing a pause and nothing else.
 */
const PNG_1X1_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const FILE_INPUT = 'input[type="file"]';

export const runMultimodalAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Multimodal] Showing the attachment control in the composer...`);
  await restOn(page, page.locator(CPK.addMenuButton).first(), 1500);

  console.log(`   [Multimodal] Attaching a PNG through the composer's file input...`);
  const fileInput = page.locator(FILE_INPUT).first();
  await fileInput.waitFor({ state: 'attached', timeout: 15000 });
  await fileInput.setInputFiles({
    name: 'swatch.png',
    mimeType: 'image/png',
    buffer: Buffer.from(PNG_1X1_BASE64, 'base64'),
  });

  // `onUpload` is async (it reads an ArrayBuffer and base64-encodes it), so the
  // preview appears a tick later. Its absence means the handler threw or the
  // file was rejected by `accept`/`maxSize` -- either way the attachment never
  // became a content part and the prompt below would be an ordinary text turn.
  const preview = page.locator(`${CPK.chat} img, ${CPK.chat} [class*="attachment" i]`).first();
  const attached = await preview
    .waitFor({ state: 'visible', timeout: 15000 })
    .then(() => true)
    .catch(() => false);

  if (!attached) {
    throw new Error(
      'No attachment preview appeared after setting a file on the composer input. ' +
        'The `onUpload` handler rejected the file or threw -- check the browser ' +
        'console for the `[multimodal] upload failed` line the page logs.',
    );
  }
  console.log(`   ✓ attachment accepted and previewed in the composer.`);
  await restOn(page, preview, 2000);

  console.log(`   [Multimodal] Asking about the attached image...`);
  const before = await sendPrompt(page, config.prompt);
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, before);
  await assertNoErrorBanner(page);
  await sleep(200);
};

/**
 * The Voice route, driven through its sample-audio button rather than the mic.
 *
 * The mic control exists because `/api/copilotkit-voice` advertises
 * `audioFileTranscriptionEnabled`, and clicking it opens a permission prompt --
 * browser chrome, invisible on video, and needing OPENAI_API_KEY behind it.
 * The page ships `SampleAudioButton` precisely so the route can be exercised
 * without either, by pushing a canned transcript through the same
 * `insertIntoComposer` path a real transcription would take.
 *
 * So the check that matters is that the composer ends up holding text nobody
 * typed. That is the whole transcription contract: the native value setter plus
 * a synthetic `input` event, so React's managed state actually updates.
 */
const SAMPLE_BUTTON = '[data-testid="voice-sample-audio-button"]';
const MIC_BUTTON = '[data-testid="copilot-start-transcribe-button"]';

export const runVoiceAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [Voice] The mic button exists because this route has its own runtime...`);
  await restOn(page, page.locator(MIC_BUTTON).first(), 1800);

  console.log(`   [Voice] Playing the sample clip instead of opening a mic prompt...`);
  await clickLikeAPerson(page, page.locator(SAMPLE_BUTTON).first(), 'sample audio');
  await sleep(1200);

  const textarea = page.locator(CPK.textarea).first();
  const transcript = (await textarea.inputValue().catch(() => '')).trim();
  if (!transcript) {
    throw new Error(
      'The composer is still empty after the sample-audio button fired: the ' +
        'transcript never reached it. `insertIntoComposer` targets ' +
        '[data-testid="copilot-chat-textarea"] and sets the value through the ' +
        "native setter -- check that test id still exists on this app's composer.",
    );
  }
  console.log(`   ✓ transcript landed in the composer: "${transcript}"`);
  await restOn(page, textarea, 1800);

  // Submit what the transcription produced, not a prompt of our own -- sending
  // the transcript is what closes the loop this page describes.
  const before = await page.locator(CPK.assistantMessage).count().catch(() => 0);
  await clickLikeAPerson(page, page.locator(CPK.send).first(), 'send');
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, before);
  await assertNoErrorBanner(page);
};
