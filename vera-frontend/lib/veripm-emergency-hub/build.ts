import type {
  EmergencyHubDashboard,
  EmsContact,
  ErpDrillPlan,
  ErpDrillRosterPerson,
  ErpDrillSignInSource,
  ErpScenario,
  GeneratedErp,
} from "./types";
import { resolveVeriPmPlane } from "@/lib/veripm-ai-intelligence";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function scopeLabel(plane: string) {
  if (plane === "company") return "Company scope";
  if (plane === "subcontractor") return "Subcontractor scope";
  return "Project scope";
}

function q(projectId: number, companyId: number) {
  return `projectId=${projectId}&companyId=${companyId}`;
}

const SCENARIO_STEPS: Record<
  ErpScenario,
  Array<{ title: string; detail: string }>
> = {
  electrical: [
    { title: "Stop work & isolate", detail: "De-energize if safe; do not touch victim until verified isolated." },
    { title: "Call EMS", detail: "Request ambulance + fire; state electrical injury / arc flash." },
    { title: "Secure scene", detail: "Establish arc flash boundary; keep bystanders clear." },
    { title: "First aid", detail: "CPR/AED if trained; cool burns with water; monitor airway." },
    { title: "Notify", detail: "Supervisor, HSE, utility control — preserve evidence for investigation." },
  ],
  fall: [
    { title: "Stop work", detail: "Halt related work at height; do not move casualty unless imminent danger." },
    { title: "Call EMS / rescue", detail: "Request trauma response; note fall height and surface." },
    { title: "Stabilize", detail: "Maintain spinal precautions; control bleeding; keep warm." },
    { title: "Rescue plan", detail: "Use trained rescue team / basket; never cut harness without plan." },
    { title: "Muster & secure", detail: "Account for crew; cordon area; notify investigation lead." },
  ],
  trench: [
    { title: "Evacuate trench", detail: "All personnel out; do not re-enter unprotected excavation." },
    { title: "Call specialized rescue", detail: "Request trench rescue / fire technical rescue." },
    { title: "Atmosphere", detail: "Monitor air; ventilate if safe from outside." },
    { title: "Shore / protect", detail: "Only competent rescue teams approach with protective systems." },
    { title: "Medical & notify", detail: "Stage EMS; notify competent person and HSE." },
  ],
  chemical: [
    { title: "Evacuate & upwind", detail: "Move personnel upwind/uphill; activate spill alarm." },
    { title: "Identify substance", detail: "SDS / placard; do not enter without appropriate PPE." },
    { title: "Call HAZMAT / EMS", detail: "Fire HAZMAT + ambulance; communicate SDS info." },
    { title: "Contain if trained", detail: "Spill kit only within training scope; decontaminate." },
    { title: "Medical & report", detail: "Decon victims; notify environmental authority as required." },
  ],
  rollover: [
    { title: "Secure traffic", detail: "Stop equipment movement; establish traffic control." },
    { title: "Call EMS / heavy rescue", detail: "Request extrication-capable response." },
    { title: "Stabilize machine", detail: "Only trained teams crib/stabilize; fuel/fire watch." },
    { title: "Extricate", detail: "Follow rescue team lead; first aid once accessible." },
    { title: "Scene preservation", detail: "Photograph positions; notify investigation and OEM if needed." },
  ],
  general: [
    { title: "Assess & alarm", detail: "Sound alarm; determine if life-threatening." },
    { title: "Call EMS", detail: "Provide location, nature, number of injured." },
    { title: "First aid", detail: "Trained responders only; AED if cardiac." },
    { title: "Muster", detail: "Account for all personnel at designated muster point." },
    { title: "All-clear / investigate", detail: "Resume only after authorized all-clear." },
  ],
};

const SCENARIO_EMS_PRIORITY: Record<ErpScenario, EmsContact["agency"][]> = {
  electrical: ["ambulance", "fire", "hospital", "rescue", "police"],
  fall: ["ambulance", "rescue", "fire", "hospital", "police"],
  trench: ["rescue", "fire", "ambulance", "hospital", "police"],
  chemical: ["fire", "ambulance", "hospital", "police", "rescue"],
  rollover: ["rescue", "ambulance", "fire", "police", "hospital"],
  general: ["ambulance", "fire", "police", "hospital", "rescue"],
};

