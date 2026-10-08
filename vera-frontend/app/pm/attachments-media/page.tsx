import PmAttachmentsMediaDashboardPage from "@/src/screens/pm/attachments-media/dashboard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export default async function PmAttachmentsMediaRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmAttachmentsMediaDashboardPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
    />
  );
}
