/**
 * Province-specific dangerous occurrence rules + auto-flag evaluation.
 * Frameworks: Saskatchewan OHS, Alberta OHS, WorkSafeBC, Manitoba, Ontario OHSA.
 * Guidance is operational summary only — not legal advice.
 * Utility phones stay in erp-ohs-utility.catalog.ts (verified catalog only).
 */

import {
  DANGEROUS_OCCURRENCE_RULES,
  UTILITY_CONTACT_CATALOG,
  normalizeRegion,
  type DangerousOccurrenceCode,
  type ProvincialRegion,
  type UtilityContact,
} from './erp-ohs-utility.catalog';
import { routeHazardContacts } from './hazard-contact-routing';

export type ReportingUrgency =
  | 'immediate'
  | 'as_soon_as_practicable'
  | 'within_24h'
  | 'employer_process';

export type ProvincialOhsProfile = {
  region: ProvincialRegion;
  frameworkLabel: string;
  regulator: string;
  reportChannel: string;
  /** Public info / reporting page hint — no invented phones */
  reportingHint: string;
  fatalityUrgency: ReportingUrgency;
  disclaimer: string;
};

/** Structured obligation for one flagged occurrence in a province. */
export type RequiredReportingObligation = {
  code: DangerousOccurrenceCode;
  label: string;
  region: ProvincialRegion;
  frameworkLabel: string;
  authority: string;
  mustReport: boolean;
  urgency: ReportingUrgency;
  preserveScene: boolean;
  notifyRegulator: boolean;
  notifyUtilityOwner: boolean;
  guidance: string;
  requiredActions: string[];
};

export type DangerousOccurrenceMatch = {
  code: DangerousOccurrenceCode;
  label: string;
  matchedPhrases: string[];
  confidence: number;
};

export type DangerousOccurrenceAssessment = {
  region: ProvincialRegion;
  framework: ProvincialOhsProfile;
  inputSummary: string;
  flagged: boolean;
  codes: DangerousOccurrenceCode[];
  matches: DangerousOccurrenceMatch[];
  requiredReporting: RequiredReportingObligation[];
  mustReportAny: boolean;
  preserveScene: boolean;
  highestUrgency: ReportingUrgency | null;
  utilityContacts: Array<Pick<UtilityContact, 'id' | 'agency' | 'name' | 'phone' | 'notes'>>;
  /** Hazard-specific dial/report routing (gas → SaskEnergy, electrical → SaskPower/ATCO, release → OHS+fire) */
  contactRouting: {
    hazards: string[];
    summary: string[];
    contacts: Array<{
      id: string;
      hazard: string;
      role: string;
      priority: number;
      name: string;
      phone: string | null;
      dialHint: string;
      reason: string;
      verified: boolean;
    }>;
  };
  supervisorReviewRequired: boolean;
  narrative: string;
  disclaimer: string;
};

