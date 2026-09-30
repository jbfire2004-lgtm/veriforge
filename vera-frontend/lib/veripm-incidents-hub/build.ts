/**
 * Build VeriPM Incidents Hub payload (deterministic demo analytics).
 * Never empty — always returns overview, open queue, trends, history, AI helper.
 */

import type {
  AiInvestigationHelper,
  HistoricalIncident,
  IncidentAccessPlane,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  IncidentsHubDashboard,
  IndustryComparisonRow,
  InvestigationHowToStep,
  OpenIncidentRow,
  SmartIncidentLog,
  SmartIncidentLogEntry,
  SmartLogFacet,
  SmartLogFacetDimension,
  SmartLogInsight,
  TrendPoint,
} from "./types";

const HOURS = 200_000 as const;

const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  FA: "#00C98D",
  MA: "#00A3FF",
  LT: "#FF7A00",
  Fatality: "#FF4D6A",
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function series(
  seed: string,
  months: number,
  base: number,
  drift: number,
  noise: number,
): TrendPoint[] {
  const out: TrendPoint[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const n = (hash(`${seed}:${period}`) % 1000) / 1000;
    const t = months - i;
    const value = Math.max(
      0,
      base + drift * (t / months) + (n - 0.5) * noise,
    );
    out.push({ period, value: Math.round(value * 100) / 100 });
  }
  return out;
}

function planeScale(plane: IncidentAccessPlane): number {
  if (plane === "company") return 4.2;
  if (plane === "subcontractor") return 0.55;
  return 1;
}

export function resolveIncidentPlane(
  role: string | null | undefined,
): IncidentAccessPlane {
  const r = (role ?? "").toUpperCase();
  if (r.includes("CONTRACTOR") || r === "SUBCONTRACTOR") {
    return "subcontractor";
  }
  if (
    r === "SUPER_ADMIN" ||
    r === "ADMIN" ||
    r === "COMPANY_ADMIN" ||
    r === "COMPANY_SAFETY_MANAGER"
  ) {
    return "company";
  }
  return "project";
}

function scopeLabel(plane: IncidentAccessPlane): string {
  if (plane === "company") return "Company scope";
  if (plane === "subcontractor") return "Subcontractor scope";
  return "Project scope";
}

function q(projectId: number, companyId: number) {
  return `projectId=${projectId}&companyId=${companyId}`;
}

function buildSeverity(
  seed: string,
  total: number,
): IncidentsHubDashboard["overview"]["severity"] {
  const h = hash(seed);
  const fatality = total > 20 && h % 17 === 0 ? 1 : 0;
  const lt = Math.max(1, Math.round(total * (0.12 + (h % 8) / 100)));
  const ma = Math.max(1, Math.round(total * (0.28 + (h % 10) / 100)));
  let fa = Math.max(0, total - lt - ma - fatality);
  if (fa + lt + ma + fatality !== total) {
    fa = Math.max(0, total - lt - ma - fatality);
  }
  const counts: Array<[IncidentSeverity, number]> = [
    ["FA", fa],
    ["MA", ma],
    ["LT", lt],
    ["Fatality", fatality],
  ];
  const sum = counts.reduce((a, [, c]) => a + c, 0) || 1;
  return counts.map(([label, count]) => ({
    label,
    count,
    share: count / sum,
    color: SEVERITY_COLORS[label],
  }));
}

