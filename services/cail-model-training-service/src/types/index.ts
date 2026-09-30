export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export type TrainingJobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface DatasetReferenceInput {
  datasetId: string;
  datasetVersion?: string;
  sourceType: string;
  metadata?: Record<string, unknown>;
}

export interface ModelArtifactInput {
  artifactUri: string;
  artifactType: string;
  checksum?: string;
  sizeBytes?: number;
  metadata?: Record<string, unknown>;
}
