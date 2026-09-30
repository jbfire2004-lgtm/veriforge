/**
 * VeriPM SIF/HECA Hub — unified serious injury & fatality / HECA module.
 */

export type SifHecaAccessPlane = "project" | "company" | "subcontractor";

export type TrendPoint = { period: string; value: number };

/** Canonical energy exposure keys for the unified module. */
export const SIF_HECA_ENERGY_KEYS = [
  "gravity",
  "motion",
  "electrical",
  "pressure",
  "chemical",
  "thermal",
  "radiation",
] as const;

export type SifHecaEnergyKey = (typeof SIF_HECA_ENERGY_KEYS)[number];

export type SifHecaEnergyExposure = {
  key: SifHecaEnergyKey;
  label: string;
  /** Exposure / occurrence share 0–100 */
  exposurePct: number;
  /** Control coverage / verification adequacy 0–100 */
  controlScore: number;
  highEnergy: boolean;
  openExposures: number;
};

export type SifHecaQueueItem = {
  id: string;
  title: string;
  status: string;
  sifCategory: string;
  hecaLabel: string;
  highEnergy: boolean;
  href: string;
};

export type SifHecaOpenAction = {
  id: string;
  title: string;
  source: string;
  dueLabel: string;
  overdue: boolean;
  href: string;
};

export type SifHecaHubDashboard = {
  generatedAt: string;
  revision: number;
  plane: SifHecaAccessPlane;
  scopeLabel: string;
  projectId: number;
  companyId: number;
  periodLabel: string;
  kpis: {
    sifExposures: number;
    hecaCompleted: number;
    openActions: number;
    criticalControlVerificationRate: number;
    deltas: {
      sifExposures: number;
      hecaCompleted: number;
      openActions: number;
      criticalControlVerificationRate: number;
    };
  };
  energyBreakdown: SifHecaEnergyExposure[];
  verificationTrend: TrendPoint[];
  sifTrend: TrendPoint[];
  queue: SifHecaQueueItem[];
  openActions: SifHecaOpenAction[];
  insights: Array<{
    id: string;
    tone: "neutral" | "positive" | "caution" | "alert";
    headline: string;
    body: string;
    href?: string;
  }>;
  links: {
    smsCore: string;
    actionManagement: string;
    fieldOs: string;
    safetyHub: string;
    emergencyResponse: string;
    safetyIntelligence: string;
    projects: string;
    evaluate: string;
    jhaFlha: string;
  };
  rules: { neverEmpty: true; planeIsolated: true };
};
