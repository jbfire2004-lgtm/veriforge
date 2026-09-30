import type { ReactNode } from "react";
import { VeriForgeDocsShell } from "@/components/veriforge";
import { VERIFORGE_SUPPORT_NAV } from "./content";

export default function SupportLayout({ children }: { children: ReactNode }) {
  return (
    <VeriForgeDocsShell
      navItems={[...VERIFORGE_SUPPORT_NAV]}
      railLabel="/support"
      title="Support Center"
      subtitle="Reliability Response Rail"
      searchPlaceholder="Search support..."
    >
      {children}
    </VeriForgeDocsShell>
  );
}

