"use client";

import { redirect } from "next/navigation";

/**
 * The State Rendering page's interactive cell is `shared-state-streaming` —
 * the same demo, same agent, same `useAgent` subscription as
 * /shared-state/streaming. Rather than ship a second copy that would drift,
 * this sends you there.
 */
export default function Page() {
  redirect("/shared-state/streaming/demo-chat");
}
