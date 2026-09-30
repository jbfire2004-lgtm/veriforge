import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

export type CompanyTrainingRequirementRow = {
  id: number;
  companyId: number;
  courseName: string;
  expiresInDays: number;
  createdAt: string;
};

export function fetchCompanyTrainingRequirements(companyId: number) {
  return apiGet<CompanyTrainingRequirementRow[]>(
    `/training-requirements/company/${companyId}`
  );
}

export function replaceCompanyTrainingRequirements(
  companyId: number,
  requirements: { courseName: string; expiresInDays: number }[]
) {
  return apiPost<{ count: number }>(
    `/training-requirements/company/${companyId}`,
    { requirements }
  );
}

export function updateCompanyTrainingRequirement(
  id: number,
  body: Partial<{ courseName: string; expiresInDays: number }>
) {
  return apiPatch<CompanyTrainingRequirementRow>(
    `/training-requirements/${id}`,
    body
  );
}

export function deleteCompanyTrainingRequirement(id: number) {
  return apiDelete<{ status: string; deletedId: number }>(
    `/training-requirements/${id}`
  );
}
