/**
 * Selector System — types
 */

export type Industry = "mining" | "construction" | "manufacturing";

export type EntityType = "project" | "company";

export type ProjectSubtype =
  | "transmission"
  | "distribution"
  | "substation"
  | "civil"
  | "industrial"
  | "renewable";

export type CompanySubtype =
  | "utility"
  | "epc"
  | "contractor"
  | "engineering_firm"
  | "maintenance_provider";

export type Subtype = ProjectSubtype | CompanySubtype;

export type Scale = "small" | "medium" | "large" | "mega";

export type SelectorState = {
  industry: Industry;
  entityType: EntityType;
  subtype: Subtype;
  scale: Scale;
  regionCode: string;
};

export type OptionAvailability<T extends string> = {
  id: T;
  label: string;
  available: boolean;
  reason?: string;
};

export type RegionOption = {
  code: string;
  label: string;
  level: string;
  parentCode: string | null;
  available: boolean;
  industryPoolAllowed: boolean;
};

export type DynamicFilterResult = {
  industries: OptionAvailability<Industry>[];
  entityTypes: OptionAvailability<EntityType>[];
  subtypes: OptionAvailability<Subtype>[];
  scales: OptionAvailability<Scale>[];
  regions: {
    breadcrumbs: RegionOption[];
    children: RegionOption[];
    current: RegionOption;
  };
  /** Corrected state after cascading snaps */
  resolved: SelectorState;
  contamination: ContaminationReport;
};

export type ContaminationReport = {
  planesIsolated: true;
  crossPlaneBlocked: boolean;
  invalidSubtypeForEntity: boolean;
  correctedFields: Array<keyof SelectorState>;
  messages: string[];
};

export type DashboardContent = {
  generatedAt: string;
  revision: number;
  selectors: SelectorState;
  filter: DynamicFilterResult;
  metrics: {
    suppressed: boolean;
    entityCount: number | null;
    trif: number | null;
    ltif: number | null;
    leadingMaturity: number | null;
    severityIndex: number | null;
  };
  context: {
    plane: EntityType;
    subtypeLabel: string;
    scaleLabel: string;
    industryLabel: string;
    regionLabel: string;
    regionLevel: string;
  };
  rules: {
    dynamicFiltering: true;
    preventCrossContamination: true;
    autoUpdateDashboard: true;
    minSample: number;
    hoursDenominator: 200000;
  };
};
