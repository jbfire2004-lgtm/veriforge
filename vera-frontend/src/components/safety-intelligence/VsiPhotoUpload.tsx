"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  classifyInspectionPhotoFile,
  fetchVsiUploadConfig,
  formatMaxSizeLabel,
  resolvePhotoDisplayUrl,
  uploadVsiPhoto,
  type CoreFileDto,
  type PhotoClassificationResult,
} from "@/lib/vsi-upload";
import { SfButton } from "@/src/components/safety-forms/ui";

type Props = {
  purpose?: string;
  companyId?: number;
  projectId?: number;
  onUploaded?: (file: CoreFileDto, localPreview: string | null) => void;
  onClassified?: (result: PhotoClassificationResult) => void;
  disabled?: boolean;
};

export function VsiPhotoUpload({
  purpose = "vsi-inspection",
  companyId,
  projectId,
  onUploaded,
  onClassified,
  disabled,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<CoreFileDto | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<string | null>(null);
  const [maxBytes, setMaxBytes] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    void fetchVsiUploadConfig().then((c) => setMaxBytes(c.maxBytes));
  }, []);

  const clearPreview = useCallback(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
    setLocalPreview(null);
  }, []);

  const onSelect = useCallback(
    (f: File | null) => {
      clearPreview();
      setFile(f);
      setUploaded(null);
      setError(null);
      setProgress(0);
      if (f?.type.startsWith("image/")) {
        const url = URL.createObjectURL(f);
        previewRef.current = url;
        setLocalPreview(url);
      }
    },
    [clearPreview],
  );

  useEffect(() => () => clearPreview(), [clearPreview]);

  const displayUrl =
    localPreview ?? resolvePhotoDisplayUrl(uploaded);

  async function handleUpload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const row = await uploadVsiPhoto(file, {
        purpose,
        onProgress: setProgress,
        onStage: setStage,
      });
      setUploaded(row);
      onUploaded?.(row, localPreview);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      setStage(null);
    }
  }

  async function handleClassify() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const result = await classifyInspectionPhotoFile(file, "", {
        coreFileId: uploaded?.id,
        companyId,
        projectId,
      });
      onClassified?.(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Classification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--sf-text)]">
        Photo
        {maxBytes != null && (
          <span className="ml-2 text-xs font-normal text-[var(--sf-text-muted)]">
            Max {formatMaxSizeLabel(maxBytes)}
            {maxBytes >= 5 * 1024 * 1024 ? " · large files use S3 presign" : ""}
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          disabled={disabled || busy}
          className="mt-1 block w-full text-sm"
          onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
        />
      </label>

      {displayUrl && (
        <div className="relative overflow-hidden rounded-lg border border-[var(--sf-border)] bg-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt="Observation preview"
            className="max-h-48 w-full object-contain"
          />
        </div>
      )}

      {stage && (
        <p className="text-xs text-[var(--sf-text-muted)]">
          {stage} {progress > 0 ? `(${progress}%)` : ""}
        </p>
      )}

      {uploaded && (
        <p className="text-xs text-emerald-700">
          Uploaded #{uploaded.id}
          {uploaded.publicUrl ? " · ready" : ""}
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <SfButton
          type="button"
          variant="secondary"
          disabled={!file || busy || disabled}
          onClick={() => void handleUpload()}
        >
          Upload photo
        </SfButton>
        <SfButton
          type="button"
          variant="secondary"
          disabled={!file || busy || disabled}
          onClick={() => void handleClassify()}
        >
          AI analyze photo
        </SfButton>
      </div>
    </div>
  );
}
