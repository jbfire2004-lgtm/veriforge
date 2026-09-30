import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { apiGetSafe } from "@/lib/api";
import { apiGetServer } from "@/lib/api-server";
import { EmptyState, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { VeraPageHeader } from "@/src/components/layout/VeraPageHeader";

type CompanySummary = {
  id: number;
  name: string;
  logoUrl?: string | null;
};

export default async function CompaniesPage() {
  const res = await apiGetSafe<CompanySummary[]>("/companies");

  if (!res.ok) {
    return (
      <div className="space-y-6">
        <VeraPageHeader title="Companies" description="Browse organizations and compliance status." />
        <ErrorState title="Could not load companies" description={res.error}>
          <Link href="/dashboard" className={buttonStyles({ variant: "outline", size: "md" })}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to dashboard
          </Link>
        </ErrorState>
      </div>
    );
  }

  const companies = res.data;

  if (companies.length === 0) {
    return (
      <div className="space-y-6">
        <VeraPageHeader title="Companies" description="Browse organizations and compliance status." />
        <EmptyState
          icon={Building2}
          title="No companies"
          description="Your account does not see any organizations yet, or the directory is empty."
        >
          <Link href="/admin/companies" className={buttonStyles({ variant: "teal", size: "md" })}>
            <Building2 className="h-4 w-4" aria-hidden />
            Manage in admin
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VeraPageHeader title="Companies" description="Browse organizations and compliance status." />

      <div className="space-y-3">
        {companies.map((c) => (
          <CompanyListItem key={c.id} company={c} />
        ))}
      </div>
    </div>
  );
}

async function CompanyListItem({ company }: { company: CompanySummary }) {
  let status = "UNKNOWN";
  try {
    const compliance = await apiGetServer<{ status: string }>(`/companies/${company.id}/compliance`);
    status = compliance.status;
  } catch {
    status = "UNAVAILABLE";
  }

  const badgeColor =
    status === "COMPLIANT"
      ? "bg-green-100 text-green-700"
      : status === "NON_COMPLIANT"
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-700";

  return (
    <Link
      href={`/companies/${company.id}`}
      className="block rounded bg-white p-4 shadow transition hover:bg-gray-50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {company.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt={company.name} className="h-10 w-10 rounded object-cover" />
          )}

          <span className="text-lg font-semibold">{company.name}</span>
        </div>

        <span className={`rounded px-3 py-1 text-sm font-medium ${badgeColor}`}>
          {status === "UNAVAILABLE" ? "Compliance n/a" : status}
        </span>
      </div>
    </Link>
  );
}
