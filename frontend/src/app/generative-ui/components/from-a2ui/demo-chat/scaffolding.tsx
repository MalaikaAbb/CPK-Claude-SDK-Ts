/**
 * NOT from the doc page. Borrowed from the aws-strands-ts harness
 * (`frontend/src/app/generative-ui/components/_shared/scaffolding.tsx`).
 *
 * The "Adopt from A2UI" page's After catalog registers `Airport` and `Arrow`
 * and defines neither. These are the smallest components matching the props
 * the catalog declares (`code`, `city`; none for `Arrow`).
 */

export function Airport({ code, city }: { code: string; city: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold">{code}</p>
      <p className="text-xs text-slate-500">{city}</p>
    </div>
  );
}

export function Arrow() {
  return <span className="text-2xl">→</span>;
}
