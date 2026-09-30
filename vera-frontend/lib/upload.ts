import { API_URL } from "./api";

export type UploadDocumentTarget =
  | { workerId: number }
  | { equipmentId: number }
  | { companyId: number };

export type UploadDocumentOptions = {
  target: UploadDocumentTarget;
  /** Stored as Document.type (default TRAINING) */
  type?: string;
  /** Defaults to file.name */
  displayName?: string;
  description?: string;
  tags?: string[];
};

/**
 * Multipart upload to `POST /documents/upload`.
 * Do not set `Content-Type`; the browser sets multipart boundaries.
 */
export async function uploadDocumentFile(
  file: File,
  options: UploadDocumentOptions
): Promise<unknown> {
  const form = new FormData();
  form.append("file", file);
  form.append("type", options.type ?? "TRAINING");
  form.append("name", options.displayName ?? file.name);
  if (options.description) form.append("description", options.description);
  if (options.tags?.length) form.append("tags", options.tags.join(","));

  const [key, value] = Object.entries(options.target)[0] as [
    keyof UploadDocumentTarget,
    number,
  ];
  form.append(key, String(value));

  const res = await fetch(`${API_URL}/documents/upload`, {
    method: "POST",
    body: form,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed (${res.status})`);
  }

  return res.json();
}