export const PROVINCIAL_OHS_PROFILES: Record<string, ProvincialOhsProfile> = {
  'CA-SK': {
    region: 'CA-SK',
    frameworkLabel: 'Saskatchewan OHS',
    regulator: 'Saskatchewan Ministry of Labour Relations and Workplace Safety — OHS',
    reportChannel: 'Dangerous occurrence / serious injury reporting to OHS Division',
    reportingHint:
      'Confirm current reporting method with Saskatchewan OHS (ministry channels).',
    fatalityUrgency: 'immediate',
    disclaimer:
      'Operational summary of Saskatchewan OHS dangerous-occurrence themes — not legal advice.',
  },
  'CA-AB': {
    region: 'CA-AB',
    frameworkLabel: 'Alberta OHS',
    regulator: 'Alberta Occupational Health and Safety',
    reportChannel: 'Serious incident / injury reporting to Alberta OHS',
    reportingHint:
      'Confirm current Alberta OHS reporting method (OHS Contact Centre / online as applicable).',
    fatalityUrgency: 'immediate',
    disclaimer:
      'Operational summary of Alberta OHS serious-incident themes — not legal advice.',
  },
  'CA-BC': {
    region: 'CA-BC',
    frameworkLabel: 'WorkSafeBC',
    regulator: 'WorkSafeBC',
    reportChannel: 'Immediately reportable incidents / serious injury to WorkSafeBC',
    reportingHint:
      'Confirm current WorkSafeBC immediate-reporting channels for the event type.',
    fatalityUrgency: 'immediate',
    disclaimer:
      'Operational summary of WorkSafeBC reportable-incident themes — not legal advice.',
  },
  'CA-MB': {
    region: 'CA-MB',
    frameworkLabel: 'Manitoba Workplace Safety and Health',
    regulator: 'Manitoba Workplace Safety and Health',
    reportChannel: 'Serious incident reporting to Workplace Safety and Health',
    reportingHint: 'Confirm current Manitoba WSH reporting methods.',
    fatalityUrgency: 'immediate',
    disclaimer:
      'Operational summary of Manitoba WSH serious-incident themes — not legal advice.',
  },
  'CA-ON': {
    region: 'CA-ON',
    frameworkLabel: 'Ontario OHSA',
    regulator: 'Ontario Ministry of Labour, Immigration, Training and Skills Development',
    reportChannel: 'Critical injury / fatality / prescribed incidents to MOL',
    reportingHint: 'Confirm current Ontario MOL notification requirements.',
    fatalityUrgency: 'immediate',
    disclaimer:
      'Operational summary of Ontario OHSA critical-injury / notice themes — not legal advice.',
  },
};

type DetectionRule = {
  code: Exclude<DangerousOccurrenceCode, 'none'>;
  label: string;
  /** Phrases that must appear (case-insensitive) */
  phrases: string[];
  /** If any of these appear near a weak match, suppress */
  negativePhrases?: string[];
  weight: number;
};

const DETECTION_RULES: DetectionRule[] = [
  {
    code: 'gas_line_strike',
    label: 'Gas / pipeline strike or release',
    phrases: [
      'gas line',
      'gas strike',
      'hit a gas',
      'hit gas',
      'natural gas',
      'pipeline strike',
      'pipeline hit',
      'saskenergy',
      'gas odor',
      'gas odour',
      'hissing gas',
      'line strike',
      'ruptured gas',
    ],
    weight: 0.95,
  },
  {
    code: 'electrical_contact',
    label: 'Electrical contact / arc flash / power line',
    phrases: [
      'arc flash',
      'electrical contact',
      'power line',
      'contact with power',
      'energized line',
      'electric shock',
      'electrical shock',
      'electrocution',
      'overhead line',
      'downed line',
      'saskpower',
      'bc hydro',
    ],
    weight: 0.92,
  },
  {
    code: 'excavation_cave_in',
    label: 'Excavation / trench cave-in',
    phrases: [
      'cave-in',
      'cave in',
      'trench collapse',
      'excavation collapse',
      'engulfed in',
      'soil collapse',
      'trench failure',
    ],
    weight: 0.93,
  },
  {
    code: 'chemical_release',
    label: 'Chemical / hazardous substance release',
    phrases: [
      'chemical spill',
      'chemical release',
      'hazmat release',
      'toxic release',
      'acid spill',
      'solvent spill',
      'hazardous substance',
      'product release',
    ],
    weight: 0.88,
  },
  {
    code: 'crane_failure',
    label: 'Crane / lifting failure',
    phrases: [
      'crane failure',
      'crane tip',
      'crane overturn',
      'dropped load',
      'rigging failure',
      'critical lift failure',
      'load dropped',
    ],
    weight: 0.9,
  },
  {
    code: 'fire_explosion',
    label: 'Fire / explosion',
    phrases: [
      'explosion',
      'on fire',
      'structure fire',
      'flash fire',
      'blast',
      'burned',
      'fire broke out',
      'caught fire',
    ],
    negativePhrases: [
      'fire extinguisher',
      'fire watch',
      'fire drill',
      'fire warden',
    ],
    weight: 0.9,
  },
  {
    code: 'fatality_or_critical_injury',
    label: 'Fatality or critical injury',
    phrases: [
      'fatality',
      'fatal injury',
      'critical injury',
      'life threatening',
      'life-threatening',
      'worker died',
      'death on site',
      'ambulance for critical',
    ],
    weight: 1,
  },
  {
    code: 'structural_collapse',
    label: 'Structural collapse',
    phrases: [
      'structural collapse',
      'scaffold collapse',
      'scaffold failure',
      'building collapse',
      'formwork collapse',
      'wall collapse',
    ],
    weight: 0.92,
  },
  {
    code: 'worker_entrapment',
    label: 'Worker entrapment / confined space',
    phrases: [
      'worker trapped',
      'entrapment',
      'entrapped',
      'confined space rescue',
      'caught in equipment',
      'caught between',
      'pinned by',
    ],
    weight: 0.9,
  },
];

