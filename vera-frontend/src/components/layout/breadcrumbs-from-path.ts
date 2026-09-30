import type { BreadcrumbItem } from "@/components/ui/breadcrumbs";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  core: "Core",
  supervisor: "Supervisor",
  dashboard: "Dashboard",
  workers: "Workers",
  companies: "Companies",
  wallet: "Worker wallet",
  training: "Training",
  trainings: "Trainings",
  certifications: "Credentials",
  verification: "Verification",
  "training-ingest": "Training ingest",
  "worker-lookup": "Worker lookup",
  "daily-log": "Daily log",
  incident: "Incident",
  upload: "Upload",
  equipment: "Equipment",
  incidents: "Incidents",
  analytics: "Analytics",
  documents: "Documents",
  "daily-logs": "Daily logs",
  "meeting-records": "Meeting records",
  "compliance-notes": "Compliance notes",
  "safety-observations": "Safety observations",
  "action-items": "Action items",
  "site-risks": "Site risks",
  sites: "Sites",
  pm: "Project Management",
  inspections: "Inspections",
  "jha-flha": "JHA / FLHA",
  permits: "Permits",
  "equipment-safety": "Equipment safety",
  "worker-safety-profile": "Worker safety",
  projects: "Projects",
  "project-management": "Projects",
  "smart-site": "Smart site",
  "focus-audits": "Focus audits",
  templates: "Templates",
  "findings-log": "Findings log",
  "smart-workspace": "Smart workspace",
  flha: "FLHA",
  jha: "JHA",
  shared: "Shared inspections",
  report: "Report",
  "safety-forms": "Safety Forms",
  "safety-intelligence": "Safety Intelligence",
  safety: "PM Safety",
  bbo: "BBO",
  cail: "CAIL",
  lessons: "Lessons Learned",
  copilot: "Copilot",
  new: "New",
  edit: "Edit",
  data: "Data",
  "data-table": "Data table",
};

function humanizeSegment(segment: string): string {
  if (/^\d+$/.test(segment)) return `#${segment}`;
  const mapped = SEGMENT_LABELS[segment];
  if (mapped) return mapped;
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Builds breadcrumb trail from pathname; last crumb has no href (current page).
 */
export function breadcrumbsFromPathname(pathname: string): BreadcrumbItem[] {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const segments = normalized.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];
  let acc = "";
  for (let i = 0; i < segments.length; i++) {
    acc += `/${segments[i]}`;
    const isLast = i === segments.length - 1;
    items.push({
      label: humanizeSegment(segments[i]),
      href: isLast ? undefined : acc,
    });
  }
  return items;
}

export function pageTitleFromPathname(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 0) return "VERA";

  const last = segments[segments.length - 1];
  const parent = segments.length >= 2 ? segments[segments.length - 2] : null;

  if (/^\d+$/.test(last)) {
    if (parent === "workers") return "Worker profile";
    if (parent === "wallet") return "Worker wallet";
    if (parent === "companies") return "Company";
    return humanizeSegment(parent ?? last);
  }

  const fullPath = `/${segments.join("/")}`;
  if (fullPath === "/admin") return "Admin dashboard";
  if (fullPath === "/dashboard") return "Dashboard";
  if (fullPath === "/supervisor") return "Supervisor";

  return humanizeSegment(last);
}
