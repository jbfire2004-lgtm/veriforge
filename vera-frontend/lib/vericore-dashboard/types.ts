/**
 * VERICore Dashboard — shared types (preview + future Nest backend).
 * Spec: docs/VERIFORGE-VERICORE-DASHBOARD.md
 */

export type RoleBand = "field" | "supervisor" | "office";

export type HoursBasis = "actual" | "estimated" | "unavailable";

export type IndustryCompare = {
  companyValue: number | null;
  industryMean: number | null;
  percentileRank: number | null;
  cohortSize: number;
  sampleSuppressed: boolean;
  period: string;
  direction: "higher_better" | "lower_better";
};

export type Metric = {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  formula: string;
  formulaId: string;
  inputs: Record<string, number | null>;
  asOf: string;
  hoursBasis: HoursBasis;
  industry?: IndustryCompare;
};

export type TrainingByRole = {
  roleBand: RoleBand;
  compliantPct: number;
  overduePct: number;
  headcount: number;
};

export type TrainingByLocation = {
  locationId: string;
  locationName: string;
  compliantPct: number;
  overduePct: number;
  headcount: number;
};

export type ContractorGrade = "A" | "B" | "C" | "D";

export type ContractorCard = {
  contractorCompanyId: number;
  name: string;
  programScore: number;
  grade: ContractorGrade;
  incidentRate: number | null;
  trainingCompliantPct: number;
  flhaJhaCompletionPct: number;
  href: string;
};

export type RelatedCompany = {
  companyId: number;
  name: string;
  linkRole: "owner" | "prime" | "contractor" | "jv" | "related";
  includeInRollup: boolean;
  trainingCompliantPct: number | null;
  incidentRate: number | null;
  programScore: number | null;
  grade: ContractorGrade | null;
  href: string;
};

export type ProjectSummary = {
  projectId: number;
  name: string;
  alertScore: number;
  trainingCompliantPct: number;
  incidentRate: number | null;
  contractorCount: number;
};

export type SafetySlice = {
  workHours: number;
  trainingCompliantPct: number;
  flhaJhaPer1k: number | null;
  highRiskFlhaCount: number;
  incidentRate: number | null;
  nearMissRate: number | null;
  capaClosureDays: number | null;
};

export type VeriCoreCompanyDashboard = {
  generatedAt: string;
  revision: number;
  companyId: number;
  projectId: number | null;
  period: { start: string; end: string };
  filtersApplied: {
    locationId?: string;
    crewId?: string;
    jobId?: string;
    roleBand?: RoleBand;
  };
  training: {
    compliantPct: Metric;
    overduePct: Metric;
    byRole: TrainingByRole[];
    byLocation: TrainingByLocation[];
    industry: IndustryCompare;
  };
  safety: {
    flhaCompleted: Metric;
    jhaCompleted: Metric;
    highRiskFlha: Metric;
    flhaJhaPer1k: Metric;
    incidentRate: Metric;
    nearMissRate: Metric;
    capaClosureDays: Metric;
    toolboxTalks: Metric;
    permitsProtected: Metric;
    permitsHighRisk: Metric;
    industry: {
      incidentRate: IndustryCompare;
      nearMissRate: IndustryCompare;
      capaClosureDays: IndustryCompare;
    };
  };
  contractors: ContractorCard[];
  projectsSummary: ProjectSummary[];
  freshness: {
    lastEventAt: string | null;
    lastRebuildAt: string;
    pendingInvalidation: boolean;
  };
};

export type VeriCoreProjectDashboard = VeriCoreCompanyDashboard & {
  combined: {
    companyWorkers: SafetySlice;
    contractors: SafetySlice;
    rollup: SafetySlice;
  };
  relatedCompanies: RelatedCompany[];
};

export type WorkerSummary = {
  workerId: string;
  workerName: string;
  roleBand: RoleBand;
  locationId: string;
  locationName: string;
  trainingCompliant: boolean;
  overdueCourseCount: number;
};

export type VeriCoreWorkerDashboard = {
  generatedAt: string;
  revision: number;
  companyId: number;
  worker: WorkerSummary & {
    coursesTotal: number;
    coursesCompliant: number;
  };
  period: { start: string; end: string };
  training: {
    compliantPct: Metric;
    overduePct: Metric;
    records: Array<{
      id: string;
      courseName: string;
      status: string;
      dueAt: string | null;
      href: string;
    }>;
  };
  safety: {
    flhaCompleted: Metric;
    jhaCompleted: Metric;
    highRiskFlha: Metric;
    incidentRate: Metric;
    nearMissRate: Metric;
    toolboxTalks: Metric;
  };
  documents: Array<{
    id: string;
    kind: string;
    title: string;
    status: string;
    completedAt: string;
    href: string;
    documentId: string;
  }>;
  freshness: {
    lastEventAt: string | null;
    lastRebuildAt: string;
    pendingInvalidation: boolean;
  };
};

export type DrillItem = {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  dueAt?: string;
  href: string;
  documentId?: string;
  documentType?: string;
  meta?: Record<string, string | number | null>;
};

export type DrillResponse = {
  metricKey: string;
  label: string;
  formula: string;
  formulaId: string;
  inputs: Record<string, number | null>;
  filters: Record<string, string | undefined>;
  page: number;
  pageSize: number;
  total: number;
  items: DrillItem[];
};

export type RevisionResponse = {
  revision: number;
  generatedAt: string;
  pendingInvalidation: boolean;
};
