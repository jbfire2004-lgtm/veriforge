export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface DomainEventPayload {
  name: string;
  occurredAt: string;
  actorId?: string | number;
  companyId?: string | number;
  projectId?: string | number;
  entityType?: string;
  entityId?: string | number;
  data?: Record<string, unknown>;
}

export interface RawIngestRecord {
  module: string;
  id: string;
  payload: Record<string, unknown>;
  labels?: Record<string, unknown>;
}

export interface NormalizedRecord {
  sourceModule: string;
  sourceId: string;
  featureJson: Record<string, unknown>;
  labelJson?: Record<string, unknown>;
  qualityScore: number;
  tags: string[];
}

export interface NormalizationReport {
  records: NormalizedRecord[];
  missing: string[];
  conflicts: string[];
  outliers: string[];
  anomalies: string[];
}

export interface FeatureSet {
  eventName?: string;
  sourceModule: string;
  sourceId: string;
  companyId: string;
  projectId?: string;
  entityType?: string;
  entityId?: string;
  occurredAt: string;
  numeric: Record<string, number>;
  categorical: Record<string, string>;
  tags: string[];
  raw: Record<string, unknown>;
}

export interface AnomalyFinding {
  sourceModule: string;
  sourceId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export interface IngestResult {
  stored: number;
  skipped: number;
  anomalies: AnomalyFinding[];
  datasetReference: string;
  modelId: string;
  version: number;
}

export interface IngestStats {
  companyId: string;
  totalRecords: number;
  anomalyCount: number;
  byModel: Array<{ modelId: string; version: number; count: number }>;
  byDataset: Array<{ datasetReference: string; count: number }>;
  bySourceEvent: Array<{ sourceEvent: string; count: number }>;
  eventsProcessed: Record<string, number>;
  lastIngestedAt: string | null;
}
