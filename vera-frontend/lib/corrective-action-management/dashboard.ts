import type {
  ActionAgingSummary,
  ActionInsight,
  CamDashboard,
  CamSelectors,
  CloseOutFunnel,
  CloseOutStage,
  EffectivenessSummary,
  ManagedAction,
  PlaneActionDashboard,
  RootCauseActionFlow,
  SmartActionSuggestion,
} from "./types";
import {
  HOURS_DENOMINATOR,
  MIN_SAMPLE,
  agingBucket,
  bumpRevision,
  getRevision,
  hoursForCohort,
  listActions,
  median,
  ratePer200k,
} from "./store";

const STAGES: CloseOutStage[] = [
  "assigned",
  "implemented",
  "verified",
  "effectiveness_reviewed",
  "closed",
];

function buildAging(actions: ManagedAction[], hours: number): ActionAgingSummary {
  const open = actions.filter((a) => a.status !== "closed");
  const buckets = (["0-7d", "8-30d", "31-60d", "61-90d", "90d+"] as const).map(
    (bucket) => {
      const inBucket = open.filter((a) => agingBucket(a.ageDays) === bucket);
      const corrective = inBucket.filter((a) => a.kind === "corrective").length;
      const preventive = inBucket.filter((a) => a.kind === "preventive").length;
      const count = corrective + preventive;
      return {
        bucket,
        corrective,
        preventive,
        sharePct: open.length ? Math.round((count / open.length) * 1000) / 10 : 0,
        ratePer200k: ratePer200k(count, hours),
      };
    },
  );
  const closed = actions.filter((a) => a.status === "closed");
  const onTime = closed.filter((a) => a.ageDays <= 30).length;
  const ages = open.map((a) => a.ageDays);
  return {
    openCorrective: open.filter((a) => a.kind === "corrective").length,
    openPreventive: open.filter((a) => a.kind === "preventive").length,
    openTotal: open.length,
    overdue: open.filter((a) => a.status === "overdue").length,
    avgAgeDays: open.length
      ? Math.round(
          (open.reduce((s, a) => s + a.ageDays, 0) / open.length) * 10,
        ) / 10
      : 0,
    medianAgeDays: median(ages),
    onTimeClosurePct: closed.length
      ? Math.round((onTime / closed.length) * 1000) / 10
      : 0,
    histogram: buckets,
  };
}

function buildEffectiveness(actions: ManagedAction[]): EffectivenessSummary {
  const reviewed = actions.filter((a) => a.effectivenessScore != null);
  if (reviewed.length < MIN_SAMPLE) {
    return {
      reviewedCount: reviewed.length,
      avgScore: null,
      effectivePct: null,
      recurringPct: null,
      suppressed: true,
    };
  }
  const avg =
    reviewed.reduce((s, a) => s + (a.effectivenessScore ?? 0), 0) / reviewed.length;
  const effective = reviewed.filter((a) => (a.effectivenessScore ?? 0) >= 70).length;
  const recurring = reviewed.filter((a) => (a.effectivenessScore ?? 0) < 50).length;
  return {
    reviewedCount: reviewed.length,
    avgScore: Math.round(avg * 10) / 10,
    effectivePct: Math.round((effective / reviewed.length) * 1000) / 10,
    recurringPct: Math.round((recurring / reviewed.length) * 1000) / 10,
    suppressed: false,
  };
}

function buildCloseOut(actions: ManagedAction[]): CloseOutFunnel[] {
  const total = actions.length || 1;
  return STAGES.map((stage) => {
    const count = actions.filter((a) => a.closeOutStage === stage).length;
    return {
      stage,
      count,
      sharePct: Math.round((count / total) * 1000) / 10,
    };
  });
}

