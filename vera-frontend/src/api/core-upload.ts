/**
 * VERA Core — file upload client (`/api/v1/core/uploads`).
 * Implementation lives in `@/lib/core-upload`.
 */
export {
  coreUploadClientAllowsFile,
  fetchCoreUploadById,
  fetchCoreUploadConfig,
  formatMaxSizeLabel,
  isCoreUploadAbortError,
  mimeListToAccept,
  uploadCoreFile,
  uploadCoreFileDirect,
  uploadCoreFileMultipart,
  type CoreFileDto,
  type CoreUploadConfig,
  type PresignResponse,
} from "@/lib/core-upload";
