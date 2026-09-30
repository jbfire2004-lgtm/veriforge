/**
 * Anonymization & Normalization Engine — types
 */

export type EntityPlane = "project" | "company";

export type StandardizedCategory =
  | "heca_gravity"
  | "heca_electrical"
  | "heca_mechanical"
  | "heca_pressure"
  | "heca_chemical"
  | "heca_thermal"
  | "heca_other"
  | "incident_recordable"
  | "incident_lost_time"
  | "incident_near_miss"
  | "incident_first_aid"
  | "leading_observation"
  | "leading_toolbox"
  | "leading_training"
  | "leading_inspection"
  | "leading_permit";

export type RawSensitiveRecord = {
  plane: EntityPlane;
  /** Raw IDs — tokenized, never emitted */
  companyId?: string | number;
  projectId?: string | number;
  industry?: string;
  period?: string;
  regionCode?: string;
  hours?: number;
  recordables?: number;
  lostTimeInjuries?: number;
  nearMisses?: number;
  firstAids?: number;
  severityWeight?: number;
  categories?: Partial<Record<string, number>>;
  // Identifiers / PII — stripped
  companyName?: string;
  projectName?: string;
  workerName?: string;
  siteName?: string;
  siteAddress?: string;
  city?: string;
  street?: string;
  postalCode?: string;
  email?: string;
  phone?: string;
  badgeId?: string;
  employeeNumber?: string;
  gps?: string;
  lat?: number;
  lng?: number;
  ssn?: string;
  taxId?: string;
  contactName?: string;
};

export type NormalizedFact = {
  token: string;
  plane: EntityPlane;
  industryBand: string;
  period: string;
  regionBand: string;
  hours: number;
  incidentRatePer200k: number;
  lostTimeRatePer200k: number;
  nearMissRatePer200k: number;
  firstAidRatePer200k: number;
  severityIndex: number;
  categories: Record<StandardizedCategory, number>;
  ingestedAt: string;
};

export type StripResult = {
  safe: Omit<
    RawSensitiveRecord,
    | "companyId"
    | "projectId"
    | "companyName"
    | "projectName"
    | "workerName"
    | "siteName"
    | "siteAddress"
    | "city"
    | "street"
    | "postalCode"
    | "email"
    | "phone"
    | "badgeId"
    | "employeeNumber"
    | "gps"
    | "lat"
    | "lng"
    | "ssn"
    | "taxId"
    | "contactName"
  >;
  strippedFields: string[];
  tokens: { companyToken: string | null; projectToken: string | null };
};

export type BlindAggregateKey = {
  plane: EntityPlane;
  industryBand: string;
  period: string;
  regionBand: string;
};

export type BlindAggregateResult = {
  key: BlindAggregateKey;
  suppressed: boolean;
  entityCount: number | null;
  entityCountVisible: boolean;
  incidentRatePer200k: number | null;
  lostTimeRatePer200k: number | null;
  nearMissRatePer200k: number | null;
  severityIndex: number | null;
  categories: Partial<Record<StandardizedCategory, number>> | null;
  rule: "min_sample" | "ok";
};

export type PipelineDemoStep = {
  step: string;
  detail: string;
  ok: boolean;
};

export type AnonNormEngineStatus = {
  generatedAt: string;
  revision: number;
  rules: {
    minSample: number;
    hoursDenominator: 200000;
    tokenizeCompanyAndProjectIds: true;
    stripNamesLocationsIdentifiers: true;
    normalizeIncidentsPer200k: true;
    normalizeSeverityIndex: true;
    standardizedCategories: true;
    blindAggregation: true;
  };
  stripFieldCatalog: string[];
  standardizedCategories: StandardizedCategory[];
  factCount: number;
  demo: {
    input: RawSensitiveRecord;
    strip: StripResult;
    fact: NormalizedFact;
    aggregate: BlindAggregateResult;
    steps: PipelineDemoStep[];
  };
  recentAggregates: BlindAggregateResult[];
};
