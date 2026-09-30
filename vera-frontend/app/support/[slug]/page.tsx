import { notFound } from "next/navigation";
import {
  VeriForgeCodeBlock,
  VeriForgeDiagram,
  VeriForgeDocSection,
  VeriForgeDocSteps,
  VeriForgeDocTemplate,
} from "@/components/veriforge";
import { VERIFORGE_SUPPORT_CONTENT } from "../content";
import {
  SupportKnowledgeBaseWidget,
  SupportStatusWidget,
  SupportTicketsWidget,
  SupportTroubleshootingWidget,
  SupportWorkflowWidget,
} from "../support-widgets";

export default async function SupportSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = VERIFORGE_SUPPORT_CONTENT[slug];
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

      {(slug === "overview" || slug === "tickets") && <SupportWorkflowWidget />}
      {slug === "knowledge-base" && <SupportKnowledgeBaseWidget />}
      {slug === "troubleshooting" && <SupportTroubleshootingWidget />}
      {slug === "tickets" && <SupportTicketsWidget />}
      {slug === "status" && <SupportStatusWidget />}

      <VeriForgeDocSection title="Implementation Example">
        <VeriForgeCodeBlock language={section.code.language} code={section.code.content} />
      </VeriForgeDocSection>

      <VeriForgeDocSection title="Architecture Diagram">
        <VeriForgeDiagram title={section.diagram.title} lines={section.diagram.lines} />
      </VeriForgeDocSection>
    </VeriForgeDocTemplate>
  );
}

