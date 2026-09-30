import { readVeriForgeDoc } from "@/src/docs/load-veriforge-doc";
import { renderVeriForgeMarkdown } from "@/src/docs/render-veriforge-markdown";
import {
  allDocSlugs,
  findDocBySlug,
} from "@/src/docs/veriforge-docs-nav";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

export function generateStaticParams() {
  return [{ slug: [] as string[] }, ...allDocSlugs().map((s) => ({ slug: [s] }))];
}

export default async function VeriForgeDocsPage({ params }: PageProps) {
  const { slug: parts } = await params;
  const slug = parts?.join("/") ?? "";
  const doc = findDocBySlug(slug || undefined);
  const md = readVeriForgeDoc(doc.file);
  const nodes = renderVeriForgeMarkdown(md);

  return <>{nodes}</>;
}
