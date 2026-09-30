/** Vera Core — records & compliance module links for the Core hub. */

export const CORE_MODULE_LINKS = [
  {
    href: "/core/workers",
    title: "Worker profiles",
    description: "Global registry, readiness scores, training, and wallet links.",
  },
  {
    href: "/core/equipment",
    title: "Equipment profiles",
    description: "Asset registry, inspections, compliance, and requirements.",
  },
  {
    href: "/core/readiness",
    title: "Readiness engine",
    description: "Worker, equipment, training expiry, and project readiness scores.",
  },
  {
    href: "/core/safety-knowledge",
    title: "Safety Knowledge",
    description: "Demonstrated safety knowledge from verified training, orientation, and field participation.",
  },
  {
    href: "/core/training-ingest",
    title: "Training ingestion",
    description: "Upload PDF/images — OCR extraction, classification, and expiry detection.",
  },
  {
    href: "/core/verification",
    title: "Verification hub",
    description: "Verification queue, ingestion runs, and training record sign-off.",
  },
  {
    href: "/core/provider-hub",
    title: "Provider integration hub",
    description: "Provider channels, ingestion health, validation failures, and sync status.",
  },
  {
    href: "/core/documents",
    title: "Document storage",
    description: "Core file library with ingestion and audit trail.",
  },
  {
    href: "/core/twins",
    title: "Digital twins",
    description: "Generate and monitor worker, equipment, and project twins.",
  },
  {
    href: "/core/upload",
    title: "Core file upload",
    description: "Secure uploads into Core storage with audit trail.",
  },
  {
    href: "/core/meeting-records",
    title: "Meeting records",
    description: "Toolbox talks and safety meetings with attendance.",
  },
  {
    href: "/core/daily-logs",
    title: "Daily logs",
    description: "Shift notes, conditions, and site narrative.",
  },
  {
    href: "/core/compliance-notes",
    title: "Compliance notes",
    description: "Observations and follow-up context for auditors.",
  },
  {
    href: "/core/action-items",
    title: "Action items",
    description: "Track commitments through verified closure.",
  },
  {
    href: "/core/safety-observations",
    title: "Safety observations",
    description: "Structured field observations linked to compliance.",
  },
  {
    href: "/core/site-risks",
    title: "Site risks",
    description: "Site risk register, controls, and mitigation tracking.",
  },
  {
    href: "/core/sites/data-table",
    title: "Sites directory",
    description: "Site master data, contacts, and access context.",
  },
] as const;

export const CORE_WORKFLOW = [
  {
    id: "ingest",
    label: "Ingest evidence",
    description: "Upload training documents — OCR, classification, and expiry detection.",
    href: "/core/training-ingest",
  },
  {
    id: "verify",
    label: "Verify & attest",
    description: "Process the verification queue and sign off training records.",
    href: "/core/verification",
  },
  {
    id: "providers",
    label: "Provider integrations",
    description: "Monitor provider channels, ingestion runs, and validation health.",
    href: "/core/provider-hub",
  },
  {
    id: "readiness",
    label: "Check readiness",
    description: "Worker and equipment readiness scores across the organization.",
    href: "/core/readiness",
  },
  {
    id: "document",
    label: "Document the field",
    description: "Daily logs, meetings, observations, and compliance notes.",
    href: "/core/daily-logs",
  },
] as const;
