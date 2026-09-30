"use client";

import { useEffect, useState } from "react";
import { DocumentList } from "./DocumentList";
import { DocumentUploadButton } from "./DocumentUploadButton";

export function CompanyDocumentPanel({ companyId }: { companyId: number }) {
  const [docs, setDocs] = useState<any[]>([]);

  async function load() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/documents/company/${companyId}`
    );
    setDocs(await res.json());
  }

  useEffect(() => {
    load();
  }, [companyId]);

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Company Documents</h2>
        <DocumentUploadButton target={{ companyId }} onUpload={load} />
      </div>

      <DocumentList documents={docs} />
    </div>
  );
}