function buildRootCauseFlows(actions: ManagedAction[]): RootCauseActionFlow[] {
  const map = new Map<string, RootCauseActionFlow & { scores: number[] }>();
  for (const a of actions) {
    for (const rc of a.rootCauses) {
      const cur = map.get(rc.rootCauseLabel) ?? {
        rootCauseLabel: rc.rootCauseLabel,
        correctiveCount: 0,
        preventiveCount: 0,
        avgEffectiveness: null,
        scores: [],
      };
      if (a.kind === "corrective") cur.correctiveCount++;
      else cur.preventiveCount++;
      if (a.effectivenessScore != null) cur.scores.push(a.effectivenessScore);
      map.set(rc.rootCauseLabel, cur);
    }
  }
  return [...map.values()]
    .map(({ scores, ...rest }) => ({
      ...rest,
      avgEffectiveness: scores.length
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : null,
    }))
    .sort(
      (a, b) =>
        b.correctiveCount + b.preventiveCount - (a.correctiveCount + a.preventiveCount),
    )
    .slice(0, 6);
}

function buildSmartSuggestions(
  project: PlaneActionDashboard,
): SmartActionSuggestion[] {
  const flows = project.rootCauseFlows;
  const top = flows[0];
  const second = flows[1];
  const suggestions: SmartActionSuggestion[] = [
    {
      id: "sug-ca-rc",
      kind: "corrective",
      title: top
        ? `Corrective Action: address ${top.rootCauseLabel}`
        : "Corrective Action: verify energy isolation",
      detail: top
        ? `AI links ${top.correctiveCount} open Corrective Actions to incident root cause “${top.rootCauseLabel}”. Create a focused action with owner and due date.`
        : "Suggest Corrective Action from latest incident root cause.",
      confidence: 0.88,
      basedOn: "incident_root_cause",
      sourceLabel: "Incident investigation",
      rootCauseLabel: top?.rootCauseLabel ?? "Energy control failure",
      suggestedOwnerRole: "Supervisor / investigator",
      hrefCreate: "/pm/action-management?tab=workflow&create=1&kind=corrective",
    },
    {
      id: "sug-pa-insp",
      kind: "preventive",
      title: "Preventive Action: temporary access inspection queue",
      detail:
        "Inspection findings on overnight temporary access correlate with near-miss and injury patterns — suggest Preventive Action to harden morning checks.",
      confidence: 0.84,
      basedOn: "inspection_finding",
      sourceLabel: "Smart Inspections",
      rootCauseLabel: "Housekeeping / layout",
      suggestedOwnerRole: "Inspection lead",
      hrefCreate: "/pm/action-management?tab=workflow&create=1&kind=preventive",
    },
    {
      id: "sug-ca-nm",
      kind: "corrective",
      title: "Corrective Action: lift exclusion zone controls",
      detail:
        "Near-miss cluster on suspended loads — close the control gap before the next lift window.",
      confidence: 0.79,
      basedOn: "near_miss",
      sourceLabel: "Near miss",
      rootCauseLabel: "Procedural non-compliance",
      suggestedOwnerRole: "Lift director",
      hrefCreate: "/pm/action-management?tab=workflow&create=1&kind=corrective",
    },
    {
      id: "sug-pa-recur",
      kind: "preventive",
      title: second
        ? `Preventive Action: reduce recurrence of ${second.rootCauseLabel}`
        : "Preventive Action: competency refresh cadence",
      detail: second
        ? `Recurring root cause “${second.rootCauseLabel}” shows low effectiveness on prior closures — add Preventive Action and link a safety meeting topic.`
        : "Recurring root causes need Preventive Actions, not only Corrective close-outs.",
      confidence: 0.81,
      basedOn: "recurring_cause",
      sourceLabel: "Effectiveness review",
      rootCauseLabel: second?.rootCauseLabel ?? "Competency gap",
      suggestedOwnerRole: "Safety coordinator",
      hrefCreate: "/pm/action-management?tab=workflow&create=1&kind=preventive",
    },
  ];
  return suggestions;
}

