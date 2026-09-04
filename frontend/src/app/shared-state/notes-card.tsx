"use client";

/**
 * The doc's `NotesCard`, made buildable.
 *
 * https://docs.copilotkit.ai/claude-sdk-typescript/shared-state
 *
 * The page publishes the component body but not its `NotesCardProps` type or
 * its `Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardContent`
 * / `Button` imports, which come from the showcase's shadcn/ui library. This
 * file keeps the published structure and every `data-testid`, and swaps the
 * shadcn pieces for plain elements. The prop type and the markup for those
 * pieces are this repo's.
 */

export interface NotesCardProps {
  notes: string[];
  onClear: () => void;
}

// Read-side render: this card reflects the agent-authored `notes` slice
// of shared state. The parent page passes `state.notes` in; we never
// touch agent state ourselves — we just render it. The Clear button is
// a small write-back, exposed as an `onClear` prop.
export function NotesCard({ notes, onClear }: NotesCardProps) {
  return (
    <section
      data-testid="notes-card"
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Agent Scratch pad
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The agent writes here via its{" "}
            <code className="font-mono text-[11px]">set_notes</code> tool. The
            UI re-renders from shared state.
          </p>
        </div>
        {notes.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            data-testid="notes-clear-button"
            className="rounded-md bg-rose-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-rose-700"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-4">
        {notes.length === 0 ? (
          <div
            data-testid="notes-empty"
            className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm italic text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
          >
            the agent will make observations about you and note them here!
          </div>
        ) : (
          <ul
            data-testid="notes-list"
            className="space-y-2 text-sm text-slate-900 dark:text-slate-100"
          >
            {notes.map((note, i) => (
              <li
                key={i}
                data-testid="note-item"
                className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              >
                <span className="select-none font-mono text-xs leading-5 text-slate-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{note}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