/** Per-province reporting matrix keyed by occurrence code. */
type ReportingMatrixEntry = {
  mustReport: boolean;
  urgency: ReportingUrgency;
  preserveScene: boolean;
  notifyRegulator: boolean;
  notifyUtilityOwner: boolean;
  guidance: string;
  requiredActions: string[];
};

const REPORTING_MATRIX: Record<
  string,
  Partial<Record<Exclude<DangerousOccurrenceCode, 'none'>, ReportingMatrixEntry>>
> = {
  'CA-SK': {
    gas_line_strike: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'Saskatchewan OHS: gas releases / line strikes that meet dangerous-occurrence criteria require prompt OHS notification; notify SaskEnergy (or asset owner) immediately and call 911 if uncontrolled.',
      requiredActions: [
        'Evacuate upwind / secure ignition sources',
        'Notify utility owner (catalog number)',
        'Notify Saskatchewan OHS per dangerous-occurrence rules',
        'Preserve scene except to prevent further harm',
      ],
    },
    electrical_contact: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'Saskatchewan OHS: electrical contact / serious injury is reportable; notify SaskPower for electrical infrastructure events.',
      requiredActions: [
        'Assume conductors energized until utility clear',
        'Notify SaskPower / asset owner',
        'Report to Saskatchewan OHS',
      ],
    },
    excavation_cave_in: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Saskatchewan OHS: trench/excavation cave-in or engulfment typically meets dangerous-occurrence reporting thresholds.',
      requiredActions: [
        'Do not enter unprotected excavation',
        'Call specialized rescue / 911 as needed',
        'Notify Saskatchewan OHS',
      ],
    },
    chemical_release: {
      mustReport: true,
      urgency: 'as_soon_as_practicable',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Saskatchewan OHS / environmental rules may require reporting of dangerous chemical releases — notify OHS and follow SDS.',
      requiredActions: [
        'Evacuate upwind; consult SDS',
        'Notify OHS / environmental authority as required',
      ],
    },
    crane_failure: {
      mustReport: true,
      urgency: 'as_soon_as_practicable',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Saskatchewan OHS: crane / lifting incidents with serious injury potential or structural risk may be reportable dangerous occurrences.',
      requiredActions: [
        'Establish exclusion zone',
        'Preserve scene',
        'Notify Saskatchewan OHS when criteria met',
      ],
    },
    fire_explosion: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'Saskatchewan OHS: workplace fire/explosion with injury or structural risk — report; call 911.',
      requiredActions: [
        'Evacuate / account personnel',
        'Call 911',
        'Notify OHS and utility if infrastructure involved',
      ],
    },
    fatality_or_critical_injury: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Saskatchewan OHS: immediately report fatalities and critical injuries; preserve the scene.',
      requiredActions: [
        'Secure medical response',
        'Immediate OHS notification',
        'Preserve scene; follow company notification protocol',
      ],
    },
    structural_collapse: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'Saskatchewan OHS: structural collapse is typically a reportable dangerous occurrence.',
      requiredActions: [
        'Establish collapse zone',
        'Notify OHS and specialized rescue',
        'Utility shutoffs only as directed by responders',
      ],
    },
    worker_entrapment: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Saskatchewan OHS: entrapment / confined-space events with injury or rescue often require OHS notification.',
      requiredActions: [
        'Do not enter without rescue-rated team',
        'Call 911 / technical rescue',
        'Notify Saskatchewan OHS',
      ],
    },
  },
  'CA-AB': {
    gas_line_strike: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'Alberta OHS: uncontrolled gas releases / strikes that cause or risk serious injury are reportable; notify ATCO Gas / utility owner and 911 if uncontrolled.',
      requiredActions: [
        'Evacuate and eliminate ignition sources',
        'Notify utility emergency line',
        'Report serious incident to Alberta OHS',
      ],
    },
    electrical_contact: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'Alberta OHS: serious electrical incidents are reportable; notify electric utility as applicable.',
      requiredActions: [
        'Isolate if safe; keep clear of conductors',
        'Notify utility owner',
        'Report to Alberta OHS',
      ],
    },
    excavation_cave_in: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Alberta OHS: trench cave-in with injury or potential fatality is reportable.',
      requiredActions: [
        'No unprotected re-entry',
        'Technical rescue / 911',
        'Report to Alberta OHS',
      ],
    },
    chemical_release: {
      mustReport: true,
      urgency: 'as_soon_as_practicable',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Alberta: report serious chemical exposures/releases to OHS and environment as required.',
      requiredActions: ['SDS response', 'OHS / environment notification as required'],
    },
    crane_failure: {
      mustReport: true,
      urgency: 'as_soon_as_practicable',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Alberta OHS: crane incidents with injury or structural risk are typically reportable.',
      requiredActions: ['Exclusion zone', 'Preserve scene', 'Notify Alberta OHS'],
    },
    fire_explosion: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'Alberta OHS: workplace fires/explosions with serious injury — report; call 911.',
      requiredActions: ['Evacuate', 'Call 911', 'Notify Alberta OHS'],
    },
    fatality_or_critical_injury: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Alberta OHS: immediately report fatalities and serious injuries; preserve the scene.',
      requiredActions: [
        'Medical response',
        'Immediate Alberta OHS notification',
        'Preserve scene',
      ],
    },
    structural_collapse: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'Alberta OHS: structural failure with serious injury risk is reportable.',
      requiredActions: ['Collapse zone', 'Notify Alberta OHS', 'Specialized rescue'],
    },
    worker_entrapment: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Alberta OHS: confined-space / entrapment with injury is reportable.',
      requiredActions: [
        'Rescue-rated entry only',
        'Call 911',
        'Notify Alberta OHS',
      ],
    },
  },
  'CA-BC': {
    gas_line_strike: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'WorkSafeBC: gas strikes / releases meeting immediately reportable criteria must be reported; notify FortisBC / utility and emergency services.',
      requiredActions: [
        'Evacuate upwind',
        'Notify FortisBC / utility',
        'Report to WorkSafeBC when criteria met',
      ],
    },
    electrical_contact: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'WorkSafeBC: electrical contact / serious injury — report; notify BC Hydro for electrical infrastructure.',
      requiredActions: [
        'Keep clear of conductors',
        'Notify BC Hydro',
        'Report to WorkSafeBC',
      ],
    },
    excavation_cave_in: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'WorkSafeBC: excavation collapse / serious injury is immediately reportable when criteria are met.',
      requiredActions: [
        'No unprotected entry',
        'Technical rescue / 911',
        'Notify WorkSafeBC',
      ],
    },
    chemical_release: {
      mustReport: true,
      urgency: 'as_soon_as_practicable',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'WorkSafeBC: dangerous chemical occurrences / serious exposures require employer reporting when criteria met; follow SDS.',
      requiredActions: ['SDS response', 'Notify WorkSafeBC as required'],
    },
    crane_failure: {
      mustReport: true,
      urgency: 'as_soon_as_practicable',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'WorkSafeBC: major equipment failures causing or risking serious injury may be immediately reportable.',
      requiredActions: ['Exclusion zone', 'Preserve scene', 'Notify WorkSafeBC'],
    },
    fire_explosion: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'WorkSafeBC: fire/explosion with serious injury — report; call 911.',
      requiredActions: ['Evacuate', 'Call 911', 'Notify WorkSafeBC'],
    },
    fatality_or_critical_injury: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'WorkSafeBC: immediately report fatalities and serious injuries; preserve the scene.',
      requiredActions: [
        'Medical response',
        'Immediate WorkSafeBC notification',
        'Preserve scene',
      ],
    },
    structural_collapse: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'WorkSafeBC: structural collapse with serious injury risk is typically immediately reportable.',
      requiredActions: ['Collapse zone', 'Notify WorkSafeBC', 'Specialized rescue'],
    },
    worker_entrapment: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'WorkSafeBC: entrapment / confined-space rescue events often meet immediate reporting criteria.',
      requiredActions: [
        'Rescue-rated team only',
        'Call 911',
        'Notify WorkSafeBC',
      ],
    },
  },
  'CA-MB': {
    gas_line_strike: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'Manitoba WSH: serious gas incidents are reportable; notify gas utility / Manitoba Hydro as applicable.',
      requiredActions: ['Secure scene', 'Notify utility', 'Notify Manitoba WSH'],
    },
    fatality_or_critical_injury: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Manitoba: immediately report fatalities / serious incidents to Workplace Safety and Health.',
      requiredActions: ['Medical response', 'Immediate WSH notification', 'Preserve scene'],
    },
    electrical_contact: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'Manitoba WSH: serious electrical contact is reportable; notify electrical utility as applicable.',
      requiredActions: ['Notify utility', 'Notify Manitoba WSH'],
    },
    excavation_cave_in: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance: 'Manitoba WSH: excavation collapse with serious injury risk — report.',
      requiredActions: ['No unprotected entry', 'Notify Manitoba WSH'],
    },
    fire_explosion: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance: 'Manitoba WSH: workplace fire/explosion with serious injury — report.',
      requiredActions: ['Evacuate', 'Call 911', 'Notify Manitoba WSH'],
    },
    chemical_release: {
      mustReport: true,
      urgency: 'as_soon_as_practicable',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance: 'Manitoba: report serious chemical releases per WSH / environmental rules.',
      requiredActions: ['SDS response', 'Notify WSH as required'],
    },
    crane_failure: {
      mustReport: true,
      urgency: 'as_soon_as_practicable',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance: 'Manitoba WSH: major lifting failures with serious injury risk may be reportable.',
      requiredActions: ['Exclusion zone', 'Notify Manitoba WSH'],
    },
    structural_collapse: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance: 'Manitoba WSH: structural collapse — report serious incidents.',
      requiredActions: ['Collapse zone', 'Notify Manitoba WSH'],
    },
    worker_entrapment: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance: 'Manitoba WSH: entrapment with injury / rescue — report.',
      requiredActions: ['Rescue-rated team', 'Notify Manitoba WSH'],
    },
  },
  'CA-ON': {
    gas_line_strike: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'Ontario OHSA: critical injuries / prescribed notices may apply; contact Enbridge / local gas utility for line strikes; notify MOL when required.',
      requiredActions: [
        'Secure / evacuate',
        'Notify gas utility',
        'MOL notification when critical injury / prescribed criteria met',
      ],
    },
    fatality_or_critical_injury: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Ontario MOL: immediately report fatalities and critical injuries; preserve the scene.',
      requiredActions: [
        'Medical response',
        'Immediate MOL notification',
        'Preserve scene',
      ],
    },
    electrical_contact: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: true,
      guidance:
        'Ontario OHSA: electrical contact causing critical injury is reportable to MOL; notify utility as applicable.',
      requiredActions: ['Notify utility', 'MOL notification when criteria met'],
    },
    excavation_cave_in: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Ontario OHSA: cave-in causing critical injury / prescribed notice — report to MOL.',
      requiredActions: ['No unprotected entry', 'Notify MOL when criteria met'],
    },
    chemical_release: {
      mustReport: true,
      urgency: 'as_soon_as_practicable',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Ontario: chemical events may trigger MOL and environmental reporting depending on injury / prescribed criteria.',
      requiredActions: ['SDS response', 'MOL / environment notification as required'],
    },
    crane_failure: {
      mustReport: true,
      urgency: 'as_soon_as_practicable',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Ontario OHSA: crane incidents causing critical injury are reportable.',
      requiredActions: ['Exclusion zone', 'Notify MOL when criteria met'],
    },
    fire_explosion: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Ontario OHSA: fire/explosion with critical injury — report to MOL; call 911.',
      requiredActions: ['Evacuate', 'Call 911', 'Notify MOL when criteria met'],
    },
    structural_collapse: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Ontario OHSA: structural collapse with critical injury — report to MOL.',
      requiredActions: ['Collapse zone', 'Notify MOL when criteria met'],
    },
    worker_entrapment: {
      mustReport: true,
      urgency: 'immediate',
      preserveScene: true,
      notifyRegulator: true,
      notifyUtilityOwner: false,
      guidance:
        'Ontario OHSA: entrapment causing critical injury — report to MOL.',
      requiredActions: ['Rescue-rated team', 'Notify MOL when criteria met'],
    },
  },
};

