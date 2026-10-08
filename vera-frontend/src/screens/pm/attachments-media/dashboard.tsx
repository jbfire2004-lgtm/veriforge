"use client";

import { VeraPageLayout } from "@/src/components/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchPmAttachmentsAnalytics,
  listPmAttachmentsForEntity,
  uploadPmAttachmentsMedia,
} from "@/lib/pm-attachments-media";
import { SfButton, SfCard, SfInput } from "@/src/components/safety-forms/ui";

export default function PmAttachmentsMediaDashboardPage({
  projectId = 1,
}: {
  projectId?: number;
}) {
  const [moduleType, setModuleType] = useState("inspection");
  const [moduleRecordId, setModuleRecordId] = useState("");
  const [fileName, setFileName] = useState("site-photo.jpg");
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const reload = useCallback(() => {
    void fetchPmAttachmentsAnalytics(projectId).then(setAnalytics).catch(() => undefined);
    if (moduleRecordId.trim()) {
      void listPmAttachmentsForEntity(moduleType, moduleRecordId.trim())
        .then(setItems)
        .catch(() => setItems([]));
    }
  }, [projectId, moduleType, moduleRecordId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleUpload() {
    if (!moduleRecordId.trim()) {
      setStatus("Module record ID required");
      return;
    }
    setStatus("Uploading…");
    try {
      await uploadPmAttachmentsMedia({
        projectId,
        moduleType,
        moduleRecordId: moduleRecordId.trim(),
        fileName,
        mimeType: "image/jpeg",
        dataUrl:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==",
        fileSize: 1200,
      });
      setStatus("Uploaded and processed");
      reload();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Upload failed");
    }
  }

  return (
    <VeraPageLayout
      title="Attachments & media"
      description={`Unified uploads, thumbnails, annotations, and offline sync — project #${projectId}`}

      >

      {analytics ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Uploads (30d)</p>
            <p className="text-2xl font-semibold">{String(analytics.uploads30d ?? 0)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Annotations</p>
            <p className="text-2xl font-semibold">
              {String(analytics.annotationFrequency30d ?? 0)}
            </p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Annotation rate</p>
            <p className="text-2xl font-semibold">
              {analytics.annotationRate != null
                ? `${Math.round(Number(analytics.annotationRate) * 100)}%`
                : "—"}
            </p>
          </SfCard>
        </div>
      ) : null}

      <SfCard className="space-y-4 p-6">
        <h2 className="font-medium">Upload</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <SfInput
            label="Module type"
            value={moduleType}
            onChange={(e) => setModuleType(e.target.value)}
          />
          <SfInput
            label="Module record ID"
            value={moduleRecordId}
            onChange={(e) => setModuleRecordId(e.target.value)}
          />
          <SfInput
            label="File name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>
        <SfButton onClick={() => void handleUpload()}>Upload sample image</SfButton>
        {status ? <p className="text-sm text-[var(--sf-text-muted)]">{status}</p> : null}
      </SfCard>

      {items.length > 0 ? (
        <SfCard className="p-6">
          <h2 className="mb-3 font-medium">Linked attachments</h2>
          <ul className="space-y-2 text-sm">
            {items.map((a) => (
              <li key={String(a.id)} className="flex justify-between gap-2 border-b py-2">
                <span>{String(a.fileName ?? a.id)}</span>
                <span className="text-[var(--sf-text-muted)]">{String(a.status)}</span>
              </li>
            ))}
          </ul>
        </SfCard>
      ) : null}
    </VeraPageLayout>
  );
}
