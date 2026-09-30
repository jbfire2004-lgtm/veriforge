import type { ReactNode } from "react";
import { VeriForgeDocsShell } from "@/components/veriforge";
import { VERIFORGE_PARTNER_NAV } from "./content";

export default function PartnerProgramLayout({ children }: { children: ReactNode }) {
  return (
    <VeriForgeDocsShell
      navItems={[...VERIFORGE_PARTNER_NAV]}
      railLabel="/partners"
      title="Partner Program"
      subtitle="Industrial Alliance Rail"
      searchPlaceholder="Search partner program..."
    >
      {children}
    </VeriForgeDocsShell>
  );
}

