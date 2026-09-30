"use client";

import { useEffect, useRef, useState } from "react";
import {
  captureInspectionPhoto,
  listProjectInspectionSubcontractors,
  type PhotoCaptureResult,
} from "@/lib/pm-inspection-v2";
import {
  getPmInspection,
  savePmInspectionPhotoMetadata,
  type PmInspection,
} from "@/lib/pm-inspections";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";
import { Camera, Loader2 } from "lucide-react";

type PhotoRow = {
  id: string;
  photoNumber: number;
  dataUrl: string | null;
  fileName: string | null;
  locationDescription: string;
  pictureDescription: string;
  safetyStatus: "safe" | "at_risk" | "";
  responsibleCompanyId?: number;
  responsibleCompanyName?: string | null;
  analysisStatus?: string | null;
};

type Props = {
  inspectionId: string;
  companyId: number;
  projectId: number;
  editable?: boolean;
  onUpdated?: () => void;
};

function annotationFromAttachment(att: PmInspection["attachments"][number]): PhotoRow {
  const ann = (att.annotationJson ?? {}) as Record<string, unknown>;
  return {
    id: att.id,
    photoNumber: typeof ann.photoNumber === "number" ? ann.photoNumber : 0,
    dataUrl: att.dataUrl ?? null,
    fileName: att.fileName ?? null,
    locationDescription: String(ann.locationDescription ?? ""),
    pictureDescription: String(ann.pictureDescription ?? ""),
    safetyStatus: (ann.safetyStatus as PhotoRow["safetyStatus"]) ?? "",
    responsibleCompanyId:
      typeof ann.responsibleCompanyId === "number"
        ? ann.responsibleCompanyId
        : undefined,
    responsibleCompanyName:
      typeof ann.responsibleCompanyName === "string"
        ? ann.responsibleCompanyName
        : null,
    analysisStatus: att.analysisStatus ?? null,
  };
}

