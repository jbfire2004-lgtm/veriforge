import type {
  ActionKind,
  ActionPlane,
  ActionStatus,
  AgingBucket,
  CamSelectors,
  CloseOutStage,
  CreateActionInput,
  ManagedAction,
  MutateActionInput,
} from "./types";

const HOURS = 200_000;
const MIN_SAMPLE = 5;

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function tokenizeAction(raw: string): string {
  return `act_${hash(raw)}`;
}

export function tokenizeEntity(plane: ActionPlane, raw: string): string {
  return `${plane === "project" ? "proj" : "co"}_${hash(raw)}`;
}

export function ratePer200k(count: number, hours: number): number {
  if (hours <= 0) return 0;
  return Math.round((count / hours) * HOURS * 100) / 100;
}

export { HOURS as HOURS_DENOMINATOR, MIN_SAMPLE };

const ROOT_CAUSES = [
  { label: "Energy control failure", pathway: "energy" },
  { label: "Procedural non-compliance", pathway: "procedure" },
  { label: "Competency gap", pathway: "people" },
  { label: "Equipment integrity", pathway: "equipment" },
  { label: "Housekeeping / layout", pathway: "environment" },
  { label: "Communication breakdown", pathway: "communication" },
];

const OWNERS = [
  "A. Reyes",
  "J. Okonkwo",
  "M. Chen",
  "S. Patel",
  "L. Johansson",
  "Unassigned",
];

const TITLE_CA = [
  "Restore conveyor guard interlock",
  "Verify LOTO on jam-clear stations",
  "Secure temporary access overnight installs",
  "Repair exclusion-zone barriers",
  "Replace damaged ladder rung",
  "Close out struck-by near-miss controls",
];

const TITLE_PA = [
  "Add pre-shift guard/LOTO checklist",
  "Schedule competency refresh — energy isolation",
  "Increase PPE spot checks in cutting bays",
  "Update lift plan briefing template",
  "Automate morning access inspection queue",
  "Industry peer: housekeeping blitz cadence",
];

const STAGES: CloseOutStage[] = [
  "assigned",
  "implemented",
  "verified",
  "effectiveness_reviewed",
  "closed",
];

type Store = {
  revision: number;
  actions: ManagedAction[];
};

const GLOBAL_KEY = "__verisuite_cam_store_v2__";

function store(): Store {
  const g = globalThis as typeof globalThis & { [GLOBAL_KEY]?: Store };
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = { revision: 1, actions: seedActions() };
  }
  return g[GLOBAL_KEY];
}

