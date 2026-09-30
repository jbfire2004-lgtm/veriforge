import { redirect } from "next/navigation";

import { resolveSearchParams } from "@/lib/resolve-search-params";



/** Legacy /new route — default to FLHA (point-of-work form). */

export default async function JhaFlhaNewRoute({

  searchParams,

}: {

  searchParams: Promise<{ projectId?: string; companyId?: string; kind?: string }>;

}) {

  const sp = await resolveSearchParams(searchParams);

  const kind = sp.kind?.toUpperCase() === "JHA" ? "jha" : "flha";

  const q = new URLSearchParams();

  if (sp.projectId) q.set("projectId", sp.projectId);

  if (sp.companyId) q.set("companyId", sp.companyId);

  const qs = q.toString();

  redirect(`/pm/jha-flha/new/${kind}${qs ? `?${qs}` : ""}`);

}

