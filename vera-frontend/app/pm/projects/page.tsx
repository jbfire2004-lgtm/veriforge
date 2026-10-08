import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { apiGetSafe } from "@/lib/api";
import { getUserCompanyContext, mergeCompaniesWithUser } from "@/lib/user-company-context";
import PmProjectsListPage from "@/src/screens/pm/projects/list";

export const metadata = {
  title: "Projects — Vera PM",
  description: "Create and manage construction projects, tasks, schedules, and assignments.",
};

export default async function PmProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent("/pm/projects")}`);
  }

  const [companiesRes, userCompany] = await Promise.all([
    apiGetSafe<{ id: number; name: string }[]>("/companies", session),
    getUserCompanyContext(session),
  ]);

  const companies = mergeCompaniesWithUser(
    companiesRes.ok ? companiesRes.data : [],
    userCompany,
  );
  const defaultCompanyId =
    userCompany.companyId ??
    (companies.length === 1 ? companies[0]!.id : undefined);

  return (
    <PmProjectsListPage
      companies={companies}
      defaultCompanyId={defaultCompanyId}
      lockCompany={userCompany.lockCompany}
    />
  );
}
