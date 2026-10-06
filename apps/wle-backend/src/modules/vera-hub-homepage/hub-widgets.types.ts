export type HubWidgetVisibility = {
  workerReadiness: boolean;
  equipmentReadiness: boolean;
  trainingExpiring: boolean;
  safetyAlerts: boolean;
  projectActivity: boolean;
};

export type HubWorkerReadinessSummary = {
  totalWorkers: number;
  compliant: number;
  nonCompliant: number;
  expiringSoon: number;
  complianceRate: number;
  topIssues: { label: string; count: number }[];
  href: string;
};

export type HubEquipmentReadinessSummary = {
  total: number;
  compliant: number;
  nonCompliant: number;
  overdueInspection: number;
  complianceRate: number;
  href: string;
};

export type HubTrainingExpiringSummary = {
  expired: number;
  expiring30: number;
  expiring60: number;
  expiring90: number;
  highRisk: number;
  gaps: number;
  href: string;
};

export type HubSafetyAlertItem = {
  id: string;
  title: string;
  severity: string;
  status: string;
  createdAt: string;
  href: string;
};

export type HubSafetyAlertsSummary = {
  openCount: number;
  highSeverityCount: number;
  items: HubSafetyAlertItem[];
  href: string;
};

export type HubProjectActivityItem = {
  id: string;
  title: string;
  summary: string | null;
  publishedAt: string;
  href: string;
};

export type HubProjectActivitySummary = {
  items: HubProjectActivityItem[];
  href: string;
};

export type HubWidgetsBundle = {
  generatedAt: string;
  visibility: HubWidgetVisibility;
  workerReadiness: HubWorkerReadinessSummary | null;
  equipmentReadiness: HubEquipmentReadinessSummary | null;
  trainingExpiring: HubTrainingExpiringSummary | null;
  safetyAlerts: HubSafetyAlertsSummary | null;
  projectActivity: HubProjectActivitySummary | null;
};

export type HubModuleCardDto = {
  key: string;
  title: string;
  description: string;
  href: string;
  allowed: boolean;
  reason?: 'permission' | 'feature' | 'tier' | 'role';
  features: string[];
};
