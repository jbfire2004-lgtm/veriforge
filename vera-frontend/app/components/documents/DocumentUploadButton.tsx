"use client";

import { useState, type ChangeEvent } from "react";
import {
  uploadDocumentFile,
  type UploadDocumentTarget,
} from "@/lib/upload";

type Props = {
  target: UploadDocumentTarget;
  onUpload?: (data: unknown) => void;
  onError?: (err: Error) => void;
  accept?: string;
  label?: string;
};

export function DocumentUploadButton({
  target,
  onUpload,
  onError,
  accept,
  label = "Upload document",
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await uploadDocumentFile(file, { target });
      onUpload?.(data);
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <label className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
      {loading ? "Uploading…" : label}
      <input
        type="file"
        className="hidden"
        accept={accept}
        disabled={loading}
        onChange={(e) => void handleUpload(e)}
      />
    </label>
  );
}
