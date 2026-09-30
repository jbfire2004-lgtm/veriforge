import axios from "axios";
import { API_URL, getAccessToken } from "@/lib/api-client";
import type {
  CompanyScaleSelectors,
  CompanySelfVsIndustryResponse,
  ProjectScaleSelectors,
  VisiCompanyResponse,
  VisiProjectResponse,
} from "./types";
import {
  INDUSTRIES,
  PROJECT_SUBTYPES,
  COMPANY_SUBTYPES,
  SCALES,
  MIN_SAMPLE,
  HOURS_DENOMINATOR,
} from "./types";

function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

/** Preserve { data, meta } — do not use apiAxiosGet unwrap */
async function visiGet<T>(path: string, params?: Record<string, string>) {
  const token = await getAccessToken();
  const { data } = await axios.get<T>(apiUrl(path), {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return data;
}

export async function fetchProjectScaleSelectors() {
  try {
    return await visiGet<{
      industries: typeof INDUSTRIES;
      projectTypes: typeof PROJECT_SUBTYPES;
      companyTypes: typeof COMPANY_SUBTYPES;
      scales: typeof SCALES;
      minSample: number;
      hoursDenominator: number;
    }>("/api/v1/hub/industry-safety/selectors");
  } catch {
    return {
      industries: INDUSTRIES,
      projectTypes: PROJECT_SUBTYPES,
      companyTypes: COMPANY_SUBTYPES,
      scales: SCALES,
      minSample: MIN_SAMPLE,
      hoursDenominator: HOURS_DENOMINATOR,
    };
  }
}

export async function fetchProjectScaleCohort(
  selectors: ProjectScaleSelectors,
): Promise<VisiProjectResponse> {
  return visiGet<VisiProjectResponse>(
    "/api/v1/hub/industry-safety/project/cohort",
    {
      entityType: "project",
      industry: selectors.industry,
      projectType: selectors.projectType,
      scale: selectors.scale,
      period: selectors.period,
    },
  );
}

export async function fetchCompanyScaleCohort(
  selectors: CompanyScaleSelectors,
): Promise<VisiCompanyResponse> {
  return visiGet<VisiCompanyResponse>(
    "/api/v1/hub/industry-safety/company/cohort",
    {
      entityType: "company",
      industry: selectors.industry,
      companyType: selectors.companyType,
      scale: selectors.scale,
      period: selectors.period,
    },
  );
}

/** Your company metrics vs anonymized industry cohort (same type · scale) */
export async function fetchCompanySelfVsIndustry(params: {
  industry?: string;
  companyType?: string;
  scale?: string;
  period?: string;
  crossCategory?: boolean;
  crossScale?: boolean;
}): Promise<CompanySelfVsIndustryResponse> {
  return visiGet<CompanySelfVsIndustryResponse>(
    "/api/v1/hub/industry-safety/company/self-vs-industry",
    {
      entityType: "company",
      ...(params.industry ? { industry: params.industry } : {}),
      ...(params.companyType ? { companyType: params.companyType } : {}),
      ...(params.scale ? { scale: params.scale } : {}),
      ...(params.period ? { period: params.period } : {}),
      ...(params.crossCategory ? { crossCategory: "true" } : {}),
      ...(params.crossScale ? { crossScale: "true" } : {}),
    },
  );
}

export async function fetchCompanyBenchmarkProfile(): Promise<{
  data: import("./types").CompanyBenchmarkProfile;
  meta: { timestamp: string; plane: "company" };
}> {
  return visiGet("/api/v1/hub/industry-safety/company/benchmark-profile");
}

export async function fetchSelectorAvailability(params: {
  entityType: "project" | "company";
  industry?: string;
  period?: string;
}): Promise<import("./types").SelectorAvailabilityResponse> {
  try {
    return await visiGet("/api/v1/hub/industry-safety/selectors/availability", {
      entityType: params.entityType,
      ...(params.industry ? { industry: params.industry } : {}),
      ...(params.period ? { period: params.period } : {}),
    });
  } catch {
    // Offline fallback: mark all options available (cohort fetch still enforces n≥5)
    const { INDUSTRIES, PROJECT_SUBTYPES, COMPANY_SUBTYPES, SCALES, MIN_SAMPLE } =
      await import("./types");
    const subtypes =
      params.entityType === "project" ? PROJECT_SUBTYPES : COMPANY_SUBTYPES;
    return {
      plane: params.entityType,
      period: params.period ?? "2026-Q2",
      minSample: MIN_SAMPLE,
      industry: (params.industry as import("./types").IndustryCode) ?? "energy",
      industries: INDUSTRIES.map((id) => ({
        id,
        available: true,
        qualifyingCombos: 1,
      })),
      subtypes: subtypes.map((id) => ({
        id,
        available: true,
        scales: SCALES.map((scale) => ({
          scale,
          available: true,
          entityCount: MIN_SAMPLE,
        })),
      })),
      scales: SCALES.map((id) => ({ id, available: true })),
      crossContaminationPrevented: true,
      note:
        params.entityType === "project"
          ? "Company-level categories are excluded from this availability set."
          : "Project-level categories are excluded from this availability set.",
    };
  }
}