function buildOpenIncidents(
  seed: string,
  plane: IncidentAccessPlane,
  projectId: number,
  companyId: number,
): OpenIncidentRow[] {
  const s = planeScale(plane);
  const count = Math.max(3, Math.round((4 + (hash(seed) % 5)) * Math.min(s, 2)));
  const titles = [
    "Hand injury — temporary access platform",
    "Near miss — suspended load swing",
    "Property damage — mobile equipment contact",
    "Slip on wet decking — fabrication bay",
    "Struck-by potential — material staging",
    "Electrical flash near miss — panel work",
    "Laceration — cutting station guard gap",
    "Vehicle near miss — site haul road",
  ];
  const investigators = [
    "A. Reyes",
    "J. Okonkwo",
    "M. Chen",
    "S. Patel",
    "L. Johansson",
  ];
  const statuses: IncidentStatus[] = [
    "open",
    "investigating",
    "pending_review",
  ];
  const severities: IncidentSeverity[] = ["FA", "MA", "LT", "FA"];
  const types: IncidentType[] = [
    "injury",
    "near_miss",
    "property_damage",
    "injury",
    "near_miss",
    "equipment",
    "injury",
    "near_miss",
  ];

  return Array.from({ length: count }, (_, i) => {
    const id = `inc-open-${hash(`${seed}:open:${i}`) % 9000 + 1000}`;
    const title = titles[i % titles.length]!;
    return {
      id,
      title,
      status: statuses[i % statuses.length]!,
      severity: severities[i % severities.length]!,
      daysOpen: 2 + ((hash(`${seed}:days:${i}`) % 28) + i),
      investigator: investigators[i % investigators.length]!,
      type: types[i % types.length]!,
      href: `/pm/incidents/${id}?${q(projectId, companyId)}`,
    };
  });
}

function buildHistory(
  seed: string,
  plane: IncidentAccessPlane,
  projectId: number,
  companyId: number,
): HistoricalIncident[] {
  const s = planeScale(plane);
  const n = Math.max(8, Math.round(10 * Math.min(s, 2.5)));
  const now = new Date();
  const catalog: Array<{
    title: string;
    type: IncidentType;
    severity: IncidentSeverity;
    rootCause: string;
    summary: string;
    findings: string[];
  }> = [
    {
      title: "Finger pinch — conveyor guard",
      type: "injury",
      severity: "MA",
      rootCause: "Inadequate guarding / LOTO gap",
      summary:
        "Worker reached past incomplete guard during jam clear. No LOTO verification recorded.",
      findings: [
        "Guard interlock bypassed temporarily",
        "LOTO checklist incomplete",
        "Task not on approved JHA",
      ],
    },
    {
      title: "Near miss — overhead load path",
      type: "near_miss",
      severity: "FA",
      rootCause: "Exclusion zone not enforced",
      summary:
        "Tag line lost control; load entered walkway. Spotter not positioned.",
      findings: [
        "Exclusion zone cones missing",
        "Spotter radio channel wrong",
        "Lift plan not briefed that shift",
      ],
    },
    {
      title: "Sprain — uneven temporary walkway",
      type: "injury",
      severity: "LT",
      rootCause: "Housekeeping / access design",
      summary:
        "Worker twisted ankle on unsecured plank spanning trench.",
      findings: [
        "Walkway not inspected that morning",
        "No alternate route marked",
      ],
    },
    {
      title: "Equipment contact — forklift turn",
      type: "property_damage",
      severity: "MA",
      rootCause: "Blind spot / traffic control",
      summary:
        "Forklift clipped staging rack in congested aisle.",
      findings: [
        "Mirrors fogged",
        "Aisle width below standard",
      ],
    },
    {
      title: "Chemical splash observation",
      type: "observation",
      severity: "FA",
      rootCause: "PPE compliance drift",
      summary:
        "Observer noted secondary containment open during transfer.",
      findings: ["Face shield not worn", "Spill kit blocked"],
    },
    {
      title: "Electrical shock near miss",
      type: "near_miss",
      severity: "LT",
      rootCause: "Energy isolation verification",
      summary:
        "Voltage present after presumed isolation; tester not used.",
      findings: [
        "Wrong breaker labeled",
        "Live-dead-live skipped",
      ],
    },
    {
      title: "Dust exposure — cutting bay",
      type: "environmental",
      severity: "FA",
      rootCause: "Ventilation / control of work",
      summary:
        "Local exhaust offline; cutting continued without stop-work.",
      findings: ["Exhaust fan tagged out", "No stop-work called"],
    },
    {
      title: "Scaffold plank displacement",
      type: "near_miss",
      severity: "MA",
      rootCause: "Inspection cadence / competency",
      summary:
        "Plank shifted under load; worker caught rail.",
      findings: [
        "Daily scaffold tag expired",
        "Competent person not on site",
      ],
    },
  ];

  return Array.from({ length: n }, (_, i) => {
    const c = catalog[i % catalog.length]!;
    const d = new Date(now);
    d.setDate(d.getDate() - (7 + i * 11 + (hash(`${seed}:h:${i}`) % 9)));
    const id = `inc-hist-${hash(`${seed}:hist:${i}`) % 9000 + 2000}`;
    const investigators = ["A. Reyes", "J. Okonkwo", "M. Chen", "S. Patel"];
    return {
      id,
      title: c.title,
      date: d.toISOString().slice(0, 10),
      type: c.type,
      severity: c.severity,
      rootCause: c.rootCause,
      status: "closed" as IncidentStatus,
      investigator: investigators[i % investigators.length]!,
      summary: c.summary,
      findings: c.findings,
      correctiveActionIds: [`ca-${id}-1`, `ca-${id}-2`],
      preventiveActionIds: [`pa-${id}-1`],
      relatedMeetingTopics: [
        c.rootCause.includes("guard")
          ? "Machine guarding & LOTO refresh"
          : c.rootCause.includes("Exclusion")
            ? "Lift exclusion zones"
            : "Stop-work authority",
      ],
      relatedInspectionFocus: [
        c.type === "near_miss" ? "High-risk work controls" : "Access & housekeeping",
        "PPE compliance spot checks",
      ],
      href: `/pm/incidents/${id}?${q(projectId, companyId)}`,
      reportHref: `/pm/incidents/${id}?${q(projectId, companyId)}&view=report`,
    };
  });
}

