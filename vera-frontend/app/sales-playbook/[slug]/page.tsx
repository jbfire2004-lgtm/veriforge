import { notFound } from "next/navigation";
import {
  VeriForgeCodeBlock,
  VeriForgeDiagram,
  VeriForgeDocSection,
  VeriForgeDocSteps,
  VeriForgeDocTemplate,
} from "@/components/veriforge";
import { VERIFORGE_SALES_PLAYBOOK_CONTENT } from "../content";

export default async function SalesPlaybookSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = VERIFORGE_SALES_PLAYBOOK_CONTENT[slug];
  if (!section) notFound();

  return (
    <VeriForgeDocTemplate
      title={section.title}
      summary={section.summary}
      version={section.version}
      lastUpdated={section.lastUpdated}
      author={section.author}
    >
      <VeriForgeDocSection title="Execution Steps">
        <VeriForgeDocSteps steps={section.steps} />
      </VeriForgeDocSection>

      <VeriForgeDocSection title="Sales Messaging">
        <VeriForgeCodeBlock language={section.script.language} code={section.script.content} />
      </VeriForgeDocSection>

      <VeriForgeDocSection title="Operational Diagram">
        <VeriForgeDiagram title={section.diagram.title} lines={section.diagram.lines} />
      </VeriForgeDocSection>
    </VeriForgeDocTemplate>
  );
}

