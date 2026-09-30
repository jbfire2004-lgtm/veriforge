import SiteAccessPage from "@/src/pages/pm/safety-management/site-access";

export default async function SiteAccessRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const sp = await searchParams;
  const projectId = parseInt(sp.projectId ?? "1", 10);
  return <SiteAccessPage projectId={projectId} />;
}
