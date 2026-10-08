import PmDocumentsDashboardPage from "@/src/screens/pm/documents/dashboard";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export const metadata = {
  title: "SDS & Document Control — VeriPM",
  description:
    "SDS library, chemical inventory, policies, acknowledgments, and document control.",
};

/** Former /pm/documents SDS surface — kept distinct from Document Archive. */
export default async function SdsDocumentControlRoute({
  searchParams,
}: {
  searchParams: Promise<{
    projectId?: string;
    companyId?: string;
    workerId?: string;
  }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <PmDocumentsDashboardPage
      projectId={parseInt(sp.projectId ?? "1", 10)}
      companyId={parseInt(sp.companyId ?? "1", 10)}
      workerId={parseInt(sp.workerId ?? "1", 10)}
    />
  );
}
