export type SafetyBulletin = {
  id: string;
  title: string;
  category: "LEGISLATION" | "CSA_STANDARD" | "INDUSTRY" | "PROVINCIAL";
  summary: string;
  effectiveDate?: string;
  sourceLabel: string;
  sourceUrl: string;
  publishedAt: string;
};

export type StandardsResourceLink = {
  id: string;
  name: string;
  description: string;
  url: string;
  region: "CA" | "US" | "INTL";
};

export const SAFETY_BULLETINS: SafetyBulletin[] = [
  {
    id: "csa-z259-srl-update",
    title: "CSA Z259.2.2 — SRL design & periodic inspection expectations",
    category: "CSA_STANDARD",
    summary:
      "Align site SRL inspection intervals, leading-edge labeling, and rescue plans with the current CSA fall-protection suite. Coordinate with your manufacturer field notice for 3M / DBI-SALA inventory.",
    effectiveDate: "2025-01-01",
    sourceLabel: "CSA Group — Fall protection",
    sourceUrl: "https://www.csagroup.org/store/",
    publishedAt: "2025-12-01T00:00:00.000Z",
  },
  {
    id: "ab-ohs-penalty-update",
    title: "Alberta OHS — administrative penalties framework",
    category: "LEGISLATION",
    summary:
      "Updated guidance on administrative penalties for high-risk contraventions. Review supervisor accountability and documentation practices on active projects.",
    sourceLabel: "Alberta OHS",
    sourceUrl: "https://www.alberta.ca/occupational-health-safety",
    publishedAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "ansi-a10-cranes",
    title: "ANSI A10 — crane & hoist communication",
    category: "INDUSTRY",
    summary:
      "Cross-border crews: confirm signal person qualification and lift planning templates match current ANSI A10 series references used by your prime contractor.",
    sourceLabel: "ANSI standards",
    sourceUrl: "https://www.ansi.org/",
    publishedAt: "2026-02-18T00:00:00.000Z",
  },
];

export const STANDARDS_RESOURCE_LINKS: StandardsResourceLink[] = [
  {
    id: "csa",
    name: "CSA Group",
    description: "Canadian standards store — Z259 fall protection, Z462 electrical, etc.",
    url: "https://www.csagroup.org/",
    region: "CA",
  },
  {
    id: "ansi",
    name: "ANSI",
    description: "American National Standards Institute publications portal.",
    url: "https://www.ansi.org/",
    region: "US",
  },
  {
    id: "ccohs",
    name: "CCOHS",
    description: "Canadian Centre for Occupational Health and Safety guidance.",
    url: "https://www.ccohs.ca/",
    region: "CA",
  },
  {
    id: "hc-recalls",
    name: "Health Canada — Recalls",
    description: "Official consumer product recalls and safety alerts (Canada).",
    url: "https://recalls-rappels.canada.ca/en",
    region: "CA",
  },
  {
    id: "cpsc",
    name: "U.S. CPSC Recalls",
    description: "Consumer Product Safety Commission recall database.",
    url: "https://www.cpsc.gov/Recalls",
    region: "US",
  },
  {
    id: "osha",
    name: "OSHA",
    description: "U.S. Occupational Safety and Health Administration standards & letters.",
    url: "https://www.osha.gov/",
    region: "US",
  },
];
