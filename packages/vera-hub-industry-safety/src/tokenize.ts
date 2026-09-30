import { createHash } from "node:crypto";

export type TokenizeOptions = {
  projectSalt?: string;
  companySalt?: string;
};

const DEFAULT_PROJECT_SALT = "visi-project-v1";
const DEFAULT_COMPANY_SALT = "visi-company-v1";

function sha16(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

/**
 * Tokenize project IDs → `proj_{hex}`
 * Salt is plane-specific so the same numeric id cannot link to a company token.
 */
export function tokenizeProjectId(
  projectId: string | number,
  salt = process.env.VISI_PROJECT_SALT ?? DEFAULT_PROJECT_SALT,
): string {
  return `proj_${sha16(`${salt}:${projectId}`)}`;
}

/**
 * Tokenize company IDs → `co_{hex}`
 */
export function tokenizeCompanyId(
  companyId: string | number,
  salt = process.env.VISI_COMPANY_SALT ?? DEFAULT_COMPANY_SALT,
): string {
  return `co_${sha16(`${salt}:${companyId}`)}`;
}

export function tokenizeEntityId(
  entityType: "project" | "company",
  id: string | number,
  options?: TokenizeOptions,
): string {
  return entityType === "project"
    ? tokenizeProjectId(id, options?.projectSalt)
    : tokenizeCompanyId(id, options?.companySalt);
}

export function isProjectToken(token: string): boolean {
  return token.startsWith("proj_");
}

export function isCompanyToken(token: string): boolean {
  return token.startsWith("co_");
}

/** Tokens must never be returned in Hub API responses */
export function assertTokenNotInPublicPayload(payload: unknown): void {
  const json = JSON.stringify(payload);
  if (/"proj_[a-f0-9]{16}"/.test(json) || /"co_[a-f0-9]{16}"/.test(json)) {
    throw new Error("VISI_TOKEN_LEAK: entity tokens must not appear in public payloads");
  }
}
