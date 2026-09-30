"use client";

import { useRef, useState } from "react";
import { addTestAttachment, type SubstanceTestEvent } from "@/lib/pm-substance-testing";
import { Button } from "@/components/ui/button";
import { WorkspaceSection } from "@/components/theme/workspace";

type Props = {
  test: SubstanceTestEvent;
  onUpdate: () => void;
};

export function TestDocumentsPanel({ test, onUpdate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState("ccf");
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    try {
      const dataUrl = await readAsDataUrl(file);
      await addTestAttachment(test.id, {
        documentType: docType,
        fileName: file.name,
        mimeType: file.type,
        dataUrl,
      });
      onUpdate();
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkspaceSection
      title="Secure documents"
      description="CCF forms, lab reports, MRO verification, DER notices"
    >
      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-lg border border-[#2A2E33]/10 px-3 py-1.5 text-sm"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
        >
          <option value="ccf">CCF</option>
          <option value="chain_of_custody">Chain of custody</option>
          <option value="lab_report">Lab report</option>
          <option value="mro_verification">MRO verification</option>
          <option value="der_notice">DER notice</option>
          <option value="suspicion_form">Suspicion form</option>
          <option value="other">Other</option>
        </select>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? "Uploading…" : "+ Upload document"}
        </Button>
      </div>

      {test.attachments?.length ? (
        <ul className="mt-4 space-y-2">
          {test.attachments.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-[#2A2E33]/10 px-4 py-2 text-sm"
            >
              <span>
                <span className="font-medium text-[#2A2E33]">{a.fileName ?? "Document"}</span>
                <span className="ml-2 text-xs text-[#64748b]">{a.documentType.replace(/_/g, " ")}</span>
              </span>
              <span className="text-xs text-[#64748b]">
                {new Date(a.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-[#64748b]">No documents uploaded.</p>
      )}
    </WorkspaceSection>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