function countBy(
  entries: SmartIncidentLogEntry[],
  keyFn: (e: SmartIncidentLogEntry) => string | null,
  dimension: SmartLogFacetDimension,
  labelPrefix?: string,
): SmartLogFacet[] {
  const map = new Map<string, number>();
  for (const e of entries) {
    const v = keyFn(e);
    if (!v) continue;
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({
      id: `${dimension}:${value}`,
      dimension,
      label: labelPrefix ? `${labelPrefix}: ${value}` : value,
      value,
      count,
    }));
}

function buildSmartLog(
  seed: string,
  plane: IncidentAccessPlane,
  projectId: number,
  companyId: number,
  openIncidents: OpenIncidentRow[],
  history: HistoricalIncident[],
): SmartIncidentLog {
  const qs = q(projectId, companyId);
  const h = hash(seed);
  const companies =
    plane === "company"
      ? ["Northline Constructors", "Prairie Steel JV", "Alpine Civil"]
      : ["Northline Constructors"];
  const subs = [
    "SteelCo Fabrication",
    "ElecPro Systems",
    "EarthWorks Ltd",
    "Access Scaffold Inc",
    null,
  ];
  const locations = [
    "Fabrication bay",
    "Lift corridor B",
    "Haul road west",
    "Cutting station 3",
    "Scaffold bay 2",
    "Panel room A",
    "Material staging",
    "Temporary walkway — trench",
  ];
  const crews = ["Crew A", "Crew B", "Crew C", "Night shift", "Millwrights"];
  const workTypes = [
    "Structural steel",
    "Electrical",
    "Civil / earthworks",
    "Scaffolding",
    "Material handling",
  ];
  const energies = [
    ["Mechanical", "Gravity"],
    ["Gravity", "Motion"],
    ["Electrical"],
    ["Chemical"],
    ["Pressure", "Motion"],
    ["Gravity"],
  ];

  const projectName =
    plane === "company"
      ? "All active projects"
      : plane === "subcontractor"
        ? `Project ${projectId} — assigned scope`
        : `Project ${projectId}`;

  const fromHistory: SmartIncidentLogEntry[] = history.map((item, i) => {
    const sub = plane === "subcontractor" ? subs[0] : subs[i % subs.length]!;
    const company = companies[i % companies.length]!;
    const caStatus = (["closed", "closed", "in_progress"] as const)[i % 3]!;
    const paStatus = (["closed", "open", "in_progress"] as const)[i % 3]!;
    return {
      id: item.id,
      title: item.title,
      date: item.date,
      type: item.type,
      severity: item.severity,
      status: item.status,
      daysOpen: null,
      rootCause: item.rootCause,
      investigator: item.investigator,
      summary: item.summary,
      findings: item.findings,
      plane,
      companyName: company,
      subcontractorName: sub,
      projectName:
        plane === "company"
          ? `Project ${(projectId + (i % 4))}`
          : projectName,
      location: locations[i % locations.length]!,
      crew: crews[i % crews.length]!,
      workType: workTypes[i % workTypes.length]!,
      energyTypes: energies[i % energies.length]!,
      correctiveActions: item.correctiveActionIds.map((id, j) => ({
        id,
        title: `CA: ${item.rootCause.split("/")[0]!.trim()} control ${j + 1}`,
        status: caStatus,
        kind: "corrective" as const,
        href: `/pm/action-management?${qs}&actionId=${id}`,
      })),
      preventiveActions: item.preventiveActionIds.map((id, j) => ({
        id,
        title: `PA: Prevent recurrence — ${item.type.replace(/_/g, " ")} ${j + 1}`,
        status: paStatus,
        kind: "preventive" as const,
        href: `/pm/action-management?${qs}&actionId=${id}`,
      })),
      relatedMeetingTopics: item.relatedMeetingTopics.map((title) => ({
        title,
        href: `/pm/safety-meetings/new?${qs}&topic=${encodeURIComponent(title)}`,
      })),
      relatedInspectionFocus: item.relatedInspectionFocus.map((title) => ({
        title,
        href: `/pm/inspections?${qs}&focus=${encodeURIComponent(title)}`,
      })),
      relatedFlhaId: i % 3 === 0 ? `flha-${200 + i}` : null,
      relatedFlhaHref:
        i % 3 === 0 ? `/pm/jha-flha?${qs}&flhaId=flha-${200 + i}` : null,
      witnessCount: 1 + ((h + i) % 4),
      evidenceCount: 3 + ((h + i * 3) % 8),
      sifPotential: item.severity === "LT" || item.severity === "Fatality" || i % 5 === 0,
      href: item.href,
      reportHref: item.reportHref,
    };
  });

  const fromOpen: SmartIncidentLogEntry[] = openIncidents.map((item, i) => {
    const d = new Date();
    d.setDate(d.getDate() - item.daysOpen);
    const rootCauses = [
      "Investigation in progress",
      "Awaiting witness statements",
      "Evidence collection",
      "Pending root-cause review",
    ];
    const sub = plane === "subcontractor" ? subs[0] : subs[(i + 2) % subs.length]!;
    return {
      id: item.id,
      title: item.title,
      date: d.toISOString().slice(0, 10),
      type: item.type,
      severity: item.severity,
      status: item.status,
      daysOpen: item.daysOpen,
      rootCause: rootCauses[i % rootCauses.length]!,
      investigator: item.investigator,
      summary: `Open ${item.type.replace(/_/g, " ")} under ${item.status.replace(/_/g, " ")} — ${item.daysOpen} days on the log.`,
      findings:
        item.status === "open"
          ? ["Scene preserved", "Initial report filed"]
          : ["Interviews scheduled", "Photos logged", "JHA/FLHA pull pending"],
      plane,
      companyName: companies[i % companies.length]!,
      subcontractorName: sub,
      projectName:
        plane === "company"
          ? `Project ${(projectId + (i % 3))}`
          : projectName,
      location: locations[(i + 3) % locations.length]!,
      crew: crews[(i + 1) % crews.length]!,
      workType: workTypes[(i + 2) % workTypes.length]!,
      energyTypes: energies[(i + 1) % energies.length]!,
      correctiveActions: [],
      preventiveActions: [],
      relatedMeetingTopics: [],
      relatedInspectionFocus: [
        {
          title: "Follow-up inspection for open incident",
          href: `/pm/inspections?${qs}&focus=${encodeURIComponent("open-incident-followup")}`,
        },
      ],
      relatedFlhaId: null,
      relatedFlhaHref: null,
      witnessCount: 1 + (i % 3),
      evidenceCount: 1 + (i % 5),
      sifPotential: item.severity === "LT" || item.daysOpen > 14,
      href: item.href,
      reportHref: `${item.href}&view=report`,
    };
  });

  const entries = [...fromOpen, ...fromHistory].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  const facets: SmartLogFacet[] = [
    ...countBy(entries, (e) => e.type, "type"),
    ...countBy(entries, (e) => e.severity, "severity"),
    ...countBy(entries, (e) => e.status, "status"),
    ...countBy(entries, (e) => e.rootCause, "rootCause"),
    ...countBy(entries, (e) => e.companyName, "company"),
    ...countBy(entries, (e) => e.subcontractorName, "subcontractor"),
    ...countBy(entries, (e) => e.location, "location"),
    ...countBy(entries, (e) => e.investigator, "investigator"),
    ...countBy(entries, (e) => e.crew, "crew"),
    ...entries
      .flatMap((e) => e.energyTypes.map((en) => ({ e, en })))
      .reduce((acc, { en }) => {
        const existing = acc.find((f) => f.value === en);
        if (existing) existing.count += 1;
        else
          acc.push({
            id: `energy:${en}`,
            dimension: "energy" as const,
            label: en,
            value: en,
            count: 1,
          });
        return acc;
      }, [] as SmartLogFacet[]),
  ];

  const open = entries.filter((e) => e.status !== "closed").length;
  const closed = entries.filter((e) => e.status === "closed").length;
  const nearMiss = entries.filter((e) => e.type === "near_miss").length;
  const injury = entries.filter((e) => e.type === "injury").length;
  const overdue = entries.filter(
    (e) => e.daysOpen != null && e.daysOpen > 14,
  ).length;
  const sif = entries.filter((e) => e.sifPotential).length;

  const topType = facets.find((f) => f.dimension === "type");
  const topCause = facets
    .filter((f) => f.dimension === "rootCause")
    .sort((a, b) => b.count - a.count)[0];
  const topLoc = facets
    .filter((f) => f.dimension === "location")
    .sort((a, b) => b.count - a.count)[0];
  const topSub = facets
    .filter((f) => f.dimension === "subcontractor")
    .sort((a, b) => b.count - a.count)[0];

  const intelligence: SmartLogInsight[] = [
    {
      id: "log-volume",
      tone: open > 5 ? "caution" : "neutral",
      headline: `${entries.length} incidents in ${scopeLabel(plane).toLowerCase()} log`,
      body: `${open} open · ${closed} closed · ${nearMiss} near misses · ${injury} injuries. Drill facets to isolate patterns.`,
      confidence: 0.94,
    },
    {
      id: "log-cause",
      tone: topCause && topCause.count >= 2 ? "caution" : "neutral",
      headline: topCause
        ? `Leading root cause: ${topCause.value}`
        : "Root causes distributed",
      body: topCause
        ? `${topCause.count} records share this cause — drill to review linked actions and meetings.`
        : "No dominant root cause in the current scope.",
      confidence: 0.86,
      drillDimension: topCause ? "rootCause" : undefined,
      drillValue: topCause?.value,
    },
    {
      id: "log-location",
      tone: topLoc && topLoc.count >= 2 ? "alert" : "neutral",
      headline: topLoc
        ? `Hotspot location: ${topLoc.value}`
        : "Locations evenly spread",
      body: topLoc
        ? `${topLoc.count} incidents map to this area — queue an inspection focus and FLHA refresh.`
        : "No single location dominates the log.",
      confidence: 0.84,
      drillDimension: topLoc ? "location" : undefined,
      drillValue: topLoc?.value,
    },
    {
      id: "log-overdue",
      tone: overdue > 0 ? "alert" : "positive",
      headline:
        overdue > 0
          ? `${overdue} investigations overdue (>14 days)`
          : "No overdue open investigations",
      body:
        overdue > 0
          ? "Drill to open / investigating status and assign investigators."
          : "Open items are within aging targets for this scope.",
      confidence: 0.91,
      drillDimension: overdue > 0 ? "status" : undefined,
      drillValue: overdue > 0 ? "investigating" : undefined,
    },
  ];

  if (plane !== "subcontractor" && topSub) {
    intelligence.push({
      id: "log-sub",
      tone: topSub.count >= 3 ? "caution" : "neutral",
      headline: `Subcontractor volume: ${topSub.value}`,
      body: `${topSub.count} log entries — compare rates and drill into their crew / location mix.`,
      confidence: 0.8,
      drillDimension: "subcontractor",
      drillValue: topSub.value,
    });
  }

  if (topType) {
    intelligence.push({
      id: "log-type",
      tone: "neutral",
      headline: `Most common type: ${topType.value.replace(/_/g, " ")}`,
      body: `${topType.count} of ${entries.length} entries. Use type facet to compare severity and action closure.`,
      confidence: 0.88,
      drillDimension: "type",
      drillValue: topType.value,
    });
  }

  if (sif > 0) {
    intelligence.push({
      id: "log-sif",
      tone: "alert",
      headline: `${sif} SIF-potential records on the log`,
      body: "Prioritize these for HECA review, Action Management effectiveness, and ERP readiness.",
      confidence: 0.87,
    });
  }

  return {
    scopeLabel: scopeLabel(plane),
    plane,
    entries,
    facets,
    intelligence,
    totals: {
      all: entries.length,
      open,
      closed,
      nearMiss,
      injury,
      overdueInvestigations: overdue,
      sifPotential: sif,
    },
  };
}