const URGENCY_RANK: Record<ReportingUrgency, number> = {
  immediate: 4,
  as_soon_as_practicable: 3,
  within_24h: 2,
  employer_process: 1,
};

function getProfile(region: ProvincialRegion): ProvincialOhsProfile {
  return (
    PROVINCIAL_OHS_PROFILES[region] ?? {
      region,
      frameworkLabel: `${region} OHS`,
      regulator: `${region} occupational health and safety authority`,
      reportChannel: 'Report serious / dangerous occurrences per local OHS rules',
      reportingHint: 'Confirm current regulator reporting channels for this jurisdiction.',
      fatalityUrgency: 'immediate' as const,
      disclaimer:
        'Operational summary only — not legal advice. Confirm local OHS reporting duties.',
    }
  );
}

function fallbackMatrixEntry(
  profile: ProvincialOhsProfile,
  code: Exclude<DangerousOccurrenceCode, 'none'>,
  label: string,
): ReportingMatrixEntry {
  const catalogRule = DANGEROUS_OCCURRENCE_RULES.find((r) => r.code === code);
  const guidance =
    catalogRule?.reportingByRegion[profile.region] ??
    `Report ${label} per ${profile.frameworkLabel} requirements and notify the asset owner.`;
  return {
    mustReport: true,
    urgency:
      code === 'fatality_or_critical_injury'
        ? profile.fatalityUrgency
        : 'as_soon_as_practicable',
    preserveScene: true,
    notifyRegulator: true,
    notifyUtilityOwner: ['gas_line_strike', 'electrical_contact'].includes(code),
    guidance,
    requiredActions: catalogRule?.erpAppendices?.slice(0, 3) ?? [
      'Secure scene',
      `Notify ${profile.regulator}`,
    ],
  };
}

