/**
 * Organization tenant types.
 * Isolation key: `orgId` on every org-scoped record.
 */

export type OrgStatus = "active" | "suspended" | "closed";
export type OrgRoleCode = "owner" | "admin" | "manager" | "user";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrgStatus;
  industry: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrgUser {
  id: string;
  orgId: string;
  email: string;
  fullName: string;
  role: OrgRoleCode;
  status: "invited" | "active" | "disabled";
}

export interface OrgRole {
  id: string;
  orgId: string;
  name: string;
  systemCode: OrgRoleCode | null;
  permissions: string[];
}

export interface CreateOrganizationInput {
  companyName: string;
  ownerEmail: string;
  password: string;
  ownerFullName?: string;
  industry?: string;
}
