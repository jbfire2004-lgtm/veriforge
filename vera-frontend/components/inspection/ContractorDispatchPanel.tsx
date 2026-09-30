"use client";

import { useRef, useState } from "react";
import {
  acknowledgeContractorDispatch,
  completeContractorDispatch,
} from "@/lib/pm-inspection-v2";
import { Button } from "@/components/ui/button";
import { WorkspaceSection } from "@/components/theme/workspace";
import { Camera } from "lucide-react";

type Props = {
  dispatchId: string;
  status: string;
  contractorName?: string;
  findingTitle?: string;
  onUpdated?: () => void;
};

async function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ContractorDispatchPanel({
  dispatchId,
  status,
  contractorName,
  findingTitle,
  onUpdated,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ack() {
    setBusy(true);
    setError(null);
    try {
      await acknowledgeContractorDispatch(dispatchId);
      onUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Acknowledge failed");
    } finally {
      setBusy(false);
    }
  }

  async function completeWithPhoto(file: File) {
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await readAsDataUrl(file);
      await completeContractorDispatch(dispatchId, {
        dataUrl,
        fileName: file.name,
        mimeType: file.type,
        notes: "Correction photo submitted from field",
      });
      onUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkspaceSection
      title="Corrective action — your assignment"
      description={
        findingTitle
          ? `"${findingTitle}" — take a photo of the correction. Proof is sent back to the walk organizer automatically.`
          : "Submit a correction photo when work is complete."
      }
    >
      {contractorName ? (
        <p className="text-sm text-[#64748b]">Assigned to {contractorName}</p>
      ) : null}
      <p className="text-sm capitalize text-[#64748b]">
        Status: {status.replace(/_/g, " ")}
      </p>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void completeWithPhoto(f);
          e.target.value = "";
        }}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {status === "sent" || status === "overdue" ? (
          <Button type="button" size="sm" disabled={busy} onClick={() => void ack()}>
            Acknowledge
          </Button>
        ) : null}
        {["acknowledged", "in_progress", "sent", "overdue"].includes(status) ? (
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="mr-2 h-4 w-4" />
            Photo of correction
          </Button>
        ) : null}
      </div>
    </WorkspaceSection>
  );
}
