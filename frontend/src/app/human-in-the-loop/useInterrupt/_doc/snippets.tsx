// The two generic snippets on
// https://docs.copilotkit.ai/claude-sdk-typescript/human-in-the-loop/useInterrupt
// ("Approve / Cancel example" and "Multi-interrupt behavior"), verbatim between
// the markers. Type-checked, never rendered: `_doc` is a private folder and
// nothing imports it. Harness glue: the import line, and a function wrapper
// around the second snippet (printed as a bare hook call).
import { useInterrupt } from "@copilotkit/react-core/v2";

// --- snippet: Approve / Cancel example ---
function ApprovalInterrupt() {
  useInterrupt({
    render: ({ interrupt, resolve, cancel }) => (
      <div className="p-3 border rounded">
        <p>{interrupt?.message ?? "Approve this action?"}</p>
        <div className="mt-2 flex gap-2">
          <button onClick={() => resolve({ approved: true })}>Approve</button>
          <button onClick={() => cancel()}>Cancel</button>
        </div>
      </div>
    ),
  });
  return null;
}
// --- end ---

function MultiInterrupt() {
  // --- snippet: Multi-interrupt behavior ---
  useInterrupt({
    render: ({ interrupts, resolve, cancel }) => (
      <ul>
        {interrupts.map((i) => (
          <li key={i.id}>
            {i.message}
            <button onClick={() => resolve({ ok: true }, i.id)}>Approve</button>
            <button onClick={() => cancel(i.id)}>Cancel</button>
          </li>
        ))}
      </ul>
    ),
  });
  // --- end ---
  return null;
}

export { ApprovalInterrupt, MultiInterrupt };
