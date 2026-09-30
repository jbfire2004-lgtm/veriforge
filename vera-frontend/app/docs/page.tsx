import Link from "next/link";
import {
  VERIFORGE_DOCS_NAV,
  VeriForgeDocSection,
  VeriForgeDocTemplate,
} from "@/components/veriforge";

export default function DocsHomePage() {
  return (
    <VeriForgeDocTemplate
      title="VeriForge Documentation"
      summary="Central industrial documentation system for UI, API, database, workflows, onboarding, compliance, and verification."
      version="v1.0.0-forge"
      lastUpdated="2026-07-07"
      author="VeriForge Systems"
    >
      <VeriForgeDocSection title="Documentation Index">
        <div className="grid gap-2 md:grid-cols-2">
          {VERIFORGE_DOCS_NAV.map((item) => (
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

