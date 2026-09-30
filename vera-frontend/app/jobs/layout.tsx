import type { ReactNode } from "react";
import { VeraOptionalAuthChrome } from "@/src/components/navigation/VeraOptionalAuthChrome";

export default function JobsLayout({ children }: { children: ReactNode }) {
  return (
    <VeraOptionalAuthChrome homeHref="/hub">
      <div className="mx-auto max-w-5xl px-vera-4 py-vera-8 sm:px-vera-6">{children}</div>
    </VeraOptionalAuthChrome>
  );
}
