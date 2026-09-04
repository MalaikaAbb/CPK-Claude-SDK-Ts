"use client";

/**
 * The preferences form the doc's `handlePreferencesChange` is named for.
 *
 * https://docs.copilotkit.ai/claude-sdk-typescript/shared-state
 *
 * The page never publishes this component — only the handler that receives
 * its output and the `Preferences` type in its backend snippet. This is the
 * repo's own form: every edit calls `onChange` with the next full
 * `Preferences` object, and the parent pushes that into agent state.
 */

export interface Preferences {
  name?: string;
  tone?: "formal" | "casual" | "playful";
  language?: string;
  interests?: string[];
}

const TONES: NonNullable<Preferences["tone"]>[] = ["formal", "casual", "playful"];

const fieldClass =
  "w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";
const labelClass =
  "block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400";

export function PreferencesPanel({
  value,
  onChange,
}: {
  value: Preferences;
  onChange: (next: Preferences) => void;
}) {
  return (
    <section
      data-testid="preferences-panel"
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Your preferences
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Written into agent state on every edit. The agent reads them on its next
        turn.
      </p>

      <div className="mt-4 space-y-3">
        <label className="space-y-1">
          <span className={labelClass}>Name</span>
          <input
            data-testid="pref-name"
            className={fieldClass}
            value={value.name ?? ""}
            placeholder="Ada"
            onChange={(e) =>
              onChange({ ...value, name: e.target.value || undefined })
            }
          />
        </label>

        <label className="space-y-1">
          <span className={labelClass}>Tone</span>
          <select
            data-testid="pref-tone"
            className={fieldClass}
            value={value.tone ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                tone: (e.target.value || undefined) as Preferences["tone"],
              })
            }
          >
            <option value="">(none)</option>
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className={labelClass}>Language</span>
          <input
            data-testid="pref-language"
            className={fieldClass}
            value={value.language ?? ""}
            placeholder="English"
            onChange={(e) =>
              onChange({ ...value, language: e.target.value || undefined })
            }
          />
        </label>

        <label className="space-y-1">
          <span className={labelClass}>Interests (comma separated)</span>
          <input
            data-testid="pref-interests"
            className={fieldClass}
            value={(value.interests ?? []).join(", ")}
            placeholder="TypeScript, sailing"
            onChange={(e) => {
              const interests = e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              onChange({
                ...value,
                interests: interests.length ? interests : undefined,
              });
            }}
          />
        </label>
      </div>
    </section>
  );
}
