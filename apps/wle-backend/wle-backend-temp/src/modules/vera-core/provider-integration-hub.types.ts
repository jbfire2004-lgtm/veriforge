export type ProviderIntegrationChannel = {
  key: string;
  label: string;
  status: 'healthy' | 'degraded' | 'offline';
  lastActivityAt: string | null;
  pendingCount: number;
  failedCount24h: number;
};

export type ProviderHubProviderRow = {
  id: number;
  name: string;
  code: string | null;
  approvalStatus: string;
  active: boolean;
  recordCount90d: number;
  lastRecordAt: string | null;
  complianceStatus: string | null;
};

export type ProviderHubIngestionRow = {
  id: number;
  status: string;
  sourceChannel: string;
  originalFilename: string;
  createdAt: string;
  completedAt: string | null;
  recordsCreated: number;
  errorMessage: string | null;
};

export type ProviderHubValidationRow = {
  id: number;
  outcome: string;
  subjectType: string;
  trainingProviderId: number | null;
  trainingRecordId: number | null;
  missingStandardCodes: string[];
  validatedAt: string;
};

export type ProviderIntegrationHubSummary = {
  generatedAt: string;
  companyId: number;
  channels: ProviderIntegrationChannel[];
  providers: ProviderHubProviderRow[];
  recentIngestion: ProviderHubIngestionRow[];
  recentValidationFailures: ProviderHubValidationRow[];
  metrics: {
    providersActive: number;
    providersPendingApproval: number;
    ingestionSuccessRate90d: number;
    recordsFromProviders90d: number;
    validationFailures90d: number;
    pendingVerification: number;
  };
  eventFlow: string[];
};