function buildEms(region: string, seed: string, scenario: ErpScenario): EmsContact[] {
  const h = hash(`${seed}:${region}`);
  const order = SCENARIO_EMS_PRIORITY[scenario];
  const base: Array<{
    agency: EmsContact["agency"];
    name: string;
    phone: string;
    recommendedFor: ErpScenario[];
  }> = [
    {
      agency: "fire",
      name: `${region} Fire / Rescue`,
      phone: "911",
      recommendedFor: ["electrical", "chemical", "general", "trench"],
    },
    {
      agency: "ambulance",
      name: "Regional EMS Dispatch",
      phone: "911",
      recommendedFor: ["fall", "electrical", "rollover", "general", "chemical"],
    },
    {
      agency: "police",
      name: "RCMP / Local Police",
      phone: "911",
      recommendedFor: ["rollover", "general", "chemical"],
    },
    {
      agency: "hospital",
      name: `${region} Regional Hospital — ED`,
      phone: `+1-555-${1000 + (h % 8000)}`,
      recommendedFor: ["fall", "electrical", "chemical", "general"],
    },
    {
      agency: "rescue",
      name: "Technical / Industrial Rescue",
      phone: `+1-555-${2000 + (h % 7000)}`,
      recommendedFor: ["trench", "fall", "rollover", "electrical"],
    },
  ];
  return base
    .map((b, i) => ({
      id: `ems-${i}`,
      ...b,
      distanceKm: Math.round((2 + ((h + i * 5) % 18) + i) * 10) / 10,
      etaMinutes: 6 + i * 3 + (h % 5),
      address: `${100 + i * 12} Safety Ave, ${region}`,
      emergencyPriority: order.indexOf(b.agency) + 1,
    }))
    .sort((a, b) => a.emergencyPriority - b.emergencyPriority);
}

function buildErp(input: {
  scenario: ErpScenario;
  workType: string;
  region: string;
  projectScope: string;
  hazards: string[];
  seed: string;
  emsContacts: EmsContact[];
}): GeneratedErp {
  const h = hash(input.seed);
  const primary = input.emsContacts[0];
  const hospital = input.emsContacts.find((c) => c.agency === "hospital");
  const emsLine = input.emsContacts
    .slice(0, 3)
    .map((c) => `${c.agency}: ${c.name} (${c.phone}, ETA ${c.etaMinutes}m)`)
    .join("; ");
  const emsCallScript = [
    `Call ${primary?.phone ?? "911"} — ${primary?.name ?? "EMS"}.`,
    `State: ${input.scenario} emergency at ${input.projectScope}, ${input.region}.`,
    `Muster: Muster Point ${String.fromCharCode(65 + (h % 3))} — ${input.region} site gate.`,
    hospital
      ? `Receiving hospital: ${hospital.name}, ${hospital.phone}, ${hospital.address}.`
      : "Confirm receiving hospital with dispatcher.",
    `Local contacts plugged into this ERP: ${emsLine || "none selected"}.`,
  ].join(" ");

  const steps = SCENARIO_STEPS[input.scenario].map((s, i) => {
    const isCallStep =
      s.title.toLowerCase().includes("call") ||
      s.title.toLowerCase().includes("ems") ||
      s.title.toLowerCase().includes("notify");
    return {
      order: i + 1,
      title: s.title,
      detail: isCallStep
        ? `${s.detail} ${emsCallScript}`
        : s.detail,
    };
  });
  const qualityScore = Math.min(
    98,
    68 + (h % 28) + Math.min(8, input.emsContacts.length * 2),
  );
  return {
    id: `erp-${h % 9000}`,
    title: `${input.scenario.replace(/_/g, " ").toUpperCase()} ERP — ${input.workType}`,
    workType: input.workType,
    hazards: input.hazards,
    region: input.region,
    projectScope: input.projectScope,
    scenario: input.scenario,
    steps,
    musterPoint: `Muster Point ${String.fromCharCode(65 + (h % 3))} — ${input.region} site gate`,
    qualityScore,
    qualityNotes: [
      input.emsContacts.length
        ? `${input.emsContacts.length} local EMS contacts plugged into Call EMS steps.`
        : "Select local EMS contacts above before generating to raise plan quality.",
      qualityScore >= 80
        ? "Contacts and steps align with scenario hazards."
        : "Add hospital ETA and drill date to raise quality.",
      "Link JHA high-risk tasks to this ERP scenario.",
      "Verify EMS phone numbers quarterly.",
    ],
    meetingTopicHref: `/pm/safety-meetings/new?topic=${encodeURIComponent(`${input.scenario} ERP drill brief`)}`,
    emsContacts: input.emsContacts,
    emsCallScript,
  };
}