function buildHowTo(): InvestigationHowToStep[] {
  return [
    {
      id: "information",
      title: "1 · Incident information",
      detail:
        "Capture date/time, location, company, project, event type, severity, description, and immediate actions — the Intelex/ISN intake foundation.",
    },
    {
      id: "evidence",
      title: "2 · Evidence",
      detail:
        "Collect photos, documents, witness statements, and training/competency records. Preserve the scene before analysis.",
    },
    {
      id: "root-cause",
      title: "3 · Root cause methods",
      detail:
        "Run 5-Why, fishbone (Ishikawa), and/or TapRooT pathways. Use guided interview and causal tree to separate direct vs systemic causes.",
    },
    {
      id: "actions",
      title: "4 · Corrective actions",
      detail:
        "Link actions to Action Management with owners and due dates. RCA auto-generates actions; add preventive work as needed.",
    },
    {
      id: "review",
      title: "5 · Final review",
      detail:
        "Supervisor/HSE readiness gate, approve or request changes, generate the investigation report, then close the incident.",
    },
  ];
}

function buildAiHelper(
  projectId: number,
  companyId: number,
): AiInvestigationHelper {
  const qs = q(projectId, companyId);
  return {
    sampleDescription:
      "Worker clearing jam on conveyor; reached past incomplete guard. No LOTO tag visible. Shift started 20 minutes prior; temporary access installed overnight.",
    suggestedRootCauses: [
      {
        label: "Inadequate guarding during maintenance access",
        confidence: 0.86,
        rationale:
          "Description matches incomplete guard + jam-clear pattern seen in prior MA events.",
      },
      {
        label: "LOTO verification skipped",
        confidence: 0.78,
        rationale:
          "No LOTO tag mentioned; energy isolation often missing in similar reports.",
      },
      {
        label: "Temporary access not re-inspected after overnight install",
        confidence: 0.64,
        rationale:
          "Overnight install + early shift timing correlates with inspection gaps.",
      },
    ],
    suggestedCorrectiveActions: [
      "Restore and verify guard interlock before restart; tag incomplete guards.",
      "Retrain involved crew on jam-clear procedure with LOTO mandatory.",
      "Quarantine temporary access until competent-person sign-off.",
    ],
    suggestedPreventiveActions: [
      "Add pre-shift guard/LOTO checklist to conveyor stations.",
      "Require photo evidence of isolation before jam-clear tasks.",
      "Link overnight temporary-work installs to next-morning inspection queue.",
    ],
    suggestedMeetingTopics: [
      {
        title: "Machine guarding & LOTO during jam clears",
        href: `/pm/safety-meetings/new?${qs}&topic=${encodeURIComponent("Machine guarding & LOTO during jam clears")}`,
      },
      {
        title: "Stop-work when controls are incomplete",
        href: `/pm/safety-meetings/new?${qs}&topic=${encodeURIComponent("Stop-work when controls are incomplete")}`,
      },
    ],
    suggestedInspectionFocus: [
      {
        title: "Conveyor guarding & interlocks",
        href: `/pm/inspections?${qs}&focus=${encodeURIComponent("conveyor-guarding")}`,
      },
      {
        title: "Temporary access overnight installs",
        href: `/pm/inspections?${qs}&focus=${encodeURIComponent("temporary-access")}`,
      },
    ],
  };
}

