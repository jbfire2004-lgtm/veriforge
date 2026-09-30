import Link from "next/link";
import { canAccessCoreTools } from "@/lib/phase1-roles";
import { requireRouteAccess } from "@/lib/route-access";
import { API_URL } from "@/lib/api-fetch";
import { apiGetSafe } from "@/lib/api";
import { getUserCompanyContext, mergeCompaniesWithUser } from "@/lib/user-company-context";
import { TrainingIngestPipeline } from "@/src/components/core/TrainingIngestPipeline";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CoreAlert } from "@/src/components/core/CoreAlert";
import { VeraPageLayout } from "@/src/components/navigation";

export default async function CoreTrainingIngestPage() {
  const { session } = await requireRouteAccess({
    callbackUrl: "/core/training-ingest",
    guard: canAccessCoreTools,
  });

  const [companiesRes, userCompany] = await Promise.all([
    apiGetSafe<{ id: number; name: string }[]>("/companies", session),
    getUserCompanyContext(session),
  ]);
  const companies = mergeCompaniesWithUser(
    companiesRes.ok ? companiesRes.data : [],
    userCompany,
  );
  const defaultCompanyId =
    userCompany.companyId ??
    (companies.length === 1 ? companies[0]!.id : undefined);
  const showDirectoryWarning = !companiesRes.ok && companies.length === 0;

  const visionRes = await apiGetSafe<{
    ocrEnabled: boolean;
    llmEnabled: boolean;
    externalOcrConfigured: boolean;
    recommendedMode: string;
    messages: string[];
  }>("/vision/capabilities", session);

  return (
    <VeraPageLayout
      title="Training ingestion"
      description={
        <>
          Upload training evidence into Document Storage (
          <code className="rounded bg-slate-100 px-1 text-xs">
            training_ingestion
          </code>
          ), auto-verify expiry when OCR confidence is high, and link verified
          certificates to competency profiles.
        </>
      }
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            href="/pm/documents?type=training_ingestion&kind=attachment"
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
          >
            Document Archive
          </Link>
          <Link
            href="/core/verification"
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
          >
            Verification queue
          </Link>
          <Link
            href="/core/training-competency"
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
          >
            Competency profiles
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        <Card className="border-[#2A2E33]/10">
          <CardHeader>
            <CardTitle className="text-base">Evidence pipeline</CardTitle>
            <CardDescription>
              1) Upload certificate evidence → CoreFile in Document Storage · 2)
              OCR extracts issued/expiry dates · 3) High-confidence + valid expiry
              auto-verifies · 4) Competency checks accept verified TrainingRecords
            </CardDescription>
          </CardHeader>
        </Card>

        {visionRes.ok ? (
          <Card className="border-[#2A2E33]/10">
            <CardHeader>
              <CardTitle className="text-base">Vision / OCR status</CardTitle>
              <CardDescription>
                Mode: <strong>{visionRes.data.recommendedMode}</strong> — OCR{" "}
                {visionRes.data.ocrEnabled ? "on" : "off"}, LLM{" "}
                {visionRes.data.llmEnabled ? "configured" : "not configured"}
                {visionRes.data.externalOcrConfigured
                  ? ", external OCR service linked"
                  : ""}
                .
              </CardDescription>
            </CardHeader>
            {visionRes.data.messages.length ? (
              <CardContent className="text-sm text-vera-muted">
                <ul className="list-disc pl-5">
                  {visionRes.data.messages.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </CardContent>
            ) : null}
          </Card>
        ) : null}

        <Card className="overflow-hidden rounded-2xl border-[#2A2E33]/10 shadow-md">
          <CardHeader>
            <CardTitle>Upload training evidence</CardTitle>
            <CardDescription>
              PDF, PNG, JPG, or JSON →{" "}
              <code className="text-xs">
                POST /api/v1/training-ingestion/upload
              </code>
              . Creates a{" "}
              <code className="text-xs">TrainingIngestionRun</code> and training
              records. API base: <code className="text-xs">{API_URL}</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {showDirectoryWarning ? (
              <CoreAlert variant="warning">
                Could not load the company directory ({companiesRes.error}). You
                can still enter a company ID below, or manage companies under{" "}
                <Link href="/admin/companies" className="font-medium underline">
                  Admin → Companies
                </Link>
                .
              </CoreAlert>
            ) : !companiesRes.ok ? (
              <CoreAlert variant="warning">
                Company directory unavailable ({companiesRes.error}). Your
                organization is pre-selected below.
              </CoreAlert>
            ) : null}
            <TrainingIngestPipeline
              companies={companies}
              defaultCompanyId={defaultCompanyId}
              lockCompany={userCompany.lockCompany}
            />
          </CardContent>
        </Card>
      </div>
    </VeraPageLayout>
  );
}
