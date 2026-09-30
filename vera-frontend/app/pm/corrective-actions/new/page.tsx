import { redirect } from "next/navigation";
import { resolveSearchParams } from "@/lib/resolve-search-params";

/** Legacy create → Action Management workflow create. */
export default async function PmCapaNewRoute({
  searchParams,
}: {
  searchParams: Promise<{
    projectId?: string;
    companyId?: string;
    kind?: string;
  }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const q = new URLSearchParams({ tab: "workflow", create: "1" });
  if (sp.projectId) q.set("projectId", sp.projectId);
  if (sp.companyId) q.set("companyId", sp.companyId);
  if (sp.kind === "preventive" || sp.kind === "corrective") {
    q.set("kind", sp.kind);
  }
  redirect(`/pm/action-management?${q}`);
}
