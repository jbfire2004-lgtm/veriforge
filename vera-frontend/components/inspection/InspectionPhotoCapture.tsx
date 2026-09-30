"use client";

import { useEffect, useRef, useState } from "react";
import {
  captureInspectionPhoto,
  listProjectInspectionSubcontractors,
  type PhotoCaptureResult,
} from "@/lib/pm-inspection-v2";
import { Camera, CloudOff, Loader2 } from "lucide-react";
import { useFieldMode } from "@/components/field/FieldModeProvider";
import { capturePmInspectionPhotoOffline } from "@/lib/field/workflows/pm-inspection-photo";
import { Button } from "@/components/ui/button";
import { WorkspaceSection } from "@/components/theme/workspace";

type Props = {
  inspectionId: string;
  companyId: number;
  projectId: number;
  defaultSubcontractorCompanyId?: number;
  onComplete?: (result: PhotoCaptureResult | { queued: true; clientSyncId: string }) => void;
};

export function InspectionPhotoCapture({
  inspectionId,
  companyId,
  projectId,
  defaultSubcontractorCompanyId,
  onComplete,
}: Props) {
  const { cache, queue, fieldModeActive, isOnline } = useFieldMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<PhotoCaptureResult | null>(null);
  const [queuedId, setQueuedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subcontractorId, setSubcontractorId] = useState<number | undefined>(
    defaultSubcontractorCompanyId,
  );
  const [subcontractors, setSubcontractors] = useState<Array<{ id: number; name: string }>>([]);

  const useOffline = fieldModeActive && !isOnline;

  useEffect(() => {
    void listProjectInspectionSubcontractors(projectId)
      .then((rows) => {
        setSubcontractors(rows);
        setSubcontractorId((prev) => prev ?? defaultSubcontractorCompanyId ?? rows[0]?.id);
      })
      .catch(() => undefined);
  }, [projectId, defaultSubcontractorCompanyId]);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    setQueuedId(null);

    try {
      if (useOffline) {
        const { clientSyncId } = await capturePmInspectionPhotoOffline(cache, queue, {
          inspectionId,
          companyId,
          projectId,
          photo: file,
          defaultSubcontractorCompanyId: subcontractorId,
        });
        setQueuedId(clientSyncId);
        onComplete?.({ queued: true, clientSyncId });
        return;
      }

      const dataUrl = await readAsDataUrl(file);
      const result = await captureInspectionPhoto(inspectionId, {
        dataUrl,
        fileName: file.name,
        mimeType: file.type,
        clientSyncId: `photo-${Date.now()}`,
        defaultSubcontractorCompanyId: subcontractorId,
      });
      setLastResult(result);
      onComplete?.(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Photo analysis failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkspaceSection
      title="Instant photo capture"
      description={
        useOffline
          ? "Offline — photo queued for OCR, hazard detection, and CAPA when connectivity returns."
          : "Upload triggers vision + LLM analysis, corrective actions, and contractor dispatch when applicable."
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      {subcontractors.length > 1 ? (
        <div className="mb-3">
          <label className="text-xs font-medium text-[#64748b]">Default contractor</label>
          <select
            className="mt-1 block w-full max-w-xs rounded-lg border border-[#2A2E33]/15 px-3 py-2 text-sm"
            value={subcontractorId ?? ""}
            onChange={(e) => setSubcontractorId(parseInt(e.target.value, 10))}
          >
            {subcontractors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : useOffline ? (
            <CloudOff className="h-4 w-4" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
          {busy ? "Processing…" : useOffline ? "Capture (offline queue)" : "Capture photo"}
        </Button>
        {lastResult?.analysisEngine ? (
          <span className="text-xs text-[#64748b]">Engine: {lastResult.analysisEngine}</span>
        ) : null}
      </div>

      {queuedId ? (
        <p className="mt-2 text-sm text-amber-700">
          Queued for sync ({queuedId.slice(0, 20)}…). Findings and CAPA will generate when online.
        </p>
      ) : null}

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      {lastResult?.findings.length ? (
        <ul className="mt-4 space-y-2 rounded-xl border border-[#2A2E33]/10 bg-white p-4 text-sm">
          {lastResult.findings.map((f) => (
            <li key={f.id} className="flex justify-between gap-2">
              <span className="font-medium text-[#2A2E33]">{f.title}</span>
              <span className="text-[#64748b]">{f.severity}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {lastResult?.llmSummary ? (
        <p className="mt-2 text-xs text-[#64748b]">{lastResult.llmSummary}</p>
      ) : null}
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
