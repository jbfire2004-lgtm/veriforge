export type SafetyRecall = {
  id: string;
  title: string;
  manufacturer: string;
  product: string;
  summary: string;
  sourceLabel: string;
  sourceUrl: string;
  publishedAt: string;
  severity: "INFO" | "WATCH" | "WARNING";
};

/** Curated equipment recalls & advisories — expand via API/RSS later. */
export const SAFETY_RECALLS: SafetyRecall[] = [
  {
    id: "3m-srl-csa-2024",
    title: "3M DBI-SALA SRL units — CSA Z259.2.2 alignment review",
    manufacturer: "3M / DBI-SALA",
    product: "Self-retracting lifelines (SRLs)",
    summary:
      "Canadian sites should verify SRL inventory against current CSA Z259.2.2 requirements and manufacturer bulletins before next use-at-height deployment.",
    sourceLabel: "3M Fall Protection",
    sourceUrl: "https://www.3m.com/3M/en_US/worker-health-safety-us/",
    publishedAt: "2025-11-15T00:00:00.000Z",
    severity: "WARNING",
  },
  {
    id: "hc-ladder-2025",
    title: "Extension ladders — rung lock failure",
    manufacturer: "Various (retailer batch)",
    product: "Fibreglass extension ladders",
    summary:
      "Health Canada recall: rung locks may fail under load. Stop use and return per retailer instructions.",
    sourceLabel: "Health Canada recalls",
    sourceUrl: "https://recalls-rappels.canada.ca/en",
    publishedAt: "2026-02-10T00:00:00.000Z",
    severity: "WARNING",
  },
  {
    id: "cpsc-harness-2026",
    title: "Full-body harness stitching defect",
    manufacturer: "Example Safety Supply",
    product: "Class A full-body harness",
    summary:
      "CPSC recall notice: affected lots may have incomplete bar-tacking at dorsal attachment. Inspect lot codes before issue.",
    sourceLabel: "U.S. CPSC Recalls",
    sourceUrl: "https://www.cpsc.gov/Recalls",
    publishedAt: "2026-01-22T00:00:00.000Z",
    severity: "WATCH",
  },
];
