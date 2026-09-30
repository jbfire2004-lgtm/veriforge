import { API_URL } from "./api";
import {
  fetchCoreUploadById,
  fetchCoreUploadConfig,
  formatMaxSizeLabel,
  uploadCoreFile,
  type CoreFileDto,
  type CoreUploadConfig,
} from "./core-upload";
import { extractTextFromFile } from "./vision/ocr-client";
import { fetchJson } from "./core";

export type { CoreFileDto };

export type PhotoClassificationResult = {
  engines: string[];
  suggestedPolarity: "safe" | "at_risk";
  suggestedSeverity: string;
  suggestedCaption?: string;
  riskCategory?: string;
  hazardPatterns: string[];
  hazardSummary?: string;
};

const PRESIGN_THRESHOLD_BYTES = 5 * 1024 * 1024; // 5 MiB — use direct S3 when configured

export async function fetchVsiUploadConfig(): Promise<CoreUploadConfig> {
  return fetchCoreUploadConfig();
}

/**
 * Smart upload: uses server config (multipart local/s3 or presigned direct for large files).
 */
export async function uploadVsiPhoto(
  file: File,
  options?: {
    purpose?: string;
    onProgress?: (percent: number) => void;
    onStage?: (stage: string) => void;
    signal?: AbortSignal;
  },
): Promise<CoreFileDto> {
  const config = await fetchCoreUploadConfig();
  const usePresign =
    config.mode === "direct" || file.size >= PRESIGN_THRESHOLD_BYTES;
  if (usePresign && config.mode !== "direct") {
    options?.onStage?.("Using multipart (server mode is not direct)");
  }
  return uploadCoreFile(file, config, {
    purpose: options?.purpose ?? "vsi-inspection",
    onProgress: options.onProgress,
    onStage: options.onStage as
      | ((stage: "presign" | "put" | "complete" | "upload") => void)
      | undefined,
    signal: options?.signal,
  });
}

export function resolvePhotoDisplayUrl(file: CoreFileDto | null): string | null {
  if (!file) return null;
  if (file.publicUrl) return file.publicUrl;
  return `${API_URL}/api/v1/core/uploads/${file.id}`;
}

export async function classifyInspectionPhoto(input: {
  caption?: string;
  ocrText?: string;
  imageUrl?: string;
  coreFileId?: number;
  companyId?: number;
  projectId?: number;
}): Promise<PhotoClassificationResult> {
  return fetchJson<PhotoClassificationResult>(
    `${API_URL}/api/v1/pm/safety-intelligence/inspections/ai/classify-photo`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

/** OCR + vision + VASE classify for a local image file (before or after upload). */
export async function classifyInspectionPhotoFile(
  file: File,
  caption: string,
  opts?: { coreFileId?: number; companyId?: number; projectId?: number },
) {
  const ocrText = await extractTextFromFile(file);
  const previewUrl = URL.createObjectURL(file);
  try {
    return await classifyInspectionPhoto({
      caption,
      ocrText: ocrText || undefined,
      imageUrl: previewUrl,
      coreFileId: opts?.coreFileId,
      companyId: opts?.companyId,
      projectId: opts?.projectId,
    });
  } finally {
    URL.revokeObjectURL(previewUrl);
  }
}

export { formatMaxSizeLabel, fetchCoreUploadById };
