import type { ReactNode } from "react";

/** Lightweight shell — no extra auth or field-mode wrappers beyond the root layout. */
export default function PublicSegmentLayout({ children }: { children: ReactNode }) {
  return children;
}
