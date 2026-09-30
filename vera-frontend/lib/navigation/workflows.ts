/**
 * Primary workflow definitions for UI copy, onboarding, and step indicators.
 * VERA Core §6 — workflow architecture.
 */

export type WorkflowStep = {
  id: string;
  label: string;
  description?: string;
};

export const WORKER_WORKFLOW: WorkflowStep[] = [
  { id: "add", label: "Add worker", description: "Create profile and credentials" },
  { id: "link", label: "Link to company", description: "QR, import, or provider upload" },
  { id: "assign", label: "Assign to project", description: "Site readiness and roster" },
  { id: "train", label: "Add training", description: "Records and certificates" },
  { id: "competency", label: "Evaluate competency", description: "Role-fit validation" },
  { id: "leave-project", label: "Leave project", description: "Close site assignment" },
  { id: "leave-company", label: "Leave company", description: "End employment link" },
  { id: "transfer", label: "New company", description: "Transfer with wallet history" },
];

export const EQUIPMENT_WORKFLOW: WorkflowStep[] = [
  { id: "add", label: "Add equipment", description: "Register asset in catalog" },
  { id: "link", label: "Link to company", description: "QR or bulk import" },
  { id: "assign", label: "Assign to project", description: "Site deployment" },
  { id: "preuse", label: "Pre-use inspection", description: "Field check before use" },
  { id: "scheduled", label: "Scheduled inspection", description: "Compliance calendar" },
  { id: "competency", label: "Competency check", description: "Operator qualification" },
  { id: "maintain", label: "Maintenance / calibration", description: "Service records" },
  { id: "end", label: "End assignment", description: "Remove from project or company" },
];

export const TRAINING_PROVIDER_WORKFLOW: WorkflowStep[] = [
  { id: "course", label: "Create course", description: "Define curriculum and standards" },
  { id: "instructor", label: "Add instructor", description: "Qualifications and expiry" },
  { id: "deliver", label: "Deliver training", description: "Class delivery and attendance" },
  { id: "upload", label: "Upload records", description: "Bulk or per-worker upload" },
  { id: "cert", label: "Issue certificate", description: "Sign and QR verification" },
  { id: "validate", label: "Compliance validation", description: "Standards engine check" },
  { id: "push", label: "Push to wallets", description: "Worker, company, and project sync" },
];

export const UNION_HALL_WORKFLOW: WorkflowStep[] = [
  { id: "member", label: "Add member", description: "Hall roster and status" },
  { id: "upload", label: "Upload training", description: "Accept provider records" },
  { id: "dispatch", label: "Dispatch worker", description: "Send to job site" },
  { id: "recall", label: "Recall worker", description: "Return from assignment" },
  { id: "membership", label: "Manage membership", description: "Standing and dues" },
];

export const WORKFLOWS = {
  worker: WORKER_WORKFLOW,
  equipment: EQUIPMENT_WORKFLOW,
  trainingProvider: TRAINING_PROVIDER_WORKFLOW,
  unionHall: UNION_HALL_WORKFLOW,
} as const;
