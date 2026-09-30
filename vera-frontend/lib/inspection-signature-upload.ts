import { API_URL } from "./api";
import {
  fetchCoreUploadConfig,
  uploadCoreFile,
  type CoreUploadConfig,
} from "./core-upload";

let cachedConfig: CoreUploadConfig | null = null;

async function getUploadConfig(): Promise<CoreUploadConfig> {
  if (!cachedConfig) {
    cachedConfig = await fetchCoreUploadConfig();
  }
  return cachedConfig;
}

export async function dataUrlToPngFile(
  dataUrl: string,
  filename: string,
): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: "image/png" });
}

/** Canvas PNG data URL → Core upload → public URL + file id */
export async function uploadInspectionSignaturePng(
  dataUrl: string,
  options?: { role: string; inspectionId: string },
): Promise<{ coreFileId: number; signatureUrl: string }> {
  const config = await getUploadConfig();
  const file = await dataUrlToPngFile(
    dataUrl,
    `inspection-signature-${options?.role ?? "sign"}-${options?.inspectionId ?? Date.now()}.png`,
  );
  const uploaded = await uploadCoreFile(file, config, {
    purpose: "inspection_signature",
  });
  const signatureUrl =
    uploaded.publicUrl ?? `${API_URL}/api/v1/core/uploads/${uploaded.id}`;
  return { coreFileId: uploaded.id, signatureUrl };
}