function seedActions(): ManagedAction[] {
  const out: ManagedAction[] = [];
  const industries: CamSelectors["industry"][] = [
    "mining",
    "construction",
    "manufacturing",
    "utilities",
  ];
  const regions = ["CA-AB", "CA-BC", "US-TX", "US-NV", "GLB"];
  let n = 0;
  for (const plane of ["project", "company"] as ActionPlane[]) {
    for (let e = 0; e < 8; e++) {
      const entity = tokenizeEntity(plane, `${plane}-${e}`);
      const industry = industries[e % industries.length]!;
      const regionCode = regions[e % regions.length]!;
      for (let a = 0; a < 6; a++) {
        n++;
        const kind: ActionKind = a % 3 === 0 ? "preventive" : "corrective";
        const ageDays = 3 + ((n * 7) % 110);
        const overdue = ageDays > 45 && a % 4 !== 0;
        const closed = a % 5 === 0;
        const status: ActionStatus = closed
          ? "closed"
          : overdue
            ? "overdue"
            : a % 2 === 0
              ? "in_progress"
              : "open";
        const stageIdx = closed ? 4 : Math.min(3, a % 4);
        const rc = ROOT_CAUSES[(n + a) % ROOT_CAUSES.length]!;
        const ownerName = OWNERS[(n + a) % OWNERS.length]!;
        const title =
          kind === "corrective"
            ? TITLE_CA[(n + a) % TITLE_CA.length]!
            : TITLE_PA[(n + a) % TITLE_PA.length]!;
        const source =
          kind === "preventive"
            ? a % 2 === 0
              ? "inspection"
              : "risk_assessment"
            : (["incident", "near_miss", "audit", "inspection"] as const)[a % 4]!;
        const due = new Date("2026-07-01T00:00:00.000Z");
        due.setDate(due.getDate() + (30 - (ageDays % 40)));
        out.push({
          actionToken: tokenizeAction(`${plane}-${e}-${a}-v2`),
          title,
          description:
            kind === "corrective"
              ? `Corrective Action from ${source.replace(/_/g, " ")}: address ${rc.label.toLowerCase()} and verify field evidence before close-out.`
              : `Preventive Action from ${source.replace(/_/g, " ")} findings: reduce recurrence of ${rc.label.toLowerCase()}.`,
          kind,
          status,
          closeOutStage: STAGES[stageIdx]!,
          owner: ownerName === "Unassigned" ? null : ownerName,
          progressPct: closed
            ? 100
            : Math.min(95, 15 + stageIdx * 20 + (a % 3) * 5),
          ageDays,
          dueAt: closed ? null : due.toISOString(),
          effectivenessScore: closed ? 55 + ((n * 3) % 40) : null,
          severityBand:
            ageDays > 90 || overdue
              ? "critical"
              : ageDays > 60
                ? "elevated"
                : ageDays > 30
                  ? "moderate"
                  : "low",
          source,
          sourceLabel:
            source === "incident"
              ? `Incident INC-${1000 + (n % 80)}`
              : source === "inspection"
                ? `Inspection INSP-${2000 + (n % 60)}`
                : source === "near_miss"
                  ? `Near miss NM-${300 + (n % 40)}`
                  : source.replace(/_/g, " "),
          rootCauses: [
            {
              rootCauseToken: `rc_${hash(rc.label)}`,
              rootCauseLabel: rc.label,
              pathway: rc.pathway,
              weight: 0.55 + ((n % 4) * 0.1),
            },
          ],
          plane,
          entityToken: entity,
          regionCode,
          industry,
          period: "2026-Q2",
          openedAt: "2026-04-01T00:00:00.000Z",
          closedAt: closed ? "2026-06-15T00:00:00.000Z" : null,
        });
      }
    }
  }
  return out;
}

export function getRevision(): number {
  return store().revision;
}

export function bumpRevision(): number {
  return ++store().revision;
}

export function listActions(sel: Partial<CamSelectors>): ManagedAction[] {
  const plane = sel.plane;
  const industry = sel.industry;
  const period = sel.period ?? "2026-Q2";
  const regionCode = sel.regionCode ?? "GLB";
  return store().actions.filter((a) => {
    if (plane && a.plane !== plane) return false;
    if (industry && a.industry !== industry) return false;
    if (a.period !== period) return false;
    if (regionCode !== "GLB" && a.regionCode !== regionCode) return false;
    if (sel.projectToken && a.plane === "project" && a.entityToken !== sel.projectToken)
      return false;
    if (sel.companyToken && a.plane === "company" && a.entityToken !== sel.companyToken)
      return false;
    return true;
  });
}

export function getAction(actionToken: string): ManagedAction | null {
  return store().actions.find((a) => a.actionToken === actionToken) ?? null;
}

