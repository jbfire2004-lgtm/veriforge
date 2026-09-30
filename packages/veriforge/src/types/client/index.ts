/**
 * Hiring-client (EPC / owner / GC) tenant types.
 * Separate JWT namespace from organization accounts.
 */

export type HiringClientRole = "ClientAdmin" | "Reviewer";

export interface HiringClient {
  id: string;
  companyName: string;
  contactEmail: string;
  status: "active" | "suspended";
}

export interface HiringClientUser {
  id: string;
  hiringClientId: string;
  email: string;
  fullName: string;
  role: HiringClientRole;
}

export interface ContractorSummary {
  id: string;
  companyName: string;
  slug: string;
  industry: string | null;
  modulesEnabled: string[];
}

export interface ContractAward {
  id: string;
  hiringClientId: string;
  contractorOrgId: string;
  status: "pending" | "awarded" | "declined" | "withdrawn";
  projectName: string | null;
}
