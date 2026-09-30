import type { ReactNode } from "react";
import { VeraAlwaysOnChrome } from "@/src/components/navigation";

export default function VeriForgeRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <VeraAlwaysOnChrome homeHref="/veriforge/dashboard">
      <div className="veriforge-theme bg-[var(--vf-color-iron-black)]">{children}</div>
    </VeraAlwaysOnChrome>
  );
}
