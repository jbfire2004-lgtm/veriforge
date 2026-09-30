import Link from "next/link";
import { VeriForgeDocSection, VeriForgeDocTemplate } from "@/components/veriforge";
import { VERIFORGE_SUPPORT_NAV } from "./content";

export default function SupportHomePage() {
  return (
    <VeriForgeDocTemplate
      title="VeriForge Support Center"
      summary="Fast, structured assistance with forged-metal UX, angular workflows, and precision support operations."
      version="v1.0.0-forge-support"
      lastUpdated="2026-07-08"
      author="VeriForge Support Engineering"
    >
      <VeriForgeDocSection title="Support Index">
        <div className="grid gap-2 md:grid-cols-2">
          {VERIFORGE_SUPPORT_NAV.map((item) => (
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

