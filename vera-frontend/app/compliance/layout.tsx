import type { ReactNode } from "react";
import { VeraAlwaysOnChrome } from "@/src/components/navigation";

export default function ComplianceLayout({ children }: { children: ReactNode }) {
  return (
    <VeraAlwaysOnChrome homeHref="/compliance">
      <div className="min-h-[calc(100vh-8rem)] bg-zinc-50 text-zinc-900">
        {children}
      </div>
    </VeraAlwaysOnChrome>
  );
}