function buildInsights(project: PlaneActionDashboard): ActionInsight[] {
  const overdue = project.actions.filter((a) => a.status === "overdue");
  const highRisk = project.actions.filter(
    (a) =>
      a.status !== "closed" &&
      (a.severityBand === "critical" || a.severityBand === "elevated"),
  );
  const recurring = project.rootCauseFlows
    .filter((f) => f.avgEffectiveness != null && f.avgEffectiveness < 55)
    .slice(0, 3);

  const insights: ActionInsight[] = [];

  insights.push({
    id: "ins-overdue",
    category: "overdue",
    tone: project.aging.overdue > 3 ? "alert" : "caution",
    headline: `${project.aging.overdue} overdue actions`,
    body:
      overdue.length > 0
        ? (() => {
            const oldest = [...overdue].sort((a, b) => b.ageDays - a.ageDays)[0]!;
            return `Oldest open: “${oldest.title}” (${oldest.ageDays}d). Assign owners and advance close-out.`;
          })()
        : "No overdue actions in the current project plane.",
    metric: `${project.aging.overdue} overdue · median ${project.aging.medianAgeDays}d`,
    href: "#cam-workflow",
  });

  insights.push({
    id: "ins-recurring",
    category: "recurring_root_cause",
    tone: recurring.length ? "caution" : "positive",
    headline: recurring.length
      ? "Recurring root causes with weak effectiveness"
      : "No high-recurrence root causes flagged",
    body: recurring.length
      ? recurring
          .map(
            (r) =>
              `${r.rootCauseLabel} (eff ${r.avgEffectiveness ?? "—"} · ${r.correctiveCount} CA / ${r.preventiveCount} PA)`,
          )
          .join("; ")
      : "Effectiveness reviews are holding — keep linking Corrective and Preventive Actions to root causes.",
    metric: project.effectiveness.recurringPct != null
      ? `${project.effectiveness.recurringPct}% recurring band`
      : undefined,
    href: "#vs-root-cause-flow",
  });

  insights.push({
    id: "ins-high-risk",
    category: "high_risk_area",
    tone: highRisk.length > 2 ? "alert" : "caution",
    headline: `${highRisk.length} elevated / critical open actions`,
    body: highRisk.length
      ? `High-risk areas: ${[...new Set(highRisk.flatMap((a) => a.rootCauses.map((r) => r.rootCauseLabel)))].slice(0, 3).join(", ")}. Prioritize verification and field evidence.`
      : "No elevated/critical open actions in sample.",
    metric: `severity critical/elevated`,
    href: "#cam-workflow",
  });

  return insights;
}

function buildPlane(
  plane: "project" | "company",
  sel: CamSelectors,
): PlaneActionDashboard {
  const actions = listActions({ ...sel, plane });
  const entities = new Set(actions.map((a) => a.entityToken));
  const suppressed = entities.size < MIN_SAMPLE && !sel.projectToken && !sel.companyToken;
  const hours = hoursForCohort(Math.max(entities.size, 1));
  const open = actions.filter((a) => a.status !== "closed");
  const overdue = actions.filter((a) => a.status === "overdue");
  const entityToken =
    plane === "project"
      ? sel.projectToken ?? actions[0]?.entityToken ?? null
      : sel.companyToken ?? actions[0]?.entityToken ?? null;

  return {
    plane,
    entityToken,
    rates: {
      openRatePer200k: suppressed ? null : ratePer200k(open.length, hours),
      overdueRatePer200k: suppressed ? null : ratePer200k(overdue.length, hours),
      closureVelocityDays: suppressed
        ? null
        : open.length
          ? Math.round(
              (open.reduce((s, a) => s + a.ageDays, 0) / open.length) * 10,
            ) / 10
          : 0,
      suppressed,
      entityCount: suppressed ? null : entities.size,
    },
    aging: buildAging(actions, hours),
    effectiveness: buildEffectiveness(actions),
    closeOut: buildCloseOut(actions),
    rootCauseFlows: buildRootCauseFlows(actions),
    actions: actions
      .slice()
      .sort((a, b) => {
        const rank = (s: ManagedAction["status"]) =>
          s === "overdue" ? 0 : s === "open" ? 1 : s === "in_progress" ? 2 : 3;
        return rank(a.status) - rank(b.status) || b.ageDays - a.ageDays;
      })
      .slice(0, 40),
  };
}

