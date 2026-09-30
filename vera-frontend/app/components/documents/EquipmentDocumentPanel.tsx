"use client";

import { useEffect, useState } from "react";
import { DocumentList } from "./DocumentList";
import { DocumentUploadButton } from "./DocumentUploadButton";

export function EquipmentDocumentPanel({ equipmentId }: { equipmentId: number }) {
  const [docs, setDocs] = useState<any[]>([]);

  async function load() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/documents/equipment/${equipmentId}`
    );
    setDocs(await res.json());
  }

  useEffect(() => {
    load();
  }, [equipmentId]);

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Equipment Documents</h2>
        <DocumentUploadButton target={{ equipmentId }} onUpload={load} />
      </div>

      <DocumentList documents={docs} />
    </div>
  );
}