/** Phrase-based detection with negative filters (reduces extinguisher/drill false positives). */
export function matchDangerousOccurrences(text: string): DangerousOccurrenceMatch[] {
  const lower = (text || '').toLowerCase();
  if (!lower.trim()) return [];

  const matches: DangerousOccurrenceMatch[] = [];
  for (const rule of DETECTION_RULES) {
    if (rule.negativePhrases?.some((n) => lower.includes(n))) {
      // Only suppress if no strong distinct phrases beyond the negative context
      const strong = rule.phrases.filter(
        (p) => lower.includes(p) && !rule.negativePhrases!.some((n) => n.includes(p)),
      );
      if (!strong.length) continue;
    }
    const hitPhrases = rule.phrases.filter((p) => lower.includes(p));
    if (!hitPhrases.length) continue;
    const confidence = Math.min(
      1,
      rule.weight + Math.min(0.08, (hitPhrases.length - 1) * 0.03),
    );
    matches.push({
      code: rule.code,
      label: rule.label,
      matchedPhrases: hitPhrases,
      confidence: Math.round(confidence * 100) / 100,
    });
  }
  return matches.sort((a, b) => b.confidence - a.confidence);
}

/** @deprecated Prefer matchDangerousOccurrences / evaluateDangerousOccurrences */
export function detectDangerousOccurrenceCodes(
  text: string,
): DangerousOccurrenceCode[] {
  const matches = matchDangerousOccurrences(text);
  return matches.length ? matches.map((m) => m.code) : ['none'];
}

