export const PM_INSPECTION_SIGNATURE_ROLES = {
  SUPERVISOR: "supervisor",
  WORKER: "worker",
} as const;

export type RequiredSignatureDef = { role: string; label?: string };

export const DEFAULT_SUPERVISOR_SIGNATURE: RequiredSignatureDef = {
  role: PM_INSPECTION_SIGNATURE_ROLES.SUPERVISOR,
  label: "Supervisor",
};

export const DEFAULT_WORKER_SIGNATURE: RequiredSignatureDef = {
  role: PM_INSPECTION_SIGNATURE_ROLES.WORKER,
  label: "Worker / Inspector",
};

export function isSupervisorSignatureRole(role: string): boolean {
  return role === PM_INSPECTION_SIGNATURE_ROLES.SUPERVISOR || role.includes("supervisor");
}

export function isWorkerSignatureRole(role: string): boolean {
  return role === PM_INSPECTION_SIGNATURE_ROLES.WORKER || role.includes("worker");
}

export type SignaturePreviewSource = {
  signatureData?: string | null;
  coreFile?: { publicUrl?: string | null } | null;
};

export function signaturePreviewUrl(sig: SignaturePreviewSource): string | null {
  if (sig.coreFile?.publicUrl) return sig.coreFile.publicUrl;
  const data = sig.signatureData?.trim();
  if (!data) return null;
  if (data.startsWith("data:") || data.startsWith("http")) return data;
  return null;
}