function buildIndustryComparison(
  plane: IncidentAccessPlane,
  rate: number,
  seed: string,
): IncidentsHubDashboard["industryComparison"] {
  const h = hash(seed);
  const industryRate = Math.round((1.85 + (h % 40) / 100) * 100) / 100;
  const industryNearMiss =
    Math.round((4.2 + (h % 50) / 100) * 100) / 100;
  const entityNearMiss =
    Math.round((rate * 2.4 + (h % 20) / 100) * 100) / 100;
  const industryLtifr = Math.round((0.55 + (h % 25) / 100) * 100) / 100;
  const entityLtifr = Math.round((rate * 0.32 + 0.1) * 100) / 100;

  const rows: IndustryComparisonRow[] = [
    {
      label: "Incident rate /200k hrs",
      entity: rate,
      industry: industryRate,
      unit: "/200k",
      betterThanIndustry: rate < industryRate,
    },
    {
      label: "Near-miss rate /200k hrs",
      entity: entityNearMiss,
      industry: industryNearMiss,
      unit: "/200k",
      // Higher near-miss reporting can be positive (leading) — still show vs average
      betterThanIndustry: entityNearMiss >= industryNearMiss * 0.9,
    },
    {
      label: "LTIFR (lost-time)",
      entity: entityLtifr,
      industry: industryLtifr,
      unit: "/200k",
      betterThanIndustry: entityLtifr < industryLtifr,
    },
  ];

  const below = rows.filter((r) => r.label.includes("Incident") && r.betterThanIndustry).length;
  const summary =
    below > 0
      ? `${scopeLabel(plane)} incident rate is below industry average — maintain leading controls.`
      : `${scopeLabel(plane)} incident rate is above industry average — prioritize investigation closure and Action Management.`;

  return {
    mode: plane === "company" ? "company-vs-industry" : "project-vs-industry",
    rows,
    summary,
  };
}