export function evaluateDangerousOccurrences(
  text: string,
  regionCode: string,
): DangerousOccurrenceAssessment {
  const region = normalizeRegion(regionCode);
  const framework = getProfile(region);
  const matches = matchDangerousOccurrences(text);
  const codes: DangerousOccurrenceCode[] = matches.length
    ? matches.map((m) => m.code)
    : ['none'];
  const flagged = codes[0] !== 'none';

  const requiredReporting: RequiredReportingObligation[] = [];
  for (const match of matches) {
    if (match.code === 'none') continue;
    const matrix =
      REPORTING_MATRIX[region]?.[match.code] ??
      fallbackMatrixEntry(framework, match.code, match.label);
    requiredReporting.push({
      code: match.code,
      label: match.label,
      region,
      frameworkLabel: framework.frameworkLabel,
      authority: framework.regulator,
      mustReport: matrix.mustReport,
      urgency: matrix.urgency,
      preserveScene: matrix.preserveScene,
      notifyRegulator: matrix.notifyRegulator,
      notifyUtilityOwner: matrix.notifyUtilityOwner,
      guidance: matrix.guidance,
      requiredActions: matrix.requiredActions,
    });
  }

  const utilityContacts = UTILITY_CONTACT_CATALOG.filter((c) => {
    const regionMatch =
      c.region === region ||
      region.startsWith(String(c.region)) ||
      String(c.region).startsWith(region.slice(0, 5));
    if (!regionMatch) return false;
    if (!flagged) return c.agency === 'one_call';
    return c.triggers.some((t) => codes.includes(t));
  }).map((u) => ({
    id: u.id,
    agency: u.agency,
    name: u.name,
    phone: u.phone,
    notes: u.notes,
  }));

  const routed = routeHazardContacts({
    regionCode: region,
    occurrences: codes,
    text,
  });
  const contactRouting = {
    hazards: routed.hazards,
    summary: routed.summary,
    contacts: routed.contacts.map((c) => ({
      id: c.id,
      hazard: c.hazard,
      role: c.role,
      priority: c.priority,
      name: c.name,
      phone: c.phone,
      dialHint: c.dialHint,
      reason: c.reason,
      verified: c.verified,
    })),
  };
  const mustReportAny = requiredReporting.some((r) => r.mustReport);
  const preserveScene = requiredReporting.some((r) => r.preserveScene);
  let highestUrgency: ReportingUrgency | null = null;
  for (const r of requiredReporting) {
    if (
      !highestUrgency ||
      URGENCY_RANK[r.urgency] > URGENCY_RANK[highestUrgency]
    ) {
      highestUrgency = r.urgency;
    }
  }

  const narrative = !flagged
    ? `No dangerous-occurrence phrases detected for ${framework.frameworkLabel}. Continue company incident reporting; re-check if facts change.`
    : `Auto-flagged ${matches.length} dangerous occurrence type(s) under ${framework.frameworkLabel}` +
      (mustReportAny
        ? ` — required reporting indicated (${highestUrgency ?? 'review'}).`
        : '.');

  return {
    region,
    framework,
    inputSummary: (text || '').slice(0, 280),
    flagged,
    codes,
    matches,
    requiredReporting,
    mustReportAny,
    preserveScene,
    highestUrgency,
    utilityContacts,
    contactRouting,
    supervisorReviewRequired: mustReportAny || preserveScene,
    narrative,
    disclaimer: framework.disclaimer,
  };
}

/** Compact OHS rows for ERP document sections. */
export function assessmentToOhsRows(assessment: DangerousOccurrenceAssessment) {
  return assessment.requiredReporting.map((r) => ({
    code: r.code,
    label: r.label,
    guidance: r.guidance,
    mustReport: r.mustReport,
    urgency: r.urgency,
    authority: r.authority,
    frameworkLabel: r.frameworkLabel,
    preserveScene: r.preserveScene,
    requiredActions: r.requiredActions,
  }));
}

export { normalizeRegion };