export function createManagedAction(input: CreateActionInput): ManagedAction {
  const plane = input.plane ?? "project";
  const industry = input.industry ?? "construction";
  const period = input.period ?? "2026-Q2";
  const regionCode = input.regionCode ?? "GLB";
  const rcLabel = input.rootCauseLabel ?? "Procedural non-compliance";
  const rc =
    ROOT_CAUSES.find((r) => r.label === rcLabel) ?? ROOT_CAUSES[1]!;
  const kind = input.kind;
  const source = input.source ?? (kind === "preventive" ? "inspection" : "incident");
  const now = new Date().toISOString();
  const due = new Date();
  due.setDate(due.getDate() + 30);
  const action: ManagedAction = {
    actionToken: tokenizeAction(`${plane}:${input.title}:${Date.now()}`),
    title: input.title.trim() || "New action",
    description:
      input.description?.trim() ||
      `${kind === "corrective" ? "Corrective" : "Preventive"} Action — ${rcLabel}`,
    kind,
    status: "open",
    closeOutStage: input.owner ? "assigned" : "assigned",
    owner: input.owner?.trim() || null,
    progressPct: input.owner ? 10 : 0,
    ageDays: 0,
    dueAt: due.toISOString(),
    effectivenessScore: null,
    severityBand: input.severityBand ?? "moderate",
    source,
    sourceLabel: input.sourceLabel ?? (kind === "corrective" ? "Manual / incident" : "Inspection finding"),
    rootCauses: [
      {
        rootCauseToken: `rc_${hash(rc.label)}`,
        rootCauseLabel: rc.label,
        pathway: rc.pathway,
        weight: 0.7,
      },
    ],
    plane,
    entityToken: tokenizeEntity(plane, `${plane}-live`),
    regionCode,
    industry,
    period,
    openedAt: now,
    closedAt: null,
  };
  store().actions.unshift(action);
  bumpRevision();
  return action;
}

export function mutateManagedAction(
  input: MutateActionInput,
): ManagedAction | null {
  const s = store();
  const idx = s.actions.findIndex((a) => a.actionToken === input.actionToken);
  if (idx < 0) return null;
  const cur = s.actions[idx]!;
  let next: ManagedAction = { ...cur };

  if (input.owner !== undefined) {
    next = {
      ...next,
      owner: input.owner,
      closeOutStage:
        next.closeOutStage === "assigned" || !next.owner
          ? "assigned"
          : next.closeOutStage,
      status: next.status === "open" && input.owner ? "in_progress" : next.status,
      progressPct: Math.max(next.progressPct, input.owner ? 10 : 0),
    };
  }
  if (input.progressPct != null) {
    next = {
      ...next,
      progressPct: Math.max(0, Math.min(100, input.progressPct)),
      status:
        input.progressPct >= 100
          ? next.status
          : next.status === "open"
            ? "in_progress"
            : next.status,
    };
  }
  if (input.closeOutStage) {
    const stageIdx = STAGES.indexOf(input.closeOutStage);
    next = {
      ...next,
      closeOutStage: input.closeOutStage,
      progressPct: Math.max(
        next.progressPct,
        stageIdx <= 0 ? 10 : Math.min(95, stageIdx * 22),
      ),
      status:
        input.closeOutStage === "closed"
          ? "closed"
          : input.closeOutStage === "verified" ||
              input.closeOutStage === "effectiveness_reviewed"
            ? "pending_verification"
            : "in_progress",
    };
  }
  if (input.status) {
    next = { ...next, status: input.status };
  }
  if (input.effectivenessScore !== undefined) {
    next = { ...next, effectivenessScore: input.effectivenessScore };
  }
  if (input.close || input.closeOutStage === "closed") {
    next = {
      ...next,
      status: "closed",
      closeOutStage: "closed",
      progressPct: 100,
      closedAt: new Date().toISOString(),
      dueAt: null,
      effectivenessScore: next.effectivenessScore ?? 72,
    };
  }

  s.actions[idx] = next;
  bumpRevision();
  return next;
}

export function hoursForCohort(count: number): number {
  return Math.max(40_000, count * 12_500);
}

export function agingBucket(days: number): AgingBucket {
  if (days <= 7) return "0-7d";
  if (days <= 30) return "8-30d";
  if (days <= 60) return "31-60d";
  if (days <= 90) return "61-90d";
  return "90d+";
}

export function median(nums: number[]): number {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1]! + sorted[mid]!) / 2) * 10) / 10;
  }
  return sorted[mid]!;
}