function narratives(project: PlaneActionDashboard, company: PlaneActionDashboard) {
  const out: CamDashboard["narratives"] = [];
  if (project.aging.overdue > 3) {
    out.push({
      id: "proj-overdue",
      tone: "alert",
      headline: "Project Action Management overdue pressure",
      body: `${project.aging.overdue} overdue actions — Corrective Action aging (median ${project.aging.medianAgeDays}d) is elevating project risk. Prioritize close-out verification.`,
    });
  }
  if (
    project.effectiveness.avgScore != null &&
    project.effectiveness.avgScore < 65
  ) {
    out.push({
      id: "proj-eff",
      tone: "caution",
      headline: "Action effectiveness below target",
      body: `Average effectiveness ${project.effectiveness.avgScore} — Preventive Actions may be under-scoped relative to root causes.`,
    });
  }
  if (
    company.aging.onTimeClosurePct >= 75 &&
    company.effectiveness.avgScore != null &&
    company.effectiveness.avgScore >= 70
  ) {
    out.push({
      id: "co-strong",
      tone: "positive",
      headline: "Company Action Management performing well",
      body: `On-time closure ${company.aging.onTimeClosurePct}% with effectiveness ${company.effectiveness.avgScore}.`,
    });
  }
  if (!out.length) {
    out.push({
      id: "neutral",
      tone: "neutral",
      headline: "Action Management within expected band",
      body: "Corrective and Preventive Action volumes are stable versus recent periods.",
    });
  }
  return out;
}

export function buildCamDashboard(
  partial: Partial<CamSelectors> = {},
): CamDashboard {
  const selectors: CamSelectors = {
    plane: partial.plane ?? "project",
    industry: partial.industry ?? "construction",
    period: partial.period ?? "2026-Q2",
    regionCode: partial.regionCode ?? "GLB",
    projectToken: partial.projectToken,
    companyToken: partial.companyToken,
  };
  const project = buildPlane("project", selectors);
  const company = buildPlane("company", selectors);
  const allIndustry = listActions({
    industry: selectors.industry,
    period: selectors.period,
    regionCode: selectors.regionCode,
  });
  const entities = new Set(allIndustry.map((a) => a.entityToken));
  const suppressed = entities.size < MIN_SAMPLE;
  const open = allIndustry.filter((a) => a.status !== "closed");
  const reviewed = allIndustry.filter((a) => a.effectivenessScore != null);
  const smartSuggestions = buildSmartSuggestions(project);
  const insights = buildInsights(project);

  return {
    generatedAt: new Date().toISOString(),
    revision: getRevision(),
    selectors,
    project,
    company,
    industryBenchmark: {
      avgAgeDays: suppressed
        ? null
        : open.length
          ? Math.round(
              (open.reduce((s, a) => s + a.ageDays, 0) / open.length) * 10,
            ) / 10
          : 0,
      medianAgeDays: suppressed ? null : median(open.map((a) => a.ageDays)),
      onTimeClosurePct: suppressed
        ? null
        : (() => {
            const closed = allIndustry.filter((a) => a.status === "closed");
            if (!closed.length) return 0;
            return (
              Math.round(
                (closed.filter((a) => a.ageDays <= 30).length / closed.length) *
                  1000,
              ) / 10
            );
          })(),
      effectivenessAvg: suppressed
        ? null
        : reviewed.length
          ? Math.round(
              (reviewed.reduce((s, a) => s + (a.effectivenessScore ?? 0), 0) /
                reviewed.length) *
                10,
            ) / 10
          : null,
      suppressed,
      entityCount: suppressed ? null : entities.size,
    },
    smartSuggestions,
    insights,
    narratives: narratives(project, company),
    workflow: {
      stages: STAGES,
      openQueue: project.actions.filter((a) => a.status !== "closed").slice(0, 20),
    },
    links: {
      incidents: "/pm/incidents",
      inspections: "/pm/inspections",
      meetings: "/pm/safety-meetings",
      training: "/pm/training",
    },
    rules: {
      hoursDenominator: HOURS_DENOMINATOR,
      minSample: MIN_SAMPLE,
      planesIsolated: true,
      idsTokenized: true,
      terminology: {
        corrective: "Corrective Actions",
        preventive: "Preventive Actions",
        program: "Action Management",
      },
    },
  };
}

export function refreshCamDashboard(
  partial: Partial<CamSelectors> = {},
): CamDashboard {
  bumpRevision();
  return buildCamDashboard(partial);
}
