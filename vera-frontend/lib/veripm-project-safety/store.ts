/**
 * In-memory project safety facts — project-level only.
 */

import { tokenizeProjectId } from "./normalize";
import type {
  ProjectType,
  RegionCode,
  ScaleBand,
} from "./types";
import { PROJECT_TYPES, REGION_CODES, SCALE_BANDS } from "./types";

export type RawProjectSeed = {
  rawId: string;
  displaySeed: string;
  projectType: ProjectType;
  region: RegionCode;
  scale: ScaleBand;
};

export type PeriodCounts = {
  period: string;
  hours: number;
  observations: number;
  nearMisses: number;
  toolboxTalks: number;
  trainingCurrent: number;
  trainingRequired: number;
  permitsCompliant: number;
  permitsTotal: number;
  inspectionsDone: number;
  inspectionsPlanned: number;
  recordables: number;
  lostTime: number;
  firstAids: number;
  severityWeight: number;
  auditsCompleted: number;
  auditFindings: number;
  auditCritical: number;
  auditClosed: number;
  intelligentInspections: number;
  aiFlagged: number;
  highRiskClosed: number;
  highRiskTotal: number;
  caOpen: number;
  caOverdue: number;
  caClosedOnTime: number;
  caClosedTotal: number;
  caAgeSumDays: number;
  caAging: Record<"0-7d" | "8-30d" | "31-60d" | "61-90d" | "90d+", number>;
};

export type ProjectFact = {
  token: string;
  label: string;
  projectType: ProjectType;
  region: RegionCode;
  scale: ScaleBand;
  periods: PeriodCounts[];
};

type Store = {
  revision: number;
  projects: ProjectFact[];
};

const g = globalThis as unknown as { __veripmProjectSafety?: Store };

const PERIODS = ["2025-Q4", "2026-Q1", "2026-Q2"];

function seedProjects(): ProjectFact[] {
  const out: ProjectFact[] = [];
  let n = 0;
  for (const projectType of PROJECT_TYPES) {
    for (let i = 0; i < 5; i++) {
      n += 1;
      const region = REGION_CODES[(n + i) % REGION_CODES.length]!;
      const scale = SCALE_BANDS[(n + i) % SCALE_BANDS.length]!;
      const rawId = `PM-PROJ-${1000 + n}`;
      const token = tokenizeProjectId(rawId);
      const scaleHours =
        scale === "small" ? 42000 : scale === "medium" ? 98000 : scale === "large" ? 185000 : 320000;
      const periods: PeriodCounts[] = PERIODS.map((period, pi) => {
        const hours = scaleHours + pi * 4000 + i * 2500;
        const base = n * 3 + pi * 2 + i;
        const caAging = {
          "0-7d": 2 + (base % 3),
          "8-30d": 3 + (base % 4),
          "31-60d": 1 + (base % 3),
          "61-90d": base % 2,
          "90d+": base % 3 === 0 ? 1 : 0,
        } as const;
        const caOpen = Object.values(caAging).reduce((a, b) => a + b, 0);
        return {
          period,
          hours,
          observations: 18 + (base % 20),
          nearMisses: 2 + (base % 6),
          toolboxTalks: 12 + (base % 10),
          trainingCurrent: 40 + (base % 15),
          trainingRequired: 50 + (base % 8),
          permitsCompliant: 22 + (base % 8),
          permitsTotal: 25 + (base % 6),
          inspectionsDone: 14 + (base % 9),
          inspectionsPlanned: 16 + (base % 5),
          recordables: 1 + (base % 3),
          lostTime: base % 2,
          firstAids: 3 + (base % 5),
          severityWeight: 1.1 + (base % 5) * 0.3,
          auditsCompleted: 3 + (base % 4),
          auditFindings: 4 + (base % 7),
          auditCritical: base % 3,
          auditClosed: 3 + (base % 5),
          intelligentInspections: 8 + (base % 6),
          aiFlagged: 1 + (base % 4),
          highRiskClosed: 4 + (base % 4),
          highRiskTotal: 5 + (base % 3),
          caOpen,
          caOverdue: caAging["61-90d"] + caAging["90d+"],
          caClosedOnTime: 8 + (base % 6),
          caClosedTotal: 10 + (base % 5),
          caAgeSumDays: caOpen * (12 + (base % 20)),
          caAging: { ...caAging },
        };
      });
      out.push({
        token,
        label: `${projectType.slice(0, 3).toUpperCase()}-${region}-${scale[0]!.toUpperCase()}${n}`,
        projectType,
        region,
        scale,
        periods,
      });
    }
  }
  return out;
}

function store(): Store {
  if (!g.__veripmProjectSafety) {
    g.__veripmProjectSafety = { revision: 1, projects: seedProjects() };
  }
  return g.__veripmProjectSafety;
}

export function listProjects(): ProjectFact[] {
  return store().projects;
}

export function getProject(token: string): ProjectFact | undefined {
  return store().projects.find((p) => p.token === token);
}

export function getRevision(): number {
  return store().revision;
}

export function bumpRevision(): number {
  store().revision += 1;
  return store().revision;
}

/** Peer projects for industry compare — same project type unless cross-category. */
export function getPeerProjects(args: {
  projectType: ProjectType;
  region: RegionCode;
  scale: ScaleBand;
  excludeToken: string;
  crossCategoryOptIn: boolean;
}): ProjectFact[] {
  return store().projects.filter((p) => {
    if (p.token === args.excludeToken) return false;
    if (args.crossCategoryOptIn) return true;
    // Project-level only: same type. Region/scale refine when enough peers exist.
    return p.projectType === args.projectType;
  });
}
