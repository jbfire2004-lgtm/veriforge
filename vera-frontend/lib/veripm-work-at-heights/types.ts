export type WahIndustryId =
  | "construction"
  | "manufacturing"
  | "mining"
  | "power_generation"
  | "nuclear"
  | "tower_communications"
  | "wind"
  | "oil_gas";

export type WahIndustryPlaybook = {
  id: WahIndustryId;
  label: string;
  summary: string;
  typicalSystems: string[];
  controlCues: string[];
  rescueCues: string[];
  suggestedAuditFocus: string[];
};

export const WAH_DISCLAIMER =
  "Clearance worksheet — reference values only. Not a design calculation. Confirm against manufacturer instructions and applicable standards (CSA / ANSI / OSHA / site procedures). Vera does not determine fall clearance adequacy or authorize work.";

export const WAH_INDUSTRY_PLAYBOOKS: WahIndustryPlaybook[] = [
  {
    id: "construction",
    label: "Construction",
    summary:
      "Scaffolds, leading edges, MEWPs, formwork, and steel erection — verify anchorage and swing-fall before work.",
    typicalSystems: [
      "Shock-absorbing lanyards",
      "Leading-edge SRLs",
      "Horizontal lifelines",
      "Guardrails / travel restraint",
    ],
    controlCues: [
      "100% tie-off when exposed",
      "Scaffold tags current",
      "Exclusion zone under work",
      "Competent person inspection",
    ],
    rescueCues: [
      "Rescue plan before work starts",
      "Suspension trauma awareness",
      "Crane / MEWP rescue options",
    ],
    suggestedAuditFocus: ["fall-protection", "scaffolding"],
  },
  {
    id: "manufacturing",
    label: "Manufacturing",
    summary:
      "Mezzanines, machine platforms, catwalks, and maintenance over process equipment.",
    typicalSystems: [
      "Fixed ladders with cages / SRL",
      "Platform guardrails",
      "Restraint lanyards for edge work",
    ],
    controlCues: [
      "LOTO before platform entry over live process",
      "Floor opening covers",
      "Housekeeping on elevated walkways",
    ],
    rescueCues: [
      "Plant emergency response notified",
      "Access for stretcher / basket",
    ],
    suggestedAuditFocus: ["fall-protection"],
  },
  {
    id: "mining",
    label: "Mining",
    summary:
      "Shafts, declines, crushers, conveyors, and plant steel — ground support and mobile equipment interactions matter.",
    typicalSystems: [
      "SRL on plant steel",
      "Travel restraint near openings",
      "Manway / ladder systems",
    ],
    controlCues: [
      "Open hole barricades",
      "Conveyor access platforms guarded",
      "Shaft / hoist interface rules",
    ],
    rescueCues: ["Mine rescue coordination", "Refuge / communications check"],
    suggestedAuditFocus: ["fall-protection"],
  },
  {
    id: "power_generation",
    label: "Power Generation",
    summary:
      "Turbine decks, boiler structures, cooling towers, and switchyard elevated work during outages.",
    typicalSystems: [
      "Outage scaffold systems",
      "SRL / twin lanyards on steel",
      "Temporary horizontal lifelines",
    ],
    controlCues: [
      "Scaffold seismic / wind restraints",
      "HV clearances when working aloft",
      "Energy isolation coordinated with ops",
    ],
    rescueCues: [
      "Unit-specific rescue plans",
      "Fire impairment during hot work aloft",
    ],
    suggestedAuditFocus: ["fall-protection", "scaffolding"],
  },
  {
    id: "nuclear",
    label: "Nuclear",
    summary:
      "Containment / RCA scaffolds, FME zones, and outage heavy lifts — configuration control applies.",
    typicalSystems: [
      "Seismically restrained scaffolds",
      "Approved fall arrest in RCA",
      "Temporary power + access systems",
    ],
    controlCues: [
      "Scaffold tags + seismic restraints",
      "FME accountability at height",
      "Clearance / tagging boundaries walked down",
    ],
    rescueCues: ["RP coverage for rescue path", "OSC notified of elevated work"],
    suggestedAuditFocus: ["fall-protection", "scaffolding"],
  },
  {
    id: "tower_communications",
    label: "Tower / Communications",
    summary:
      "Lattice / monopole climbs, RF exposure, and weather holds — rescue kits travel with the crew.",
    typicalSystems: [
      "Climb assist / safe climb",
      "Full-body harness + twin lanyards",
      "Positioning devices",
    ],
    controlCues: [
      "100% connection while climbing",
      "RF / transmitter status known",
      "Weather / lightning holds enforced",
    ],
    rescueCues: [
      "Tower rescue kit in-date",
      "Ground crew / radio check",
      "Two-person minimum",
    ],
    suggestedAuditFocus: ["fall-protection"],
  },
  {
    id: "wind",
    label: "Wind Energy",
    summary:
      "Turbine climbs, nacelle / hub work, blade rope access, and crane pads during construction.",
    typicalSystems: [
      "Climb assist + fall arrest",
      "Nacelle LOTO / rotor lock",
      "Rope access for blades",
    ],
    controlCues: [
      "Rescue kit in tower before climb",
      "Wind / weather limits",
      "Dropped-object prevention in nacelle",
    ],
    rescueCues: [
      "Tower rescue procedure briefed",
      "Base communications verified",
    ],
    suggestedAuditFocus: ["fall-protection"],
  },
  {
    id: "oil_gas",
    label: "Oil & Gas",
    summary:
      "Pipe racks, vessels, flare structures, and offshore platforms — SIMOPS and hot work often coexist.",
    typicalSystems: [
      "Scaffold / pipe-rack access",
      "SRL on vertical vessels",
      "Boat landing / helideck controls",
    ],
    controlCues: [
      "Permit to work for elevated hot work",
      "Dropped-object surveys",
      "Gas testing before confined elevated spaces",
    ],
    rescueCues: [
      "Standby rescue for confined + height",
      "Marine / platform muster awareness",
    ],
    suggestedAuditFocus: ["fall-protection", "scaffolding"],
  },
];

