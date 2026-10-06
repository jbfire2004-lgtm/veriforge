export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type EntityRiskScore = {
  entityType: 'worker' | 'contractor' | 'task' | 'location';
  entityId: string;
  label: string;
  riskScore: number;
  riskLevel: RiskLevel;
  probability: number;
  factors: string[];
  metadata?: Record<string, unknown>;
};

export type WeeklyForecastDay = {
  date: string;
  dayOfWeek: string;
  riskIndex: number;
  riskLevel: RiskLevel;
  drivers: string[];
};

export type WeeklyRiskForecast = {
  weekStart: string;
  weekEnd: string;
  overallRiskIndex: number;
  overallRiskLevel: RiskLevel;
  days: WeeklyForecastDay[];
  trend: 'improving' | 'stable' | 'worsening';
};

export type PreventiveAction = {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  targetEntity?: { type: string; id: string; label: string };
  evidence: string[];
  confidence: number;
};

export type PredictiveAnalyticsBundle = {
  generatedAt: string;
  companyId: number;
  projectId?: number;
  modelKey: string;
  modelVersion: number;
  summary: {
    overallRiskIndex: number;
    overallRiskLevel: RiskLevel;
    highRiskWorkers: number;
    highRiskContractors: number;
    highRiskTasks: number;
    highRiskLocations: number;
    openAlerts: number;
  };
  highRiskWorkers: EntityRiskScore[];
  highRiskContractors: EntityRiskScore[];
  highRiskTasks: EntityRiskScore[];
  highRiskLocations: EntityRiskScore[];
  weeklyForecast: WeeklyRiskForecast;
  preventiveActions: PreventiveAction[];
  dataQuality: {
    recordsIngested: number;
    modules: string[];
    windowDays: number;
  };
};

export type ExtractedFeatures = {
  inspections: Array<Record<string, unknown>>;
  incidents: Array<Record<string, unknown>>;
  correctiveActions: Array<Record<string, unknown>>;
  training: Array<Record<string, unknown>>;
  equipment: Array<Record<string, unknown>>;
};
