import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import CompanyTrainingRequirementsPanel from "@/app/components/company/CompanyTrainingRequirementsPanel";
import { Breadcrumbs, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { CompanyDashboardClient } from "./CompanyDashboardClient";
import CompanyHeaderCard from "./CompanyHeaderCard";
import { CompanySubNav } from "@/components/companies/CompanySubNav";
import { CompanyScoreSummary } from "@/components/companies/compliance/CompanyScoreSummary";
import CompliancePanel from "./CompliancePanel";
import EquipmentPanel from "./EquipmentPanel";
import IncidentsPanel from "./IncidentsPanel";
import TrainingPanel from "./TrainingPanel";
import CompanyTrainingCompliancePanel from "./CompanyTrainingCompliancePanel";
import CredentialsPanel from "./CredentialsPanel";
import WorkersPanel from "./WorkersPanel";
import type { CompanyDetails, CompanyIncident } from "./types";

type RouteParams = { id: string };

function isInvalidId(raw: string): boolean {
  const trimmed = raw.trim();
  return !/^\d+$/.test(trimmed) || Number(trimmed) < 1;
}

const breadcrumbs = [
  { label: "VERA", href: "/" },
  { label: "Companies", href: "/companies" },
];

export default async function CompanyPage({
  params,
}: {
  params: Promise<RouteParams> | RouteParams;
}) {
  const { id } = await Promise.resolve(params);
  const idTrim = String(id ?? "").trim();

  if (isInvalidId(idTrim)) {
    return (
      <div className="space-y-vera-6">
        <Breadcrumbs items={[...breadcrumbs, { label: "Invalid id" }]} />
        <ErrorState
          title="Invalid company ID"
          description="The id in the URL is missing or not a positive integer. Use a positive numeric id, e.g. /companies/12."
        >
          <Link
            href="/companies"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Back to companies
          </Link>
        </ErrorState>
      </div>
    );
  }

  const companyId = Number(idTrim);
  const res = await apiGetSafe<CompanyDetails>(`/companies/${companyId}`);

  if (!res.ok) {
    return (
      <div className="space-y-vera-6">
        <Breadcrumbs
          items={[...breadcrumbs, { label: `Company #${companyId}` }]}
        />
        <ErrorState
          title="Company unavailable"
          description={res.error || `Could not load company #${companyId}.`}
        >
          <Link
            href="/companies"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            Back to companies
          </Link>
        </ErrorState>
      </div>
    );
  }

  const company = res.data;
  const workers = company.workers ?? [];
  const equipment = company.equipment ?? [];
  const workerIncidents: CompanyIncident[] = workers.flatMap(
    (w) => w.incidents ?? []
  );
  const equipmentIncidents: CompanyIncident[] = equipment.flatMap(
    (e) => e.incidents ?? []
  );

  const trainingCount = workers.reduce(
    (n, w) => n + (w.trainingRecords?.length ?? 0),
    0,
  );

  return (
    <div className="space-y-vera-8">
      <Breadcrumbs items={[...breadcrumbs, { label: company.name }]} />

      <CompanySubNav companyId={companyId} />

      <div className="grid gap-vera-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CompanyDashboardClient
            companyId={companyId}
            companyName={company.name}
            workers={workers}
            equipmentCount={equipment.length}
            trainingCount={trainingCount}
          >
            <CompanyHeaderCard company={company} />
            <CompliancePanel companyId={companyId} />
            <WorkersPanel workers={workers} companyId={companyId} />
            <EquipmentPanel equipment={equipment} />
            <CompanyTrainingRequirementsPanel companyId={companyId} />
            <CompanyTrainingCompliancePanel companyId={companyId} />
            <TrainingPanel workers={workers} />
            <CredentialsPanel workers={workers} />
            <IncidentsPanel
              workerIncidents={workerIncidents}
              equipmentIncidents={equipmentIncidents}
            />
          </CompanyDashboardClient>
        </div>
        <div className="lg:col-span-1">
          <CompanyScoreSummary companyId={companyId} />
        </div>
      </div>
    </div>
  );
}