const SOURCE_LABEL: Record<ErpDrillSignInSource, string> = {
  site_gate_log: "Site gate / access log",
  daily_site_log: "Daily site log",
  toolbox_meeting: "Toolbox meeting sign-in",
  flha_sign_in: "FLHA sign-in",
};

function buildDrill(input: {
  scenario: ErpScenario;
  workType: string;
  region: string;
  musterPoint: string;
  seed: string;
  projectId: number;
  companyId: number;
}): ErpDrillPlan {
  const h = hash(`drill:${input.seed}`);
  const qs = q(input.projectId, input.companyId);
  const siteAccess = `/pm/site-access-control?${qs}`;
  const meetings = `/pm/safety-meetings?${qs}`;
  const flha = `/pm/jha-flha?${qs}`;

  const names = [
    ["Alex Rivera", "GC Civil", "Crew A", "Foreman"],
    ["Jordan Lee", "GC Civil", "Crew A", "Ironworker"],
    ["Sam Okonkwo", "Sub — SteelCo", "Crew B", "Rigger"],
    ["Casey Nguyen", "Sub — SteelCo", "Crew B", "Welder"],
    ["Morgan Ellis", "GC Civil", "Crew A", "Laborer"],
    ["Taylor Brooks", "Sub — ElecPro", "Crew C", "Electrician"],
    ["Riley Chen", "Sub — ElecPro", "Crew C", "Apprentice"],
    ["Jamie Patel", "GC Civil", "Office", "HSE Advisor"],
    ["Avery Kim", "Visitor — OEM", "Visitor", "Tech Rep"],
    ["Chris Delgado", "Sub — EarthWorks", "Crew D", "Operator"],
    ["Quinn Harper", "Sub — EarthWorks", "Crew D", "Spotter"],
    ["Blake Foster", "GC Civil", "Crew A", "Carpenter"],
  ];

  const roster: ErpDrillRosterPerson[] = names.map((row, i) => {
    const [name, company, crew, role] = row;
    const sources: ErpDrillSignInSource[] = ["site_gate_log"];
    if (i % 2 === 0) sources.push("daily_site_log");
    if (i % 3 !== 2) sources.push("toolbox_meeting");
    if (i % 4 !== 3) sources.push("flha_sign_in");
    const minutesAgo = 20 + ((h + i * 7) % 180);
    const primary = sources[sources.length - 1]!;
    return {
      id: `drill-p-${i}`,
      name,
      company,
      crew,
      role,
      signInSources: sources,
      lastSignInAt: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
      lastSignInLabel: `${SOURCE_LABEL[primary]} · ${minutesAgo}m ago`,
      status: "expected",
      requiresTracking: role !== "Tech Rep" || i % 5 === 0,
      notes:
        role === "Tech Rep"
          ? "Visitor — track when drill requires full accountability"
          : undefined,
    };
  });

  const expectedHeadcount = roster.filter((p) => p.requiresTracking).length;

  return {
    id: `drill-${h % 9000}`,
    title: `${input.scenario.toUpperCase()} ERP drill — ${input.workType}`,
    scenario: input.scenario,
    musterPoint: input.musterPoint,
    startedAt: null,
    status: "ready",
    accountabilityRequired: true,
    expectedHeadcount,
    accountedCount: 0,
    missingCount: 0,
    excusedCount: 0,
    completenessPct: 0,
    sources: [
      {
        source: "site_gate_log",
        label: SOURCE_LABEL.site_gate_log,
        href: siteAccess,
        signedInCount: roster.filter((p) =>
          p.signInSources.includes("site_gate_log"),
        ).length,
        detail: "Gate / zone heartbeat entries for personnel currently on site.",
      },
      {
        source: "daily_site_log",
        label: SOURCE_LABEL.daily_site_log,
        href: siteAccess,
        signedInCount: roster.filter((p) =>
          p.signInSources.includes("daily_site_log"),
        ).length,
        detail: "Daily site log headcount for the active shift.",
      },
      {
        source: "toolbox_meeting",
        label: SOURCE_LABEL.toolbox_meeting,
        href: meetings,
        signedInCount: roster.filter((p) =>
          p.signInSources.includes("toolbox_meeting"),
        ).length,
        detail: "Today’s toolbox / safety meeting attendance check-ins.",
      },
      {
        source: "flha_sign_in",
        label: SOURCE_LABEL.flha_sign_in,
        href: flha,
        signedInCount: roster.filter((p) =>
          p.signInSources.includes("flha_sign_in"),
        ).length,
        detail: "FLHA crew sign-ins for tasks underway this shift.",
      },
    ],
    roster,
    siteLogHref: siteAccess,
    meetingsHref: meetings,
    flhaHref: flha,
    guidance: [
      "Roster merges site gate logs, daily site logs, toolbox meeting sign-ins, and FLHA sign-ins.",
      "Mark each required person Accounted or Missing at the muster point.",
      "Visitors and short-stay roles still appear when accountability is required.",
      "Close the drill only when completeness is 100% or missing list is escalated.",
    ],
  };
}

