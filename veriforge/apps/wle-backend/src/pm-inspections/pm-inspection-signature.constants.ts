export const PM_INSPECTION_SIGNATURE_ROLES = {
  SUPERVISOR: 'supervisor',
  WORKER: 'worker',
} as const;

export type PmInspectionSignatureRole =
  (typeof PM_INSPECTION_SIGNATURE_ROLES)[keyof typeof PM_INSPECTION_SIGNATURE_ROLES];

export type RequiredSignatureDef = { role: string; label?: string };

export const DEFAULT_SUPERVISOR_SIGNATURE: RequiredSignatureDef = {
  role: PM_INSPECTION_SIGNATURE_ROLES.SUPERVISOR,
  label: 'Supervisor',
};

export const DEFAULT_WORKER_SIGNATURE: RequiredSignatureDef = {
  role: PM_INSPECTION_SIGNATURE_ROLES.WORKER,
  label: 'Worker / Inspector',
};
