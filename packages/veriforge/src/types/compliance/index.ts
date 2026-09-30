/**
 * Contractor compliance artifacts.
 */

export type ComplianceArtifactType =
  | "insurance"
  | "wcb"
  | "cor"
  | "scsa"
  | "custom";

export type ComplianceArtifactStatus =
  | "valid"
  | "expired"
  | "pending_review"
  | "rejected";

export interface ComplianceArtifact {
  id: string;
  orgId: string;
  type: ComplianceArtifactType;
  label: string | null;
  fileUrl: string;
  expiryDate: string | null;
  status: ComplianceArtifactStatus;
}

export interface ComplianceUploadInput {
  type: ComplianceArtifactType;
  fileUrl: string;
  expiryDate?: string | null;
  label?: string;
}

export interface ComplianceReviewInput {
  artifactId: string;
  decision: "approve" | "reject";
  notes?: string;
}