export type ClearanceParams = {
  maxFreeFallM: number;
  decelerationDistanceM: number;
  harnessStretchM: number;
  lifelinePayoutM: number;
  anchorDeflectionM: number;
  safetyMarginM: number;
};

export type WorksheetGeometry = {
  anchorHeightM?: number;
  workSurfaceHeightM?: number;
  horizontalOffsetM?: number;
  workerMassKg?: number;
  environment?: string;
};

export type WorksheetRecord = {
  id: string;
  companyId: number | null;
  projectId: number | null;
  industry: string | null;
  equipmentId: string | null;
  referenceParams: ClearanceParams;
  userParams: ClearanceParams;
  geometry: WorksheetGeometry;
  userRequiredM: number | null;
  userAvailableM: number | null;
  userLineSubtotalM: number | null;
  userNotes: string | null;
  status: "DRAFT" | "SAVED";
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  createdAt: string;
  updatedAt: string;
  disclaimer: string;
};

export type FallEquipmentProfile = {
  id: string;
  type: string;
  manufacturer: string;
  model: string;
  standardRefs: string[];
  clearanceParams: ClearanceParams;
  rawManualData?: string | null;
  status: string;
};

export type WahHubDashboard = {
  companyId: number;
  projectId: number;
  disclaimer: string;
  industry: WahIndustryId;
  playbook: WahIndustryPlaybook;
  playbooks: WahIndustryPlaybook[];
  kpis: {
    savedWorksheets: number;
    draftOrRecent: number;
    approvedSpecs: number;
    pendingSpecReview: number;
  };
  recentWorksheets: WorksheetRecord[];
  links: Record<string, string>;
};

export const PARAM_ROWS: {
  key: keyof ClearanceParams;
  label: string;
  hint: string;
}[] = [
  {
    key: "maxFreeFallM",
    label: "Free fall (m)",
    hint: "From manufacturer IFU / system limits",
  },
  {
    key: "decelerationDistanceM",
    label: "Deceleration / deployment (m)",
    hint: "Energy absorber or SRL deceleration distance",
  },
  {
    key: "harnessStretchM",
    label: "Harness stretch (m)",
    hint: "Full-body harness elongation allowance",
  },
  {
    key: "lifelinePayoutM",
    label: "Lifeline payout (m)",
    hint: "SRL / lifeline additional payout if applicable",
  },
  {
    key: "anchorDeflectionM",
    label: "Anchor deflection (m)",
    hint: "Anchorage or structure deflection under load",
  },
  {
    key: "safetyMarginM",
    label: "Safety margin (m)",
    hint: "Margin required by standard / manufacturer / site",
  },
];

export function sumParams(p: ClearanceParams): number {
  return (
    Math.round(
      (p.maxFreeFallM +
        p.decelerationDistanceM +
        p.harnessStretchM +
        p.lifelinePayoutM +
        p.anchorDeflectionM +
        p.safetyMarginM) *
        1000,
    ) / 1000
  );
}

export function emptyParams(): ClearanceParams {
  return {
    maxFreeFallM: 0,
    decelerationDistanceM: 0,
    harnessStretchM: 0,
    lifelinePayoutM: 0,
    anchorDeflectionM: 0,
    safetyMarginM: 0,
  };
}

export function q(companyId: number, projectId: number) {
  return `companyId=${companyId}&projectId=${projectId}`;
}
