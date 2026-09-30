import { redirect } from "next/navigation";
import { resolveSearchParams } from "@/lib/resolve-search-params";

/** Legacy CAPA list → unified Action Management (VeriSuite). */
export default async function PmCapaRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const q = new URLSearchParams();
  if (sp.projectId) q.set("projectId", sp.projectId);
  if (sp.companyId) q.set("companyId", sp.companyId);
  const suffix = q.toString() ? `?${q}` : "";
  redirect(`/pm/action-management${suffix}`);
}
