import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { apiGetSafe } from "@/lib/api";
import { PmProjectWorkspace } from "@/src/components/pm/PmProjectWorkspace";

type Props = { params: Promise<{ id: string }> };

export default async function PmProjectDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login?callbackUrl=%2Fpm%2Fprojects");
  }

  const { id } = await params;
  const companiesRes = await apiGetSafe<{ id: number; name: string }[]>(
    "/companies",
    session,
  );
  const companies = companiesRes.ok ? companiesRes.data : [];

  return (
    <PmProjectWorkspace
      projectId={Number(id)}
      companies={companies}
    />
  );
}
