export const MIN_SAMPLE = 5 as const;
export const HOURS_DENOMINATOR = 200_000 as const;

export type IndustryCode =
  | "construction"
  | "energy"
  | "manufacturing"
  | "transportation"
  | "mining"
  | "utilities"
  | "other";

export type ScaleBand = "small" | "medium" | "large" | "mega";

export type ProjectSubtype =
  | "transmission"
  | "distribution"
  | "substation"
  | "civil"
  | "industrial"
  | "renewable";

export const PROJECT_SUBTYPES: ProjectSubtype[] = [
  "transmission",
  "distribution",
  "substation",
  "civil",
  "industrial",
  "renewable",
];

export type CompanySubtype =
  | "utility"
  | "epc"
  | "contractor"
  | "engineering_firm"
  | "maintenance_provider";

export const COMPANY_SUBTYPES: CompanySubtype[] = [
  "utility",
  "epc",
  "contractor",
  "engineering_firm",
  "maintenance_provider",
];

export const INDUSTRIES: IndustryCode[] = [
  "construction",
  "energy",
  "manufacturing",
  "transportation",
  "mining",
  "utilities",
  "other",
];

export const SCALES: ScaleBand[] = ["small", "medium", "large", "mega"];

export type ProjectScaleQuery = {
  industry: IndustryCode;
  projectType: ProjectSubtype;
  scale: ScaleBand;
  period: string;
};

export type CompanyScaleQuery = {
  industry: IndustryCode;
  companyType: CompanySubtype;
  scale: ScaleBand;
  period: string;
};