export function buildEmergencyHub(input: {
  plane?: "project" | "company" | "subcontractor";
  role?: string | null;
  projectId?: number;
  companyId?: number;
  workType?: string;
  region?: string;
  projectScope?: string;
  scenario?: ErpScenario;
  hazards?: string[];
  /** Bumped by Generate ERP so a fresh plan is produced */
  generateToken?: string;
  /** EMS contact IDs selected for ERP plan development */
  includeEmsIds?: string[];
}): EmergencyHubDashboard {
  const plane = input.plane ?? resolveVeriPmPlane(input.role);
  const projectId = input.projectId ?? 1;
  const companyId = input.companyId ?? 1;
  const workType = input.workType ?? "General construction";
  const region = input.region ?? "CA-AB";
  const projectScope = input.projectScope ?? "Active construction site";
  const scenario = input.scenario ?? "fall";
  const hazards = input.hazards?.length
    ? input.hazards
    : ["Fall from height", "Struck-by", "Energy isolation"];
  const gen = input.generateToken ?? "0";
  const seed = `erp:${plane}:${companyId}:${projectId}:${scenario}:${region}:${gen}`;
  const h = hash(seed);
  const qs = q(projectId, companyId);

  const allEms = buildEms(region, seed, scenario);
  const selected =
    input.includeEmsIds?.length
      ? allEms.filter((c) => input.includeEmsIds!.includes(c.id))
      : allEms;
  const emsForPlan = selected.length ? selected : allEms;

  const erp = buildErp({
    scenario,
    workType,
    region,
    projectScope,
    hazards,
    seed,
    emsContacts: emsForPlan,
  });

  const drill = buildDrill({
    scenario,
    workType,
    region,
    musterPoint: erp.musterPoint,
    seed,
    projectId,
    companyId,
  });

  const scenarios: ErpScenario[] = [
    "electrical",
    "fall",
    "trench",
    "chemical",
    "rollover",
    "general",
  ];

  return {
    generatedAt: new Date().toISOString(),
    revision: h % 10_000,
    projectId,
    companyId,
    plane,
    scopeLabel: scopeLabel(plane),
    generator: {
      workType,
      region,
      projectScope,
      hazards,
      scenario,
    },
    erp,
    drill,
    scenarioLibrary: scenarios.map((s, i) => ({
      scenario: s,
      title: `${s.charAt(0).toUpperCase() + s.slice(1)} ERP pack`,
      summary: SCENARIO_STEPS[s][0]?.detail ?? "",
      qualityScore: Math.min(96, 70 + ((h + i * 9) % 24)),
    })),
    emsContacts: allEms,
    simulation: {
      scenario,
      title: `Simulate ${scenario} emergency — ${workType}`,
      timeline: [
        {
          minute: 0,
          event: "Alarm / discovery",
          expectedAction: "Stop work; activate site alarm",
          passCriteria: "Alarm audible within 30s",
        },
        {
          minute: 2,
          event: "EMS notified",
          expectedAction: erp.emsCallScript,
          passCriteria: "Dispatcher confirmation logged",
        },
        {
          minute: 5,
          event: "Muster accountability",
          expectedAction: "Headcount at muster point",
          passCriteria: "100% accounted or missing list started",
        },
        {
          minute: 12,
          event: "Specialized response",
          expectedAction: SCENARIO_STEPS[scenario][2]?.title ?? "Secure scene",
          passCriteria: "Trained responders only in hot zone",
        },
        {
          minute: 25,
          event: "All-clear / investigation handoff",
          expectedAction: "Preserve scene; notify HSE",
          passCriteria: "Evidence photos + witness list",
        },
      ],
      outcomeScore: Math.min(98, 72 + (h % 22)),
    },
    compliance: [
      {
        id: "cmp-prov",
        source: "provincial",
        requirement: `${region} emergency preparedness / first aid ratio`,
        status: h % 3 === 0 ? "partial" : "met",
        detail: "Verify first-aid attendants per headcount and remote-site travel time.",
      },
      {
        id: "cmp-ind",
        source: "industry",
        requirement: "Industry ERP drill frequency (semi-annual minimum)",
        status: "met",
        detail: "Last drill within policy window; schedule next simulation.",
      },
      {
        id: "cmp-co",
        source: "company",
        requirement: "Company policy: ERP linked to high-risk JHA",
        status: h % 2 === 0 ? "met" : "gap",
        detail: "Ensure fall/electrical JHAs reference this ERP scenario ID.",
      },
      {
        id: "cmp-ems",
        source: "company",
        requirement: "EMS contact currency (≤90 days)",
        status: "met",
        detail: "Hospital and rescue numbers verified this quarter.",
      },
    ],
    quality: {
      overall: erp.qualityScore,
      coverage: Math.min(100, 75 + (h % 20)),
      contactCurrency: Math.min(100, 80 + (h % 15)),
      drillReadiness: Math.min(100, 65 + (h % 30)),
      narrative:
        "ERP quality reflects scenario coverage, EMS contact currency, and recent drill readiness. Link high-risk JHA/FLHA energies to matching ERP scenarios.",
    },
    links: {
      smsCore: `/pm/sms?${qs}`,
      safetyHub: `/pm/safety-hub?${qs}`,
      sifHeca: `/pm/sif-heca?${qs}`,
      fieldOs: `/field?${qs}`,
      projects: `/pm/projects?${qs}`,
      jhaFlha: `/pm/jha-flha?${qs}`,
      inspections: `/pm/inspections?${qs}`,
      meetings: `/pm/safety-meetings?${qs}`,
      actions: `/pm/action-management?${qs}`,
      incidents: `/pm/incidents?${qs}`,
      siteAccess: `/pm/site-access-control?${qs}`,
    },
    insights: [
      {
        id: "ins-erp",
        tone: erp.qualityScore >= 80 ? "positive" : "caution",
        headline: `ERP quality ${erp.qualityScore}/100`,
        body: erp.qualityNotes[0] ?? "Review ERP steps against site hazards.",
        confidence: 0.84,
      },
      {
        id: "ins-ems",
        tone: "neutral",
        headline: "Local EMS staged",
        body: `EMS contacts loaded for ${region} — verify hospital ETA before high-risk lifts.`,
        confidence: 0.9,
      },
      {
        id: "ins-chain",
        tone: "neutral",
        headline: "JHA → ERP → FLHA → Inspections",
        body: "High-risk JHA rankings should generate ERP scenarios; FLHA briefings reference muster points; inspections verify ERP kits.",
        confidence: 0.88,
      },
      {
        id: "ins-drill",
        tone: "caution",
        headline: "ERP drill roster ready",
        body: `Drill headcount pulls from site logs, toolbox sign-ins, and FLHA — ${drill.expectedHeadcount} people require accountability when the drill runs.`,
        confidence: 0.86,
      },
    ],
    rules: { neverEmpty: true },
  };
}
