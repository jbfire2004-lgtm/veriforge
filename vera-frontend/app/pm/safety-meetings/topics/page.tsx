import { redirect } from "next/navigation";
import { resolveSearchParams } from "@/lib/resolve-search-params";

/** Topic library lives on the Safety Meetings hub (library tab). */
export default async function SafetyMeetingTopicsRedirect({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const q = new URLSearchParams();
  if (sp.projectId) q.set("projectId", sp.projectId);
  if (sp.companyId) q.set("companyId", sp.companyId);
  q.set("tab", "library");
  redirect(`/pm/safety-meetings?${q}`);
}
