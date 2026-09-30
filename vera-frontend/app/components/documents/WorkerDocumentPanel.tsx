"use client";

import { useEffect, useState } from "react";
import { DocumentList } from "./DocumentList";
import { DocumentUploadButton } from "./DocumentUploadButton";
import { DocumentIntelligencePanel } from "./DocumentIntelligencePanel";

export function WorkerDocumentPanel({ workerId }: { workerId: number }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [lastUpload, setLastUpload] = useState<{ id?: number; name?: string } | null>(null);

  async function load() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/documents/worker/${workerId}`
    );
    setDocs(await res.json());
  }

  useEffect(() => {
    load();
  }, [workerId]);

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Worker Documents</h2>
        <DocumentUploadButton
          target={{ workerId }}
          onUpload={(data) => {
            const row = data as { id?: number; name?: string };
            setLastUpload(row?.id ? { id: row.id, name: row.name } : null);
            void load();
          }}
        />
      </div>

      {lastUpload?.id ? (
        <DocumentIntelligencePanel
          documentId={lastUpload.id}
          fileName={lastUpload.name}
          workerId={workerId}
        />
      ) : null}

      <DocumentList documents={docs} />
    </div>
  );
}
