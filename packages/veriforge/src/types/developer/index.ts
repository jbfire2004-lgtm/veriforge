/**
 * Platform developer / support console types.
 * Separate JWT namespace (`developer`) from org and hiring-client.
 */

export type DeveloperRole =
  | "SystemAdmin"
  | "ModuleArchitect"
  | "SupportEngineer"
  | "BillingAdmin";

export interface Developer {
  id: string;
  email: string;
  fullName: string | null;
  role: DeveloperRole;
  status: "active" | "disabled";
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string | null;
  payload: Record<string, unknown> | null;
}

export interface DeveloperActionLog {
  id: string;
  developerId: string | null;
  action: string;
  createdAt: string;
  meta: Record<string, unknown> | null;
}

export interface ImpersonationSession {
  id: string;
  developerId: string;
  targetOrgId: string;
  reason: string | null;
  startedAt: string;
  endedAt: string | null;
}
