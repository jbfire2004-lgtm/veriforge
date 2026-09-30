import type { ReactNode } from "react";
import { VeriForgeDocsShell } from "@/components/veriforge";
import { VERIFORGE_SALES_PLAYBOOK_NAV } from "./content";

export default function SalesPlaybookLayout({ children }: { children: ReactNode }) {
  return (
    <VeriForgeDocsShell
      navItems={[...VERIFORGE_SALES_PLAYBOOK_NAV]}
      railLabel="/sales-playbook"
      title="Sales Playbook"
      subtitle="Revenue Reliability Rail"
      searchPlaceholder="Search playbook..."
    >
      {children}
    </VeriForgeDocsShell>
  );
}