export function buildIncidentsHub(input: {
  plane?: IncidentAccessPlane;
  role?: string | null;
  projectId?: number;
  companyId?: number;
  months?: number;
}): IncidentsHubDashboard {
  const plane = input.plane ?? resolveIncidentPlane(input.role ?? null);
  const projectId = input.projectId ?? 1;
  const companyId = input.companyId ?? 1;
  const months = input.months ?? 24;
  const seed = `${plane}:${companyId}:${projectId}:${months}`;
  const s = planeScale(plane);
  const h = hash(seed);

  const totalIncidents = Math.round((8 + (h % 7)) * s);
  const nearMissCount = Math.round((18 + (h % 15)) * s);
  const hoursWorked = Math.round((42_000 + (h % 20_000)) * Math.max(s, 0.8));
  const incidentRatePer200k =
    Math.round(((totalIncidents / Math.max(hoursWorked, 1)) * HOURS) * 100) /
    100;
  const severity = buildSeverity(seed, Math.max(totalIncidents, 4));
  const openIncidents = buildOpenIncidents(seed, plane, projectId, companyId);
  const history = buildHistory(seed, plane, projectId, companyId);
  const smartLog = buildSmartLog(
    seed,
    plane,
    projectId,
    companyId,
    openIncidents,
    history,
  );
  const qs = q(projectId, companyId);

  const incidentTrend = series(
    `${seed}:inc`,
    months,
    incidentRatePer200k + 0.35,
    -0.4,
    0.35,
  );
  const typeKeys: IncidentType[] = [
    "injury",
    "near_miss",
    "property_damage",
    "equipment",
  ];
  const byType = typeKeys.map((type, i) => ({
    type,
    series: series(
      `${seed}:type:${type}`,
      Math.min(months, 12),
      1.2 + i * 0.4,
      i % 2 === 0 ? -0.2 : 0.15,
      0.5,
    ),
  }));
  const causes = [
    "Guarding / LOTO",
    "Housekeeping / access",
    "Exclusion zones",
    "Competency / briefing",
  ];
  const byRootCause = causes.map((cause, i) => ({
    cause,
    series: series(
      `${seed}:rc:${cause}`,
      Math.min(months, 12),
      0.9 + i * 0.25,
      -0.15,
      0.4,
    ),
  }));

  const industryComparison = buildIndustryComparison(
    plane,
    incidentRatePer200k,
    seed,
  );

  return {
    generatedAt: new Date().toISOString(),
    revision: h % 10_000,
    plane,
    scopeLabel: scopeLabel(plane),
    projectId,
    companyId,
    periodLabel: "Current period vs prior",
    hoursDenominator: HOURS,
    overview: {
      totalIncidents,
      incidentRatePer200k,
      nearMissCount,
      openCount: openIncidents.length,
      deltas: {
        totalIncidents: plane === "company" ? -3 : -1,
        incidentRatePer200k: -0.14,
        nearMissCount: plane === "subcontractor" ? 2 : 1,
      },
      severity,
    },
    openIncidents,
    trends: {
      incidents: incidentTrend,
      byType,
      byRootCause,
    },
    industryComparison,
    howTo: buildHowTo(),
    aiHelper: buildAiHelper(projectId, companyId),
    history,
    smartLog,
    historicalTrends: {
      ratePer200k: incidentTrend,
      closedInvestigations: series(`${seed}:closed`, months, 3.5, 0.4, 0.8),
    },
    rootCauseFlows: causes.map((cause, i) => ({
      rootCauseLabel: cause,
      correctiveCount: 2 + ((h + i * 3) % 6),
      preventiveCount: 1 + ((h + i * 5) % 4),
      avgEffectiveness: 62 + ((h + i * 7) % 28),
    })),
    insights: [
      {
        id: "ins-rate",
        tone: industryComparison.rows[0]?.betterThanIndustry
          ? "positive"
          : "caution",
        headline: industryComparison.rows[0]?.betterThanIndustry
          ? "Rate below industry benchmark"
          : "Rate above industry benchmark",
        body: industryComparison.summary,
        confidence: 0.82,
      },
      {
        id: "ins-open",
        tone: openIncidents.some((o) => o.daysOpen > 21)
          ? "alert"
          : "neutral",
        headline: "Investigation aging",
        body: `${openIncidents.filter((o) => o.daysOpen > 14).length} open incidents exceed 14 days — assign investigators and close evidence gaps.`,
        confidence: 0.9,
      },
      {
        id: "ins-link",
        tone: "neutral",
        headline: "Close the loop",
        body: "Link closed investigations to Action Management, safety meeting topics, and inspection focus areas so lessons stick.",
        confidence: 0.88,
      },
    ],
    links: {
      correctiveActions: `/pm/action-management?${qs}`,
      safetyMeetings: `/pm/safety-meetings?${qs}`,
      inspections: `/pm/inspections?${qs}`,
      reportNew: `/pm/incidents/new?${qs}`,
      incidentLog: `/pm/incidents?${qs}&tab=log`,
    },
    rules: {
      planeIsolated: true,
      ratesNormalizedPer200k: true,
      subcontractorScoped: plane === "subcontractor",
      neverEmpty: true,
    },
  };
}
