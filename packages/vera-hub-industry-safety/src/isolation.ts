import {
  COMPANY_SUBTYPES,
  PROJECT_SUBTYPES,
  type CompanySubtype,
  type DataPlane,
  type IsolationErrorCode,
  type ProjectSubtype,
} from "./types";

export class PlaneIsolationError extends Error {
  readonly code: IsolationErrorCode;

  constructor(code: IsolationErrorCode, message: string) {
    super(message);
    this.name = "PlaneIsolationError";
    this.code = code;
  }
}

/**
 * Cross-category isolation: project and company planes never mix
 * unless an explicit cross-compare consent path is used.
 */
export function assertSinglePlane(
  entityType: DataPlane,
  filters: {
    projectType?: string;
    projectId?: string;
    companyType?: string;
    companyId?: string;
    entityType?: string;
  },
): void {
  if (filters.entityType && filters.entityType !== entityType) {
    throw new PlaneIsolationError(
      "VISI_MIXED_PLANE",
      `Endpoint plane is ${entityType}; received entityType=${filters.entityType}`,
    );
  }

  if (entityType === "project") {
    if (filters.companyType || filters.companyId) {
      throw new PlaneIsolationError(
        "VISI_MIXED_PLANE",
        "Company-level filters are not allowed on Project-Scale APIs",
      );
    }
  }

  if (entityType === "company") {
    if (filters.projectType || filters.projectId) {
      throw new PlaneIsolationError(
        "VISI_MIXED_PLANE",
        "Project-level filters are not allowed on Company-Scale APIs",
      );
    }
  }
}

export function assertSubtypeMatchesPlane(
  entityType: DataPlane,
  subtype: string,
): void {
  if (entityType === "project") {
    if (!(PROJECT_SUBTYPES as string[]).includes(subtype)) {
      throw new PlaneIsolationError(
        "VISI_PLANE_MISMATCH",
        `Subtype "${subtype}" is not a valid project type`,
      );
    }
    return;
  }
  if (!(COMPANY_SUBTYPES as string[]).includes(subtype)) {
    throw new PlaneIsolationError(
      "VISI_PLANE_MISMATCH",
      `Subtype "${subtype}" is not a valid company type`,
    );
  }
}

export function assertNoCrossPlaneTokenJoin(
  projectTokens: string[],
  companyTokens: string[],
): void {
  // Tokens use different prefixes/salts; still forbid any shared string equality checks as joins
  const companySet = new Set(companyTokens);
  for (const t of projectTokens) {
    if (companySet.has(t)) {
      throw new PlaneIsolationError(
        "VISI_MIXED_PLANE",
        "Cross-plane token join is forbidden",
      );
    }
  }
}

export function assertCrossCompareConsent(input: {
  explicitConsent?: boolean;
  hasPermission?: boolean;
}): void {
  if (!input.explicitConsent) {
    throw new PlaneIsolationError(
      "VISI_CROSS_DENIED",
      "Cross-category comparison requires explicitConsent=true",
    );
  }
  if (input.hasPermission === false) {
    throw new PlaneIsolationError(
      "VISI_CROSS_DENIED",
      "Missing HUB_INDUSTRY_SAFETY_CROSS_COMPARE permission",
    );
  }
}

/**
 * Within the company plane: do not mix company types (e.g. utility vs contractor)
 * unless the user explicitly opts into cross-category comparison.
 */
export function assertSameCompanyTypeUnlessConsent(input: {
  homeType: string;
  benchmarkType: string;
  explicitCrossCategory?: boolean;
}): void {
  if (input.homeType === input.benchmarkType) return;
  if (input.explicitCrossCategory) return;
  throw new PlaneIsolationError(
    "VISI_CROSS_TYPE",
    `Company type "${input.homeType}" cannot benchmark against "${input.benchmarkType}" without explicit cross-category comparison`,
  );
}

/**
 * Do not mix mega with small (etc.) unless the user explicitly opts into cross-scale.
 */
export function assertSameScaleUnlessConsent(input: {
  homeScale: string;
  benchmarkScale: string;
  explicitCrossScale?: boolean;
}): void {
  if (input.homeScale === input.benchmarkScale) return;
  if (input.explicitCrossScale) return;
  throw new PlaneIsolationError(
    "VISI_CROSS_SCALE",
    `Scale "${input.homeScale}" cannot benchmark against "${input.benchmarkScale}" without explicit cross-scale comparison`,
  );
}

export function isProjectSubtype(value: string): value is ProjectSubtype {
  return (PROJECT_SUBTYPES as string[]).includes(value);
}

export function isCompanySubtype(value: string): value is CompanySubtype {
  return (COMPANY_SUBTYPES as string[]).includes(value);
}

/**
 * Partition facts so aggregators cannot accidentally union planes.
 */
export function partitionByPlane<T extends { plane: DataPlane }>(
  rows: T[],
): { project: T[]; company: T[] } {
  return {
    project: rows.filter((r) => r.plane === "project"),
    company: rows.filter((r) => r.plane === "company"),
  };
}
