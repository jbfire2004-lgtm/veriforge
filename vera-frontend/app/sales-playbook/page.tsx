import Link from "next/link";
import {
  VeriForgeDocSection,
  VeriForgeDocTemplate,
} from "@/components/veriforge";
import { VERIFORGE_SALES_PLAYBOOK_NAV } from "./content";

export default function SalesPlaybookHomePage() {
  return (
    <VeriForgeDocTemplate
      title="VeriForge Sales Playbook"
      summary="Complete forged-metal sales execution system for positioning, scripts, objections, demo flow, closing, and follow-up."
      version="v1.0.0-forge-sales"
      lastUpdated="2026-07-08"
      author="VeriForge Revenue Systems"
    >
      <VeriForgeDocSection title="Playbook Index">
        <div className="grid gap-2 md:grid-cols-2">
          {VERIFORGE_SALES_PLAYBOOK_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border border-[var(--vf-color-steel-grey)] bg-[#1f1f1f] px-3 py-2 text-sm text-[#d3d3d3] transition hover:border-[var(--vf-color-forge-red)] hover:bg-[rgba(198,40,40,.14)]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </VeriForgeDocSection>
    </VeriForgeDocTemplate>
  );
}

