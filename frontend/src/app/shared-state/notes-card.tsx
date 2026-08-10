"use client";

/**
 * PARTIAL CODE — THE DOC'S PUBLISHED COMPONENT, VERBATIM. IT DOES NOT COMPILE.
 *
 * https://docs.copilotkit.ai/claude-sdk-typescript/shared-state
 *
 * The page publishes the whole body of
 * `src/app/demos/shared-state-read-write/notes-card.tsx`, reproduced below
 * unchanged.
 *
 * What it does not publish, and what is therefore missing:
 *
 *   - the `NotesCardProps` type in the signature
 *   - imports for `Card`, `CardHeader`, `CardTitle`, `CardDescription`,
 *     `CardContent` and `Button` — these are shadcn/ui components from the
 *     showcase's own component library, which is never shown and is not a
 *     dependency of this repo
 *
 * This file previously held an adaptation with those imports swapped for plain
 * elements and a local prop type. That adaptation was this repo's, not the
 * doc's, and has been removed.
 */

// Read-side render: this card reflects the agent-authored `notes` slice
// of shared state. The parent page passes `state.notes` in; we never
// touch agent state ourselves — we just render it. The Clear button is
// a small write-back, exposed as an `onClear` prop.
export function NotesCard({ notes, onClear }: NotesCardProps) {
  return (
    <Card data-testid="notes-card" className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle>Agent Scratch pad</CardTitle>
            <CardDescription>
              The agent writes here via its{" "}
              <code className="font-mono text-[11px] text-[#010507]">
                set_notes
              </code>{" "}
              tool. The UI re-renders from shared state.
            </CardDescription>
          </div>
          {notes.length > 0 && (
            <Button
              type="button"
              onClick={onClear}
              data-testid="notes-clear-button"
              variant="destructive"
              size="sm"
              className="uppercase tracking-[0.14em] text-[10px]"
            >
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {notes.length === 0 ? (
          <div
            data-testid="notes-empty"
            className="text-sm text-[#838389] italic min-h-[160px] flex items-center justify-center text-center px-4 border border-dashed border-[#E9E9EF] rounded-xl bg-[#FAFAFC]"
          >
            the agent will make observations about you and note them here!
          </div>
        ) : (
          <ul
            data-testid="notes-list"
            className="space-y-2 text-sm text-[#010507]"
          >
            {notes.map((note, i) => (
              <li
                key={i}
                data-testid="note-item"
                className="flex gap-2 rounded-lg border border-[#E9E9EF] bg-[#FAFAFC] px-3 py-2"
              >
                <span className="text-[#838389] font-mono text-xs leading-5 select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{note}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
