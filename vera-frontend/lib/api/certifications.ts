import { apiGet } from "@/lib/api";

export type CertificationSummary = {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
};

export function fetchCertifications() {
  return apiGet<CertificationSummary[]>("/certifications");
}
