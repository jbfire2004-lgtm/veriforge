import { redirect } from "next/navigation";
import { resolveSearchParams } from "@/lib/resolve-search-params";

/** Completed Documents → unified Document Archive */
export default async function CompletedDocumentsRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && v) q.set(k, v);
  }
  // Map legacy completed doc filters
  if (typeof sp.completed_from === "string" && sp.completed_from) {
    q.set("dateFrom", sp.completed_from);
  }
  if (typeof sp.completed_to === "string" && sp.completed_to) {
    q.set("dateTo", sp.completed_to);
  }
  if (typeof sp.project_id === "string" && sp.project_id) {
    q.set("projectId", sp.project_id);
  }
  if (typeof sp.document_type === "string" && sp.document_type) {
    q.set("type", sp.document_type);
  }
  const qs = q.toString();
  redirect(`/pm/documents${qs ? `?${qs}` : ""}`);
}
