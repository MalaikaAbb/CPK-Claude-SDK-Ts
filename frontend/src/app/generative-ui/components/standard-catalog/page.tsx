import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, KeyValue, Panel, TryIt } from "@/components/ui";

const GROUPS: [string, string][] = [
  ["Layout (14)", "Box, Column, Row, Grid, GridItem, Card, Flow, FlowItem, Carousel, CarouselItem, CarouselMediaItem, Spacer, Divider, Tabs"],
  ["Text (16)", "Title, Text, Caption, Label, Bold, Italic, Underline, Strikethrough, Badge, Blockquote, Code, Markdown, Math, ShimmerText, Link, Tooltip"],
  ["Inputs (13)", "Button, Pressable, Form, TextField, TextArea, Select, CheckBox, Radio, RadioGroup, Slider, SegmentedControl, ChoicePicker, DateTimeInput"],
  ["Data (8)", "Table, TableSection, TableRow, TableCell, List, ListItem, Chart, Map"],
  ["Media (7)", "Image, Icon, Favicon, Svg, Video, AudioPlayer, HtmlView"],
  ["Feedback & overlay (6)", "PulseIndicator, FlashcardFlip, Popover, PopoverTrigger, PopoverContent, Modal"],
  ["Composites (5)", "LinkCard, Citation, FollowUp, EntityCard, ImageGrid"],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/standard-catalog" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>standardUI</code> is a ready-made catalog of 69 components the
          agent already knows how to use. The demo has a switch for each of
          the page&apos;s four ways to use it: <strong>as-is</strong>,{" "}
          <strong>extend</strong> (adds a ProductCard),{" "}
          <strong>omit</strong> (drops Map, Video and HtmlView to save
          prompt tokens) and <strong>override</strong> (Card drawn by your own
          component). The header shows how many components are live.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show a bar chart of monthly signups: Jan 120, Feb 180, Mar 240.",
              "Build a signup form with an email field that must be a valid email, and a Submit button.",
              "Put three facts about Mars in tabs.",
              "Show a card with a title and one sentence. (try in Override)",
              "Embed a YouTube video about A2UI. (try in Omit)",
            ]}
            expect="A Recharts bar chart; a Form whose Submit stays disabled until the email is valid; working Tabs. In Override the Card has a large radius and shadow. In Omit the agent says it can't embed video, or uses a link instead."
            fail="Plain text where a component was expected: check the Inspector's Catalog tab for the variant. A Map that falls back to a list of places means maplibre-gl failed to load."
          />
        </div>
      </Panel>

      <Panel title="The 69 components">
        <KeyValue rows={GROUPS} />
        <p className="mt-3 text-xs text-slate-500">
          Each component has its own doc page under{" "}
          <code>/generative-ui/components/standard-catalog/&lt;name&gt;</code>.
          They aren&apos;t tracked as separate routes here.
        </p>
      </Panel>

      <Panel title="Behaviors worth testing">
        <Callout tone="info">
          <ul className="list-disc space-y-1 pl-4">
            <li><code>checks</code> follow A2UI&apos;s Checkable rules, and a Button with a failing check is disabled. Validator codes: required, pattern, tooShort, tooLong, notANumber, tooSmall, tooLarge, email. Severity <code>warning</code>/<code>info</code> shows the message but doesn&apos;t block.</li>
            <li>Inputs keep the user&apos;s edits when the agent sends later updates.</li>
            <li>Video embeds YouTube on play, and shows a link card for other sites.</li>
            <li>Map needs <code>maplibre-gl</code> (installed here, <code>^5</code>; without it Map degrades to a list).</li>
            <li>Chart uses the bundled Recharts.</li>
            <li>The Express signatures changed from the older style-first catalog, so start a fresh chat after upgrading.</li>
          </ul>
        </Callout>
      </Panel>

      <Panel title="Source">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/components/standard-catalog/variants.tsx" },
            { file: "frontend/src/app/generative-ui/components/standard-catalog/demo-chat/page.tsx" },
          ]}
          note={<>The extend snippet&apos;s <code>ProductCard</code> and <code>productSchema</code> are undefined on the page; the pair in <code>variants.tsx</code> is repo code.</>}
        />
      </Panel>
    </>
  );
}
