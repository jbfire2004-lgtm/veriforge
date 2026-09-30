import { utilitiesForRegion } from "./utility-contacts";
import { routeQuickHazardContacts } from "./hazard-routing";
import {
  quickAccessCacheKey,
  type EmergencyQuickAccessPack,
  type ErpProcedureStep,
  type ImmediateAction,
  type QuickAccessScenario,
  type QuickContact,
} from "./types";

const PROCEDURES: Record<QuickAccessScenario, ErpProcedureStep[]> = {
  electrical: [
    { order: 1, title: "Stop work & isolate", detail: "De-energize if safe; do not touch victim until verified isolated." },
    { order: 2, title: "Call 911", detail: "Request ambulance + fire; state electrical injury / arc flash. Give site access notes." },
    { order: 3, title: "Secure scene", detail: "Establish arc flash boundary; keep bystanders clear." },
    { order: 4, title: "First aid", detail: "CPR/AED if trained; cool burns with water; monitor airway." },
    { order: 5, title: "Notify", detail: "Supervisor, HSE, utility control — preserve evidence." },
  ],
  fall: [
    { order: 1, title: "Stop work", detail: "Halt related work at height; do not move casualty unless imminent danger." },
    { order: 2, title: "Call 911 / rescue", detail: "Request trauma response; note fall height and surface." },
    { order: 3, title: "Stabilize", detail: "Spinal precautions; control bleeding; keep warm." },
    { order: 4, title: "Rescue plan", detail: "Trained rescue only; never cut harness without a plan." },
    { order: 5, title: "Muster & secure", detail: "Account for crew; cordon area; notify investigation lead." },
  ],
  trench: [
    { order: 1, title: "Evacuate trench", detail: "All personnel out; do not re-enter unprotected excavation." },
    { order: 2, title: "Call 911 — specialized rescue", detail: "Request trench / technical rescue." },
    { order: 3, title: "Atmosphere", detail: "Monitor air; ventilate only if safe from outside." },
    { order: 4, title: "Shore / protect", detail: "Only competent rescue teams approach with protective systems." },
    { order: 5, title: "Medical & notify", detail: "Stage EMS; notify competent person and HSE." },
  ],
  chemical: [
    { order: 1, title: "Evacuate & upwind", detail: "Move personnel upwind/uphill; activate spill alarm." },
    { order: 2, title: "Identify substance", detail: "SDS / placard; do not enter without PPE." },
    { order: 3, title: "Call 911 — HAZMAT", detail: "Fire HAZMAT + ambulance; communicate SDS info." },
    { order: 4, title: "Contain if trained", detail: "Spill kit only within training scope." },
    { order: 5, title: "Medical & report", detail: "Decon victims; notify environmental authority as required." },
  ],
  rollover: [
    { order: 1, title: "Secure traffic", detail: "Stop equipment movement; establish traffic control." },
    { order: 2, title: "Call 911 — heavy rescue", detail: "Request extrication-capable response." },
    { order: 3, title: "Stabilize machine", detail: "Trained teams only; fuel/fire watch." },
    { order: 4, title: "Extricate", detail: "Follow rescue lead; first aid once accessible." },
    { order: 5, title: "Scene preservation", detail: "Photograph positions; notify investigation." },
  ],
  general: [
    { order: 1, title: "Assess & alarm", detail: "Sound alarm; determine if life-threatening." },
    { order: 2, title: "Call 911", detail: "Provide location, nature, number of injured." },
    { order: 3, title: "First aid", detail: "Trained responders only; AED if cardiac." },
    { order: 4, title: "Muster", detail: "Account for all personnel at designated muster point." },
    { order: 5, title: "All-clear / investigate", detail: "Resume only after authorized all-clear." },
  ],
};

function parseScenario(raw?: string): QuickAccessScenario {
  const ok: QuickAccessScenario[] = [
    "electrical",
    "fall",
    "trench",
    "chemical",
    "rollover",
    "general",
  ];
  if (raw && (ok as string[]).includes(raw)) return raw as QuickAccessScenario;
  return "general";
}

function immediateActions(): ImmediateAction[] {
  return [
    {
      id: "call-911",
      label: "Call 911",
      detail: "Fire · ambulance · police — state site location & nature of emergency",
      kind: "call",
      phone: "911",
      priority: 1,
    },
    {
      id: "alarm",
      label: "Sound alarm / radio",
      detail: "Emergency channel call: “Emergency, emergency — all stop”",
      kind: "radio",
      jumpTo: "section-radio",
      priority: 2,
    },
    {
      id: "muster",
      label: "Evacuate to muster",
      detail: "Use primary egress; assemble at primary muster; await accountability",
      kind: "muster",
      jumpTo: "section-muster",
      priority: 3,
    },
    {
      id: "first-aid",
      label: "First aid / AED",
      detail: "Only if trained & scene safe — AED and kit locations below",
      kind: "aid",
      jumpTo: "section-equipment",
      priority: 4,
    },
    {
      id: "procedures",
      label: "ERP procedures",
      detail: "Open scenario steps for this site ERP",
      kind: "procedure",
      jumpTo: "section-procedures",
      priority: 5,
    },
    {
      id: "account",
      label: "Account for people",
      detail: "Headcount / missing persons — use ERP drill roster tools",
      kind: "account",
      jumpTo: "section-account",
      priority: 6,
    },
  ];
}

