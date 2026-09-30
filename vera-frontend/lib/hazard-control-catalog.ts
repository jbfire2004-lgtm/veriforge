import type { Session } from "next-auth";

import { apiFetchJson } from "@/lib/api-client";



const HAZARDS_BASE = "/api/v1/hazards";

const CONTROLS_BASE = "/api/v1/controls";



export type VeraApiContext = { session?: Session | null };



export type HazardCatalogEntry = {

  id: string;

  category: string;

  subcategory?: string;

  description: string;

  defaultSeverity: number;

  defaultLikelihood: number;

  defaultEnergyTypes: string[];

  keywords?: string[];

};



export type ControlCatalogEntry = {

  id: string;

  controlType: string;

  description: string;

  hazardCategories: string[];

  energyTypes: string[];

  ppeRequired: boolean;

  controlClass: "direct" | "alternative";

};



export type HazardCatalogResponse = {

  hazards: HazardCatalogEntry[];

  categories: string[];

  counts: Record<string, number>;

  total: number;

};



export type ControlCatalogResponse = {

  controls: ControlCatalogEntry[];

  controlTypes: string[];

  counts: Record<string, number>;

  total: number;

};



export type ScoredHazardSuggestion = HazardCatalogEntry & {

  score: number;

  reason: string;

};



export type ScoredControlSuggestion = ControlCatalogEntry & {

  score: number;

  reason: string;

};



function catalogQuery(

  companyId: number,

  projectId?: number,

  extra?: Record<string, string | undefined>,

) {

  const q = new URLSearchParams({ companyId: String(companyId) });

  if (projectId != null) q.set("projectId", String(projectId));

  if (extra) {

    for (const [key, value] of Object.entries(extra)) {

      if (value != null && value !== "") q.set(key, value);

    }

  }

  return q.toString();

}



/** Full hazard library with category grouping metadata. */

export async function fetchHazardCatalog(

  companyId: number,

  projectId?: number,

  options?: { category?: string; search?: string; session?: Session | null },

): Promise<HazardCatalogResponse> {

  const qs = catalogQuery(companyId, projectId, {

    category: options?.category,

    search: options?.search,

  });

  return apiFetchJson<HazardCatalogResponse>(`${HAZARDS_BASE}?${qs}`, {

    session: options?.session,

  });

}



/** Full control library, optionally filtered by hazard category. */

export async function fetchControlCatalog(

  companyId: number,

  projectId?: number,

  options?: {

    hazardCategory?: string;

    hazardCategories?: string[];

    search?: string;

    session?: Session | null;

  },

): Promise<ControlCatalogResponse> {

  const qs = catalogQuery(companyId, projectId, {

    hazardCategory: options?.hazardCategory,

    hazardCategories: options?.hazardCategories?.join(","),

    search: options?.search,

  });

  return apiFetchJson<ControlCatalogResponse>(`${CONTROLS_BASE}?${qs}`, {

    session: options?.session,

  });

}



/** Suggest hazards when a task description is entered. */

export async function suggestHazardsForTask(

  companyId: number,

  projectId: number | undefined,

  params: {

    taskDescription: string;

    locationNote?: string;

    weather?: string;

    existingHazardDescriptions?: string[];

    session?: Session | null;

  },

) {

  const qs = catalogQuery(companyId, projectId, {

    taskDescription: params.taskDescription,

    locationNote: params.locationNote,

    weather: params.weather,

    existingHazards: params.existingHazardDescriptions?.join("|"),

  });

  return apiFetchJson<{

    suggestedHazards: ScoredHazardSuggestion[];

    missedHazards: ScoredHazardSuggestion[];

    matchedTaskProfiles: string[];

    warnings: string[];

  }>(`${HAZARDS_BASE}/suggest?${qs}`, { session: params.session });

}



/** Suggest controls when hazards are selected. */

export async function suggestControlsForHazards(

  companyId: number,

  projectId: number | undefined,

  params: {

    taskDescription?: string;

    hazardCategories?: string[];

    hazardDescriptions?: string[];

    energyTypes?: string[];

    focusedHazardCategory?: string;

    focusedHazardDescription?: string;

    focusedHazardEnergyTypes?: string[];

    existingControlDescriptions?: string[];

    session?: Session | null;

  },

) {

  const qs = catalogQuery(companyId, projectId, {

    taskDescription: params.taskDescription,

    hazardCategories: params.hazardCategories?.join(","),

    hazardDescriptions: params.hazardDescriptions?.join("|"),

    energyTypes: params.energyTypes?.join(","),

    focusedHazardCategory: params.focusedHazardCategory,

    focusedHazardDescription: params.focusedHazardDescription,

    focusedHazardEnergyTypes: params.focusedHazardEnergyTypes?.join(","),

    existingControls: params.existingControlDescriptions?.join("|"),

  });

  return apiFetchJson<{

    suggestedControls: ScoredControlSuggestion[];

    missedControls: ScoredControlSuggestion[];

    warnings: string[];

    crewOftenAdds: Array<{

      description: string;

      controlType?: string;

      count: number;

      reason: string;

    }>;

  }>(`${CONTROLS_BASE}/suggest?${qs}`, { session: params.session });

}


