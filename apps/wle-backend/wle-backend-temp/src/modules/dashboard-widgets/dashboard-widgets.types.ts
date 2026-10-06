export type WorkerComplianceWidgetData = {
  totalWorkers: number;
  evaluated: number;
  compliant: number;
  nonCompliant: number;
  expiringSoon: number;
  complianceRate: number;
  topIssues: { label: string; count: number }[];
};

export type EquipmentComplianceWidgetData = {
  total: number;
  compliant: number;
  nonCompliant: number;
  lockedOut: number;
  overdueInspection: number;
  complianceRate: number;
  nextInspectionDue?: string | null;
};

export type TrainingExpiryWidgetData = {
  expired: number;
  expiring30: number;
  expiring60: number;
  expiring90: number;
  highRisk: number;
  gaps: number;
};

export type ProjectReadinessWidgetData = {
  averageReadiness: number;
  totalProjects: number;
  ready: number;
  atRisk: number;
  notReady: number;
  missingWorkers: number;
  missingEquipment: number;
  missingTraining: number;
};

export type ProviderApprovalWidgetData = {
  approved: number;
  pending: number;
  rejected: number;
  expiringApprovals: number;
};

export type UnionDispatchWidgetData = {
  readyForDispatch: number;
  missingTraining: number;
  currentlyDispatched: number;
  activeMembers: number;
  totalDispatches: number;
};

export type SystemHealthWidgetData = {
  workers: number;
  equipment: number;
  companies: number;
  trainingRecords: number;
  openIncidents: number;
  status: 'healthy' | 'degraded' | 'critical';
};

export type AssignmentsWidgetData = {
  activeAssignments: number;
  atRisk: number;
  totalWorkers: number;
};

export type DashboardWidgetsBundle = {
  generatedAt: string;
  workerCompliance?: WorkerComplianceWidgetData;
  equipmentCompliance?: EquipmentComplianceWidgetData;
  trainingExpiry?: TrainingExpiryWidgetData;
  projectReadiness?: ProjectReadinessWidgetData;
  providerApprovals?: ProviderApprovalWidgetData;
  unionDispatch?: UnionDispatchWidgetData;
  systemHealth?: SystemHealthWidgetData;
  assignments?: AssignmentsWidgetData;
};
