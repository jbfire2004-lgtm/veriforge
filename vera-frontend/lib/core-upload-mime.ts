/**
 * Infer a MIME type for presign / validation when the browser leaves `File.type` empty
 * (common for extension-based picks) or sends a generic type.
 */
export function inferMimeFromFilename(filename: string): string | null {
  const name = filename.toLowerCase();
  if (name.endsWith(".json")) return "application/json";
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  return null;
}

/**
 * Effective MIME for Core uploads: prefer non-empty browser type, else infer from name.
 */
export function effectiveMimeForCoreFile(file: File): string {
  const t = file.type?.trim();
  if (t) return t;
  return inferMimeFromFilename(file.name) ?? "application/octet-stream";
}

/** True if the file is allowed for Core upload (matches server multer + service checks). */
export function coreFileAllowedByConfig(
  file: File,
  allowedMimeTypes: string[]
): boolean {
  const mime = effectiveMimeForCoreFile(file);
  if (mime && allowedMimeTypes.includes(mime)) return true;
  const name = file.name.toLowerCase();
  if (name.endsWith(".json") && allowedMimeTypes.includes("application/json")) {
    return true;
  }
  if (
    (name.endsWith(".jpg") || name.endsWith(".jpeg")) &&
    allowedMimeTypes.some((m) => m === "image/jpeg" || m === "image/jpg")
  ) {
    return true;
  }
  if (name.endsWith(".png") && allowedMimeTypes.includes("image/png")) {
    return true;
  }
  if (name.endsWith(".pdf") && allowedMimeTypes.includes("application/pdf")) {
    return true;
  }
  if (name.endsWith(".webp") && allowedMimeTypes.includes("image/webp")) {
    return true;
  }
  if (name.endsWith(".gif") && allowedMimeTypes.includes("image/gif")) {
    return true;
  }
  return false;
}
