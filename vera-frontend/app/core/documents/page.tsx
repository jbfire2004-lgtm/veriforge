import { redirect } from "next/navigation";
import { resolveSearchParams } from "@/lib/resolve-search-params";

/** Document Storage library → unified Document Archive */
export default async function CoreDocumentsRedirect({
  searchParams,
}: {
  searchParams: Promise<{
    purpose?: string;
    companyId?: string;
    projectId?: string;
    linked_project_id?: string;
  }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const q = new URLSearchParams();
  if (sp.companyId) q.set("companyId", sp.companyId);
  const project = sp.projectId ?? sp.linked_project_id;
  if (project) q.set("projectId", project);
  if (sp.purpose) {
    q.set("type", sp.purpose);
    q.set("kind", "attachment");
  }
  const qs = q.toString();
  redirect(`/pm/documents${qs ? `?${qs}` : ""}`);
}
