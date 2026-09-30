/**
 * Client helper — province-specific dangerous occurrence evaluate via PM API.
 */
import { apiFetchJson } from "./api-client";

export type DangerousOccurrenceAssessmentDto = {
  region: string;
  framework: {
    frameworkLabel: string;
    regulator: string;
    reportChannel: string;
    disclaimer: string;
  };
  flagged: boolean;
  codes: string[];
  matches: Array<{
    code: string;
    label: string;
    matchedPhrases: string[];
    confidence: number;
  }>;
  requiredReporting: Array<{
    code: string;
    label: string;
    mustReport: boolean;
    urgency: string;
    authority: string;
    guidance: string;
    preserveScene: boolean;
    requiredActions: string[];
  }>;
  mustReportAny: boolean;
  preserveScene: boolean;
  highestUrgency: string | null;
  supervisorReviewRequired: boolean;
  narrative: string;
  disclaimer: string;
  contactRouting?: {
    hazards: string[];
    summary: string[];
    contacts: Array<{
      id: string;
      hazard: string;
      role: string;
      priority: number;
      name: string;
      phone: string | null;
      dialHint: string;
      reason: string;
      verified: boolean;
    }>;
  };
};

export async function evaluateDangerousOccurrence(input: {
  title?: string;
  description?: string;
  text?: string;
  regionCode?: string;
}): Promise<DangerousOccurrenceAssessmentDto> {
  return apiFetchJson<DangerousOccurrenceAssessmentDto>(
    "/api/v1/pm/incidents/ohs/evaluate",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}