export type BuildQuickAccessInput = {
  projectId?: number;
  companyId?: number;
  projectName?: string;
  regionCode?: string;
  scenario?: string;
  siteAddress?: string;
  radioChannel?: string;
  musterPrimary?: string;
  musterAlternate?: string;
  equipment?: Array<{ name: string; location: string; qty?: number }>;
  siteCoordinatorPhone?: string | null;
  hsePhone?: string | null;
};

export function buildEmergencyQuickAccessPack(
  input: BuildQuickAccessInput = {},
): EmergencyQuickAccessPack {
  const projectId = input.projectId ?? 1;
  const companyId = input.companyId ?? 1;
  const regionCode = input.regionCode ?? "CA-SK";
  const scenario = parseScenario(input.scenario);
  const projectName = input.projectName ?? "Active project";
  const siteAddress =
    input.siteAddress ?? "Confirm gate / civic address with supervisor";
  const radioChannel = input.radioChannel ?? "Ch 1 — Emergency";

  const hazardRouting = routeQuickHazardContacts({
    regionCode,
    scenario,
  });

  const contacts: QuickContact[] = [
    {
      id: "ps-911",
      category: "public_safety",
      name: "Emergency services",
      role: "Fire / ambulance / police",
      phone: "911",
      dialHint: "Dial 911",
      notes: "Primary for all life-threatening emergencies",
      verified: true,
    },
    ...hazardRouting
      .filter((h) => h.phone)
      .map(
        (h): QuickContact => ({
          id: h.id,
          category: h.hazard === "hazardous_release" ? "public_safety" : "utility",
          name: h.name,
          role: h.reason,
          phone: h.phone,
          dialHint: h.dialHint,
          notes: h.reason,
          verified: true,
        }),
      ),
    ...utilitiesForRegion(regionCode)
      .filter((u) => !hazardRouting.some((h) => h.phone === u.phone))
      .map(
      (u): QuickContact => ({
        id: u.id,
        category: "utility",
        name: u.name,
        role: u.role,
        phone: u.phone,
        dialHint: `Dial ${u.phone}`,
        notes: u.notes,
        verified: true,
      }),
    ),
    {
      id: "site-coordinator",
      category: "site",
      name: "Site emergency coordinator",
      role: "Site ERP role",
      phone: input.siteCoordinatorPhone ?? null,
      dialHint: input.siteCoordinatorPhone
        ? `Dial ${input.siteCoordinatorPhone}`
        : "Use radio tree — number not configured (offline-editable)",
      verified: Boolean(input.siteCoordinatorPhone),
    },
    {
      id: "company-hse",
      category: "company",
      name: "Company HSE / on-call",
      role: "Company emergency contact",
      phone: input.hsePhone ?? null,
      dialHint: input.hsePhone
        ? `Dial ${input.hsePhone}`
        : "Confirm from ERP phone tree — not invented here",
      verified: Boolean(input.hsePhone),
    },
  ];

  // Keep OHS / non-dial hazard routes visible via hazardRouting only

  const musterPoints = [
    {
      id: "muster-primary",
      name: input.musterPrimary ?? "Muster Point A — Gate 1",
      description: "Primary assembly — default headcount location",
      primary: true,
    },
    {
      id: "muster-alt",
      name: input.musterAlternate ?? "Muster Point B — North parking",
      description: "Alternate if primary is compromised / downwind hazard",
      primary: false,
    },
  ];

  const equipment = input.equipment?.length
    ? input.equipment.map((e, i) => ({
        id: `eq-${i}`,
        name: e.name,
        location: e.location,
        qty: e.qty,
      }))
    : [
        {
          id: "eq-aed",
          name: "AED",
          location: "Site trailer — main entrance wall",
          qty: 1,
        },
        {
          id: "eq-fa",
          name: "First-aid kit",
          location: "Site trailer — kitchen cabinet",
          qty: 2,
        },
        {
          id: "eq-fe",
          name: "Fire extinguisher",
          location: "Fuel area + weld bay",
          qty: 4,
        },
        {
          id: "eq-spill",
          name: "Spill kit",
          location: "Chemical storage cage",
          qty: 1,
        },
        {
          id: "eq-eye",
          name: "Eyewash / bottle",
          location: "Near chemical storage + trailer wash bay",
          qty: 2,
        },
      ];

  const procedures = PROCEDURES[scenario];
  const callScript = [
    `Call 911.`,
    `State: ${scenario} emergency at ${projectName}.`,
    `Address / access: ${siteAddress}.`,
    `Muster: ${musterPoints[0]?.name}.`,
    `Radio: ${radioChannel}.`,
    `Do not invent secondary EMS numbers — ask dispatcher for receiving hospital / specialized rescue.`,
  ].join(" ");

  return {
    documentType: "EMERGENCY_QUICK_ACCESS",
    generatedAt: new Date().toISOString(),
    projectId,
    companyId,
    projectName,
    regionCode,
    scenario,
    siteAddress,
    radioChannel,
    immediateActions: immediateActions(),
    contacts,
    hazardRouting,
    musterPoints,
    equipment,
    procedures,
    callScript,
    offline: {
      cacheKey: quickAccessCacheKey(projectId, companyId),
      guidance:
        "This pack is saved to device storage so Call 911, contacts, muster, equipment, and ERP steps remain available without network.",
    },
  };
}
