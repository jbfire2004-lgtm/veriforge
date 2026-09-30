import { apiFetchJson } from '@/lib/api-client';

const BASE = '/api/v1/pm/sms';

export type SclState = 'safe' | 'conditional' | 'loss';
export type EnergyControlState = 'controlled' | 'uncontrolled' | 'partially_controlled';

export type SmsRiskContext = {
  id: string;
  entityType: string;
  entityId: string;
  projectId?: number | null;
  sclState?: SclState | null;
  hecaInvolved: boolean;
  hecaCategoryCode?: string | null;
  energyTypesJson?: string[];
  energyControlState?: EnergyControlState | null;
  highEnergyFlag: boolean;
  escalationScore: number;
  requiresInvestigation: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SmsHecaLibraryEntry = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  hecaType: string;
  energyTypesJson?: string[];
  requiredControlsJson?: string[];
  verificationStepsJson?: string[];
  active?: boolean;
};

export type SmsWeeklyForecast = {
  id: string;
  weekStart: string;
  forecastJson?: Record<string, unknown>;
  alertsJson?: unknown[];
  recommendationsJson?: unknown[];
  sclBreakdownJson?: Record<string, number>;
  hecaHotspotsJson?: unknown[];
  energyGapsJson?: unknown[];
};

export type SmsLeadingIndicators = {
  sclDistribution: Record<string, number>;
  hecaHighEnergyConditionalLoss: number;
  energyControlGaps: Record<string, number>;
  weeklyForecasts?: SmsWeeklyForecast[];
};

export type SmsNotificationRoute = {
  id: string;
  eventKey: string;
  templateKey: string;
  channelsJson: string[];
  rolesJson: string[];
  escalateOnHecaHighEnergy?: boolean;
  active?: boolean;
};

export async function fetchSmsMeta() {
  return apiFetchJson<{ pillars: string[]; sclStates: string[]; energyCatalog: unknown }>(
    `${BASE}/meta`,
  );
}

export async function fetchHecaLibrary(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set('projectId', String(projectId));
  return apiFetchJson<SmsHecaLibraryEntry[]>(`${BASE}/heca-library?${q}`);
}

export async function seedHecaLibrary(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set('projectId', String(projectId));
  return apiFetchJson<SmsHecaLibraryEntry[]>(`${BASE}/heca-library/seed?${q}`, {
    method: 'POST',
  });
}

export async function fetchRiskContextList(
  companyId: number,
  filters?: {
    projectId?: number;
    sclState?: SclState;
    hecaOnly?: boolean;
    highEnergyOnly?: boolean;
  },
) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (filters?.projectId) q.set('projectId', String(filters.projectId));
  if (filters?.sclState) q.set('sclState', filters.sclState);
  if (filters?.hecaOnly) q.set('hecaOnly', 'true');
  if (filters?.highEnergyOnly) q.set('highEnergyOnly', 'true');
  return apiFetchJson<SmsRiskContext[]>(`${BASE}/risk-context?${q}`);
}

export async function fetchNotificationRoutes(companyId: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  return apiFetchJson<SmsNotificationRoute[]>(`${BASE}/notifications/routes?${q}`);
}

export async function seedNotificationRoutes(companyId: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  return apiFetchJson<SmsNotificationRoute[]>(`${BASE}/notifications/routes/seed?${q}`, {
    method: 'POST',
  });
}

export async function tagInspectionFinding(
  findingId: string,
  body: {
    companyId: number;
    projectId: number;
    baseSeverity: 'low' | 'medium' | 'high' | 'critical';
    sclState?: SclState;
    hecaInvolved?: boolean;
    hecaCategoryCode?: string;
    energyTypes?: string[];
    energyControlState?: EnergyControlState;
    highEnergyFlag?: boolean;
  },
) {
  return apiFetchJson(`${BASE}/inspections/findings/${findingId}/tags`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function classifyInvestigationScl(
  eventId: string,
  body: {
    sclState: SclState;
    triggers?: string[];
    precursors?: string[];
    potentialSeverity?: string;
    actorId?: number;
  },
) {
  return apiFetchJson(`${BASE}/investigations/${eventId}/scl`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function fetchLeadingIndicators(companyId: number, projectId?: number) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set('projectId', String(projectId));
  return apiFetchJson<SmsLeadingIndicators>(`${BASE}/analytics/leading-indicators?${q}`);
}

export function mapFindingSeverity(
  severity: string | undefined,
): 'low' | 'medium' | 'high' | 'critical' {
  const s = (severity ?? 'medium').toLowerCase();
  if (s === 'critical') return 'critical';
  if (s === 'high') return 'high';
  if (s === 'low') return 'low';
  return 'medium';
}
