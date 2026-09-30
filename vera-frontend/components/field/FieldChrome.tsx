"use client";

import { OfflineBanner } from "./OfflineBanner";

/** App-wide field/offline chrome — banner above main content. */
export function FieldChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}
