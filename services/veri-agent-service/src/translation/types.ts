import { z } from "zod";
import type { TenantContext, VeriAgentRole } from "../core/types";

export type AbstractionLevel = "strict" | "relaxed";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type MitigationType =
  | "elimination"
  | "substitution"
  | "engineering"
  | "administrative"
  | "ppe"
  | "other";

export type HazardCategory =
  | "fall"
  | "electrical"
  | "chemical"
  | "thermal"
  | "mechanical"
  | "struck_by"
  | "caught_in"
  | "ergonomic"
  | "environmental"
  | "other";

/**
 * Translation context — does not include policy allow/deny decisions.
 * Policy runs separately; translation only shapes safe prompt content.
 */
export type TranslationContext = {
  tenant: TenantContext;
  actorRoles?: VeriAgentRole[];
  abstractionLevel?: AbstractionLevel;
  purpose?: string;
  correlationId?: string;
};

/** Full internal FLHA — may contain identifiers that must never reach prompts. */
export type FlhaDocument = {
  id?: string;
  title?: string;
  tasks?: string[];
  narrative?: string;
  hazards?: Array<{
    description: string;
    energyType?: string;
    category?: string;
    controls?: string[];
    mitigations?: string[];
    residualRisk?: RiskLevel;
    /** Stripped — never forwarded */
    workerNames?: string[];
    location?: string;
    companyName?: string;
  }>;
  /** Stripped */
  workers?: Array<{ name: string; role?: string }>;
  locations?: string[];
  companyLegalName?: string;
  siteAddress?: string;
  gps?: { lat: number; lng: number };
};

export type FlhaHazardPromptItem = {
  category: HazardCategory;
  energyType: string;
  riskLevel: RiskLevel;
  mitigationTypes: MitigationType[];
  /** Abstracted summary — no names/locations/company ids */
  summary: string;
};

export type FlhaPrompt = {
  systemHint: string;
  userPrompt: string;
  hazards: FlhaHazardPromptItem[];
  /** Abstracted work activity labels (not free-text with PII) */
  taskTypes: string[];
  abstractionLevel: AbstractionLevel;
  redactionCount: number;
  rulesApplied: string[];
};

export type ImageMeta = {
  caption?: string;
  objectKey?: string;
  mimeType?: string;
  /** Optional local/regional vision sidecar output */
  vision?: {
    sceneDescription?: string;
    labels?: string[];
    equipment?: string[];
    conditions?: string[];
    hazardsSuspected?: string[];
  };
  /** Never included in ImagePrompt text unless policy+firewall allow (translation omits bytes) */
  imageBase64?: string;
  width?: number;
  height?: number;
};

export type ImagePrompt = {
  systemHint: string;
  userPrompt: string;
  sceneDescription: string;
  hazards: string[];
  equipment: string[];
  conditions: string[];
  features: string[];
  /** Always false from translation — raw bytes are not part of the prompt text */
  includesRawImage: false;
  abstractionLevel: AbstractionLevel;
  redactionCount: number;
  rulesApplied: string[];
};

export type Project = {
  id?: number | string;
  name?: string;
  companyLegalName?: string;
  siteAddress?: string;
  clientName?: string;
  workType?: string;
  environment?: "indoor" | "outdoor" | "mixed" | string;
  conditions?: string[];
  /** Free-form notes that may contain PII */
  notes?: string;
  region?: string;
  trade?: string;
};

export type ProjectPrompt = {
  systemHint: string;
  userPrompt: string;
  /** Minimal safe context */
  context: {
    environment: "indoor" | "outdoor" | "mixed" | "unspecified";
    workType: string;
    conditions: string[];
    trade?: string;
  };
  abstractionLevel: AbstractionLevel;
  redactionCount: number;
  rulesApplied: string[];
};

/** Safety briefing composed from translated FLHA + project (+ optional image). */
export type SafetyBriefingPrompt = {
  systemHint: string;
  userPrompt: string;
  flha: FlhaPrompt;
  project?: ProjectPrompt;
  image?: ImagePrompt;
  abstractionLevel: AbstractionLevel;
};

export const abstractionConfigSchema = z.object({
  id: z.enum(["strict", "relaxed"]),
  version: z.number().int().positive(),
  description: z.string().optional(),
  flha: z.object({
    maxHazardSummaryChars: z.number().int().positive(),
    maxHazards: z.number().int().positive(),
    maxMitigationTypes: z.number().int().positive(),
    maxTaskTypes: z.number().int().positive(),
    /** Drop free-text narrative entirely (strict) vs abstract sentences (relaxed) */
    allowNarrativeSentences: z.boolean(),
    maxNarrativeSentences: z.number().int().nonnegative(),
    /** Prefer category labels over paraphrased summaries when true */
    preferCategoryOnlySummary: z.boolean(),
  }),
  image: z.object({
    maxDescriptionChars: z.number().int().positive(),
    maxLabels: z.number().int().positive(),
    hashObjectKeys: z.boolean(),
    dropPeopleReferences: z.boolean(),
  }),
  project: z.object({
    includeTrade: z.boolean(),
    maxConditions: z.number().int().positive(),
    dropNamesAndAddresses: z.boolean(),
  }),
});

export type AbstractionConfig = z.infer<typeof abstractionConfigSchema>;
