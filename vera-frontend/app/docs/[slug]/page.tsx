import { notFound } from "next/navigation";
import {
  VeriForgeCodeBlock,
  VeriForgeDiagram,
  VeriForgeDocSection,
  VeriForgeDocSteps,
  VeriForgeDocTemplate,
} from "@/components/veriforge";
import { VERIFORGE_DOC_CONTENT } from "../content";

export default async function DocsSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = VERIFORGE_DOC_CONTENT[slug];
  if (!doc) notFound();

  return (
    <VeriForgeDocTemplate
      title={doc.title}
      summary={doc.summary}
      version={doc.version}
      lastUpdated={doc.lastUpdated}
      author={doc.author}
    >
      <VeriForgeDocSection title="Operational Steps">
        <VeriForgeDocSteps steps={doc.steps} />
      </VeriForgeDocSection>

      <VeriForgeDocSection title="Implementation Example">
        <VeriForgeCodeBlock language={doc.code.language} code={doc.code.content} />
      </VeriForgeDocSection>

      <VeriForgeDocSection title="Architecture Diagram">
        <VeriForgeDiagram title={doc.diagram.title} lines={doc.diagram.lines} />
      </VeriForgeDocSection>
    </VeriForgeDocTemplate>
  );
}

