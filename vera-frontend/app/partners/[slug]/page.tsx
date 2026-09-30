import { notFound } from "next/navigation";
import {
  VeriForgeCodeBlock,
  VeriForgeDiagram,
  VeriForgeDocSection,
  VeriForgeDocSteps,
  VeriForgeDocTemplate,
} from "@/components/veriforge";
import { VERIFORGE_PARTNER_CONTENT } from "../content";
import {
  PartnerApplyWidget,
  PartnerBenefitsWidget,
  PartnerPortalWidget,
  PartnerResourcesWidget,
  PartnerTierCardsWidget,
} from "../partner-widgets";

export default async function PartnerSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = VERIFORGE_PARTNER_CONTENT[slug];
  if (!section) notFound();

  return (
    <VeriForgeDocTemplate
      title={section.title}
      summary={section.summary}
      version={section.version}
      lastUpdated={section.lastUpdated}
      author={section.author}
    >
      <VeriForgeDocSection title="Operational Steps">
        <VeriForgeDocSteps steps={section.steps} />
      </VeriForgeDocSection>

      {(slug === "overview" || slug === "tiers") && <PartnerTierCardsWidget />}
      {slug === "benefits" && <PartnerBenefitsWidget />}
      {slug === "apply" && <PartnerApplyWidget />}
      {slug === "resources" && <PartnerResourcesWidget />}
      {slug === "portal" && <PartnerPortalWidget />}

      <VeriForgeDocSection title="Implementation Example">
        <VeriForgeCodeBlock language={section.code.language} code={section.code.content} />
      </VeriForgeDocSection>

      <VeriForgeDocSection title="Architecture Diagram">
        <VeriForgeDiagram title={section.diagram.title} lines={section.diagram.lines} />
      </VeriForgeDocSection>
    </VeriForgeDocTemplate>
  );
}