export function SmartSitePhotoPanel({
  inspectionId,
  companyId,
  projectId,
  editable = true,
  onUpdated,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [subcontractors, setSubcontractors] = useState<Array<{ id: number; name: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PhotoRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    void getPmInspection(inspectionId).then((row) => {
      const imageAttachments = (row.attachments ?? []).filter(
        (a) => a.dataUrl || a.mimeType?.startsWith("image/"),
      );
      const rows = imageAttachments
        .map(annotationFromAttachment)
        .sort((a, b) => a.photoNumber - b.photoNumber || a.id.localeCompare(b.id));
      setPhotos(rows);
      onUpdated?.();
    });
  };

  useEffect(() => {
    reload();
    void listProjectInspectionSubcontractors(projectId)
      .then(setSubcontractors)
      .catch(() => undefined);
  }, [inspectionId, projectId]);

  async function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await readAsDataUrl(file);
      const result: PhotoCaptureResult = await captureInspectionPhoto(inspectionId, {
        dataUrl,
        fileName: file.name,
        mimeType: file.type,
        clientSyncId: `photo-${Date.now()}`,
      });
      reload();
      const newId = result.attachment?.id;
      if (newId) {
        setPendingId(newId);
        setDraft({
          id: newId,
          photoNumber: photos.length + 1,
          dataUrl,
          fileName: file.name,
          locationDescription: "",
          pictureDescription: result.llmSummary ?? "",
          safetyStatus: "",
          responsibleCompanyId: subcontractors[0]?.id,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Photo capture failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveMetadata(row: PhotoRow) {
    if (!row.safetyStatus) {
      setError("Mark each photo as Safe or At risk before saving.");
      return;
    }
    if (row.safetyStatus === "at_risk" && !row.responsibleCompanyId && !subcontractors.length) {
      setError("Select the company responsible for correcting at-risk findings.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await savePmInspectionPhotoMetadata(inspectionId, row.id, {
        locationDescription: row.locationDescription,
        pictureDescription: row.pictureDescription,
        safetyStatus: row.safetyStatus,
        responsibleCompanyId: row.responsibleCompanyId,
      });
      setPendingId(null);
      setDraft(null);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  function renderForm(row: PhotoRow, isPending: boolean) {
    return (
      <div className="mt-3 space-y-3 border-t pt-3">
        {row.dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.dataUrl}
            alt={`Inspection photo ${row.photoNumber || ""}`}
            className="max-h-48 rounded-lg border object-contain"
          />
        ) : null}
        <div>
          <label className="text-xs font-medium text-[var(--sf-text-muted)]">
            Location description
          </label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            value={row.locationDescription}
            disabled={!editable}
            placeholder="e.g. North scaffold, Level 3 east elevation"
            onChange={(e) =>
              isPending
                ? setDraft((d) => (d ? { ...d, locationDescription: e.target.value } : d))
                : setPhotos((prev) =>
                    prev.map((p) =>
                      p.id === row.id ? { ...p, locationDescription: e.target.value } : p,
                    ),
                  )
            }
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--sf-text-muted)]">
            Picture description
          </label>
          <textarea
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            rows={2}
            value={row.pictureDescription}
            disabled={!editable}
            placeholder="What does the photo show?"
            onChange={(e) =>
              isPending
                ? setDraft((d) => (d ? { ...d, pictureDescription: e.target.value } : d))
                : setPhotos((prev) =>
                    prev.map((p) =>
                      p.id === row.id ? { ...p, pictureDescription: e.target.value } : p,
                    ),
                  )
            }
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-xs font-medium text-[var(--sf-text-muted)]">Safety status</p>
            <div className="mt-1 flex gap-2">
              {(["safe", "at_risk"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={!editable}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    row.safetyStatus === status
                      ? status === "safe"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      : "border border-[var(--sf-border)] text-[var(--sf-text-muted)]"
                  }`}
                  onClick={() =>
                    isPending
                      ? setDraft((d) => (d ? { ...d, safetyStatus: status } : d))
                      : setPhotos((prev) =>
                          prev.map((p) => (p.id === row.id ? { ...p, safetyStatus: status } : p)),
                        )
                  }
                >
                  {status === "safe" ? "Safe" : "At risk"}
                </button>
              ))}
            </div>
          </div>
          {row.safetyStatus === "at_risk" && subcontractors.length ? (
            <div className="min-w-[200px] flex-1">
              <label className="text-xs font-medium text-[var(--sf-text-muted)]">
                Responsible company
              </label>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                disabled={!editable}
                value={row.responsibleCompanyId ?? ""}
                onChange={(e) => {
                  const id = parseInt(e.target.value, 10);
                  const name = subcontractors.find((s) => s.id === id)?.name;
                  isPending
                    ? setDraft((d) =>
                        d
                          ? {
                              ...d,
                              responsibleCompanyId: id,
                              responsibleCompanyName: name,
                            }
                          : d,
                      )
                    : setPhotos((prev) =>
                        prev.map((p) =>
                          p.id === row.id
                            ? {
                                ...p,
                                responsibleCompanyId: id,
                                responsibleCompanyName: name,
                              }
                            : p,
                        ),
                      );
                }}
              >
                <option value="">Select company…</option>
                {subcontractors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
        {editable ? (
          <SfButton
            type="button"
            size="sm"
            disabled={busy}
            onClick={() => void saveMetadata(row)}
          >
            Save photo details
          </SfButton>
        ) : null}
      </div>
    );
  }

  return (
    <SfCard className="space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-medium">Field photos</h2>
          <p className="text-sm text-[var(--sf-text-muted)]">
            Capture photos in the field. AI pre-fills descriptions; confirm location, safety
            status, and responsible company for at-risk items.
          </p>
        </div>
        {editable ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = "";
              }}
            />
            <SfButton
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? (
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              ) : (
                <Camera className="mr-2 inline h-4 w-4" />
              )}
              Take photo
            </SfButton>
          </>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {draft && pendingId === draft.id ? (
        <div className="rounded-lg border border-[var(--sf-primary)]/30 bg-[var(--sf-primary)]/5 p-4">
          <p className="text-sm font-medium">New photo — complete details</p>
          {renderForm(draft, true)}
        </div>
      ) : null}

      <ul className="space-y-4">
        {photos
          .filter((p) => p.id !== pendingId)
          .map((p) => (
            <li key={p.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sf-primary)] text-sm font-semibold text-white">
                  {p.photoNumber || "—"}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    p.safetyStatus === "at_risk"
                      ? "bg-red-100 text-red-800"
                      : p.safetyStatus === "safe"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {p.safetyStatus === "at_risk"
                    ? "At risk"
                    : p.safetyStatus === "safe"
                      ? "Safe"
                      : "Needs review"}
                </span>
              </div>
              {renderForm(p, false)}
            </li>
          ))}
        {!photos.length && !draft ? (
          <li className="py-6 text-center text-sm text-[var(--sf-text-muted)]">
            No photos yet. Tap &quot;Take photo&quot; to start the inspection report.
          </li>
        ) : null}
      </ul>
    </SfCard>
  );
}
