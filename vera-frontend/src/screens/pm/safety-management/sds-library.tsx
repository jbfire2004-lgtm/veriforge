"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSdsDocument, fetchSdsDocuments } from "@/lib/safety-management";
import { VeraPageLayout } from "@/src/components/navigation";
import { SfButton, SfCard, SfInput } from "@/src/components/safety-forms/ui";

export default function SdsLibraryPage({ companyId }: { companyId: number }) {
  const [docs, setDocs] = useState<Array<Record<string, unknown>>>([]);
  const [productName, setProductName] = useState("");
  const [manufacturer, setManufacturer] = useState("");

  function reload() {
    void fetchSdsDocuments(companyId).then(setDocs).catch(() => undefined);
  }

  useEffect(() => {
    reload();
  }, [companyId]);

  async function addDoc() {
    if (!productName.trim()) return;
    await createSdsDocument({
      companyId,
      productName: productName.trim(),
      manufacturer: manufacturer.trim() || undefined,
    });
    setProductName("");
    setManufacturer("");
    reload();
  }

  return (
    <VeraPageLayout
      title="SDS library"
      description={
        <>
          Safety Data Sheets and chemical documentation for company #{companyId}.{" "}
          <Link href={`/pm/documents?companyId=${companyId}`} className="text-[var(--sf-primary)] hover:underline">
            Open full document control →
          </Link>
        </>
      }
    >
      <SfCard className="space-y-3 p-5">
        <h2 className="font-medium">Add SDS</h2>
        <SfInput
          placeholder="Product name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <SfInput
          placeholder="Manufacturer"
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
        />
        <SfButton type="button" onClick={() => void addDoc()}>
          Save document
        </SfButton>
      </SfCard>

      <SfCard className="p-5">
        <h2 className="mb-3 font-medium">Documents ({docs.length})</h2>
        <ul className="divide-y text-sm">
          {docs.map((d) => (
            <li key={String(d.id)} className="py-2">
              <span className="font-medium">{String(d.productName)}</span>
              {d.manufacturer ? (
                <span className="text-[var(--sf-text-muted)]">
                  {" "}
                  — {String(d.manufacturer)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </SfCard>
    </VeraPageLayout>
  );
}
