"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  completeTrainingVerification,
  fetchTrainingRecordVerification,
  fetchTrainingVerificationSnapshot,
  type TrainingRecordVerificationResult,
  type TrainingVerificationSnapshot,
} from "@/src/api/core-verification";
import {
  catchToMessage,
  parseOptionalPositiveInt,
  unknownToErrorMessage,
} from "@/lib/core";
import { CoreAlert } from "@/src/components/core/CoreAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState, VerificationFlowSkeleton } from "@/components/ui";
import {
  CheckStatusBadge,
  VerificationOverallBanner,
} from "@/src/components/core/verification/CoreVerificationBadges";

function buildPublicVerifyHref(
  recordIdStr: string,
  ew: string,
  eco: string,
  et: string,
  ec: string,
  ep: string
): string | null {
  const id = parseOptionalPositiveInt(recordIdStr);
  if (id == null) return null;
  const q = new URLSearchParams();
  if (ew.trim()) q.set("expectedWorkerId", ew.trim());
  if (eco.trim()) q.set("expectedCompanyId", eco.trim());
  if (et.trim()) q.set("expectedTrainingType", et.trim());
  if (ec.trim()) q.set("expectedCertificateNumber", ec.trim());
  if (ep.trim()) q.set("expectedProvider", ep.trim());
  const qs = q.toString();
  return `/verify/core/training/${id}${qs ? `?${qs}` : ""}`;
}

export function TrainingRecordVerificationView() {
  const searchParams = useSearchParams();
  const querySerialized = searchParams?.toString() ?? "";

  const [recordId, setRecordId] = useState("");
  const [expectedWorkerId, setExpectedWorkerId] = useState("");
  const [expectedCompanyId, setExpectedCompanyId] = useState("");
  const [expectedTrainingType, setExpectedTrainingType] = useState("");
  const [expectedCertificateNumber, setExpectedCertificateNumber] =
    useState("");
  const [expectedProvider, setExpectedProvider] = useState("");
  const [relatedRecordIdsFromQuery, setRelatedRecordIdsFromQuery] = useState<
    number[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrainingRecordVerificationResult | null>(
    null
  );
  const [completeBusy, setCompleteBusy] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completeOk, setCompleteOk] = useState(false);
  const [snapshot, setSnapshot] = useState<TrainingVerificationSnapshot | null>(null);

  const publicVerifyHref = useMemo(
    () =>
      buildPublicVerifyHref(
        recordId,
        expectedWorkerId,
        expectedCompanyId,
        expectedTrainingType,
        expectedCertificateNumber,
        expectedProvider
      ),
    [
      recordId,
      expectedWorkerId,
      expectedCompanyId,
      expectedTrainingType,
      expectedCertificateNumber,
      expectedProvider,
    ]
  );

  const loadSnapshot = useCallback(async (id: number) => {
    try {
      const snap = await fetchTrainingVerificationSnapshot(id);
      setSnapshot(snap);
    } catch {
      setSnapshot(null);
    }
  }, []);

  useEffect(() => {
    setCompleteOk(false);
    setCompleteError(null);
    setSnapshot(null);
  }, [recordId]);

  useEffect(() => {
    const params = new URLSearchParams(querySerialized);
    const tid = params.get("trainingRecordId");
    if (tid && /^\d+$/.test(tid)) {
      setRecordId(tid);
    }
    const related = params.get("relatedRecordIds");
    if (related?.trim()) {
      const parsed = related
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n) && n > 0);
      setRelatedRecordIdsFromQuery(parsed);
    } else {
      setRelatedRecordIdsFromQuery([]);
    }
    const ew = params.get("expectedWorkerId");
    if (ew != null) setExpectedWorkerId(ew);
    const eco = params.get("expectedCompanyId");
    if (eco != null) setExpectedCompanyId(eco);
    const et = params.get("expectedTrainingType");
    if (et != null) setExpectedTrainingType(et);
    const ecn = params.get("expectedCertificateNumber");
    if (ecn != null) setExpectedCertificateNumber(ecn);
    const ep = params.get("expectedProvider");
    if (ep != null) setExpectedProvider(ep);
  }, [querySerialized]);

  const markComplete = useCallback(async () => {
    const id = parseOptionalPositiveInt(recordId);
    if (id == null) {
      setCompleteError("Enter a valid training record ID first.");
      return;
    }
    setCompleteBusy(true);
    setCompleteError(null);
    try {
      await completeTrainingVerification(id);
      setCompleteOk(true);
      await loadSnapshot(id);
    } catch (e: unknown) {
      setCompleteError(unknownToErrorMessage(e, "Could not mark complete"));
    } finally {
      setCompleteBusy(false);
    }
  }, [recordId, loadSnapshot]);

  const run = useCallback(async () => {
    const id = parseOptionalPositiveInt(recordId);
    if (id == null) {
      setError("Enter a valid training record ID.");
      return;
    }
    let expected: number | undefined;
    if (expectedWorkerId.trim() !== "") {
      const w = parseOptionalPositiveInt(expectedWorkerId);
      if (w == null) {
        setError("Expected worker ID must be a positive integer.");
        return;
      }
      expected = w;
    }

    let expectedCo: number | undefined;
    if (expectedCompanyId.trim() !== "") {
      const c = parseOptionalPositiveInt(expectedCompanyId);
      if (c == null) {
        setError("Expected company ID must be a positive integer.");
        return;
      }
      expectedCo = c;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCompleteOk(false);
    setCompleteError(null);

    const outcome = await catchToMessage(() =>
      fetchTrainingRecordVerification(id, {
        expectedWorkerId: expected,
        expectedCompanyId: expectedCo,
        expectedTrainingType:
          expectedTrainingType.trim() !== ""
            ? expectedTrainingType.trim()
            : undefined,
        expectedCertificateNumber:
          expectedCertificateNumber.trim() !== ""
            ? expectedCertificateNumber.trim()
            : undefined,
        expectedProvider:
          expectedProvider.trim() !== ""
            ? expectedProvider.trim()
            : undefined,
      })
    );

    setLoading(false);

    if (outcome.ok) {
      setResult(outcome.value);
      void loadSnapshot(id);
    } else {
      setError(outcome.message);
    }
  }, [
    recordId,
    expectedWorkerId,
    expectedCompanyId,
    expectedTrainingType,
    expectedCertificateNumber,
    expectedProvider,
    loadSnapshot,
  ]);

  return (
    <div className="space-y-6">
      {relatedRecordIdsFromQuery.length > 0 && (
        <div
          className="rounded-lg border border-indigo-200 bg-indigo-50/90 px-4 py-3 text-sm text-indigo-950"
          role="status"
        >
          <p className="font-medium">Other records from this ingest</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-indigo-900">
            {relatedRecordIdsFromQuery.map((rid) => (
              <li key={rid}>
                <button
                  type="button"
                  className="font-mono text-indigo-800 underline underline-offset-2 hover:text-indigo-950"
                  onClick={() => {
                    setRecordId(String(rid));
                    setResult(null);
                    setCompleteOk(false);
                    setCompleteError(null);
                  }}
                >
                  Load record #{rid} in the form
                </button>
                {" · "}
                <Link
                  href={`/verify/core/training/${rid}`}
                  className="text-indigo-800 underline underline-offset-2"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open public verify page
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="tr-id">Training record ID</Label>
          <Input
            id="tr-id"
            inputMode="numeric"
            placeholder="e.g. 42"
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="exp-worker">Expected worker ID (optional)</Label>
          <Input
            id="exp-worker"
            inputMode="numeric"
            placeholder="Cross-check worker"
            value={expectedWorkerId}
            onChange={(e) => setExpectedWorkerId(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="exp-company">Expected company ID (optional)</Label>
          <Input
            id="exp-company"
            inputMode="numeric"
            placeholder="Cross-check employer / tenant"
            value={expectedCompanyId}
            onChange={(e) => setExpectedCompanyId(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="exp-type">Expected training type (optional)</Label>
          <Input
            id="exp-type"
            placeholder="Certification code or name (must match linked cert)"
            value={expectedTrainingType}
            onChange={(e) => setExpectedTrainingType(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="exp-cert">Expected certificate number (optional)</Label>
          <Input
            id="exp-cert"
            placeholder="Must match value stored on the record"
            value={expectedCertificateNumber}
            onChange={(e) => setExpectedCertificateNumber(e.target.value)}
            disabled={loading}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="exp-provider">Expected provider (optional)</Label>
          <Input
            id="exp-provider"
            placeholder="Provider name to match against linked record provider"
            value={expectedProvider}
            onChange={(e) => setExpectedProvider(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <Button type="button" disabled={loading} onClick={() => void run()}>
        {loading ? "Verifying…" : "Run verification"}
      </Button>

      {publicVerifyHref && (
        <p className="text-xs text-slate-600">
          <Link
            href={publicVerifyHref}
            className="font-medium text-indigo-700 underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            Open kiosk-style verify page
          </Link>{" "}
          (uses the IDs and optional fields above as query params).
        </p>
      )}

      {error && (
        <ErrorState title="Verification failed" description={error} className="mt-vera-4 text-left" />
      )}

      {loading && !result && <VerificationFlowSkeleton className="mt-vera-4" />}

      {result && (
        <div className="space-y-6 border-t border-slate-200 pt-6">
          <VerificationOverallBanner status={result.overallStatus} />

          {snapshot ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-medium text-slate-900">Credential &amp; blockchain</p>
              <dl className="mt-2 grid gap-1 text-slate-600">
                <div>
                  <dt className="inline font-medium">Persisted status: </dt>
                  <dd className="inline">
                    {snapshot.lastVerificationStatus ?? "—"}
                    {snapshot.verifiedAt
                      ? ` · ${new Date(snapshot.verifiedAt).toLocaleString()}`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-medium">NFT: </dt>
                  <dd className="inline">
                    {snapshot.credentialNft
                      ? `${snapshot.credentialNft.mintStatus}${snapshot.credentialNft.nftTokenId ? ` · token ${snapshot.credentialNft.nftTokenId}` : ""}`
                      : "Not minted"}
                  </dd>
                </div>
                {snapshot.latestMintJob ? (
                  <div>
                    <dt className="inline font-medium">Mint job: </dt>
                    <dd className="inline">
                      {snapshot.latestMintJob.status}
                      {snapshot.latestMintJob.lastError
                        ? ` — ${snapshot.latestMintJob.lastError}`
                        : ""}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}

          <p className="text-xs text-slate-500">
            Record #{result.trainingRecordId} ·{" "}
            {new Date(result.verifiedAt).toLocaleString()}
          </p>

          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
            <p className="font-medium text-slate-900">
              {result.certification.name}
              {result.certification.code && (
                <span className="ml-2 font-normal text-slate-600">
                  ({result.certification.code})
                </span>
              )}
            </p>
            <p className="mt-1 text-slate-600">
              Worker: {result.worker.firstName} {result.worker.lastName} · #
              {result.worker.id}
              {result.worker.companyName
                ? ` · ${result.worker.companyName}`
                : ""}
              {result.worker.companyId != null
                ? ` · employer #${result.worker.companyId}`
                : ""}
            </p>
          </div>

          <CheckTable checks={result.checks} />

          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-800">Summary</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
              {result.summary.map((line, i) => (
                <li key={i} className="font-mono text-xs">
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-medium text-slate-800">
              Complete attestation
            </h3>
            <p className="text-xs text-slate-600">
              Writes the same audit row as{" "}
              <code className="rounded bg-slate-100 px-1 text-xs">
                POST /api/v1/core/verification/training/:id/complete
              </code>
              .
            </p>
            <Button
              type="button"
              variant="secondary"
              disabled={
                completeBusy ||
                completeOk ||
                loading ||
                result.overallStatus === "INVALID" ||
                result.checks.completionState.alreadyCompleted
              }
              onClick={() => void markComplete()}
            >
              {completeOk
                ? "Marked complete"
                : completeBusy
                  ? "Saving…"
                  : "Mark verification complete"}
            </Button>
            {result.overallStatus === "INVALID" && (
              <p className="text-xs text-amber-800">
                Resolve failing checks before completing, unless your policy
                allows an override elsewhere.
              </p>
            )}
            {result.checks.completionState.alreadyCompleted && (
              <p className="text-xs text-slate-600">
                This record is already marked complete; use another record or
                clear completion in admin if your policy allows.
              </p>
            )}
            {completeError && <CoreAlert>{completeError}</CoreAlert>}
            {completeOk && (
              <CoreAlert variant="success">
                Attestation recorded. You can run verification again or close
                this page.
              </CoreAlert>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckTable({
  checks,
}: {
  checks: TrainingRecordVerificationResult["checks"];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-3 py-2 font-medium">Check</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Detail</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-100">
            <td className="px-3 py-2 font-medium text-slate-800">
              Expiry &amp; dates
            </td>
            <td className="px-3 py-2 align-top">
              <CheckStatusBadge status={checks.expiry.status} />
            </td>
            <td className="px-3 py-2 text-slate-600">
              <p>{checks.expiry.message}</p>
              <p className="mt-1 text-xs text-slate-500">
                Issued {new Date(checks.expiry.issuedAt).toLocaleDateString()}
                {checks.expiry.expiresAt
                  ? ` · Expires ${new Date(checks.expiry.expiresAt).toLocaleDateString()}`
                  : ""}
                {checks.expiry.daysUntilExpiry != null
                  ? ` (${checks.expiry.daysUntilExpiry} days)`
                  : ""}
              </p>
            </td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="px-3 py-2 font-medium text-slate-800">Provider</td>
            <td className="px-3 py-2 align-top">
              <CheckStatusBadge status={checks.provider.status} />
            </td>
            <td className="px-3 py-2 text-slate-600">
              <p>{checks.provider.message}</p>
              {(checks.provider.providerName || checks.provider.providerId) && (
                <p className="mt-1 text-xs text-slate-500">
                  {checks.provider.providerName ?? `ID ${checks.provider.providerId}`}
                </p>
              )}
            </td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="px-3 py-2 font-medium text-slate-800">
              Expected provider
            </td>
            <td className="px-3 py-2 align-top">
              <CheckStatusBadge status={checks.expectedProvider.status} />
            </td>
            <td className="px-3 py-2 text-slate-600">
              <p>{checks.expectedProvider.message}</p>
              {(checks.expectedProvider.recordProviderName ||
                checks.expectedProvider.recordProviderId != null) && (
                <p className="mt-1 text-xs text-slate-500">
                  {checks.expectedProvider.recordProviderName ??
                    `ID ${checks.expectedProvider.recordProviderId}`}
                </p>
              )}
            </td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="px-3 py-2 font-medium text-slate-800">
              Worker identity
            </td>
            <td className="px-3 py-2 align-top">
              <CheckStatusBadge status={checks.workerIdentity.status} />
            </td>
            <td className="px-3 py-2 text-slate-600">
              <p>{checks.workerIdentity.message}</p>
              <p className="mt-1 text-xs text-slate-500">
                {checks.workerIdentity.workerName} ·{" "}
                {checks.workerIdentity.workerStatus}
                {checks.workerIdentity.companyName
                  ? ` · ${checks.workerIdentity.companyName}`
                  : ""}
              </p>
            </td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="px-3 py-2 font-medium text-slate-800">
              Expected company
            </td>
            <td className="px-3 py-2 align-top">
              <CheckStatusBadge status={checks.expectedCompany.status} />
            </td>
            <td className="px-3 py-2 text-slate-600">
              <p>{checks.expectedCompany.message}</p>
              {(checks.expectedCompany.recordCompanyId != null ||
                checks.expectedCompany.expectedCompanyId != null) && (
                <p className="mt-1 text-xs text-slate-500">
                  On file: employer #
                  {checks.expectedCompany.recordCompanyId ?? "—"}
                  {checks.expectedCompany.expectedCompanyId != null
                    ? ` · expected #${checks.expectedCompany.expectedCompanyId}`
                    : ""}
                </p>
              )}
            </td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="px-3 py-2 font-medium text-slate-800">
              Training type
            </td>
            <td className="px-3 py-2 align-top">
              <CheckStatusBadge status={checks.trainingType.status} />
            </td>
            <td className="px-3 py-2 text-slate-600">
              <p>{checks.trainingType.message}</p>
              <p className="mt-1 text-xs text-slate-500">
                On file: {checks.trainingType.recordName}
                {checks.trainingType.recordCode
                  ? ` (${checks.trainingType.recordCode})`
                  : ""}
              </p>
            </td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="px-3 py-2 font-medium text-slate-800">
              Certificate number
            </td>
            <td className="px-3 py-2 align-top">
              <CheckStatusBadge status={checks.certificateNumber.status} />
            </td>
            <td className="px-3 py-2 text-slate-600">
              <p>{checks.certificateNumber.message}</p>
              <p className="mt-1 text-xs text-slate-500">
                On file:{" "}
                {checks.certificateNumber.hasCertificateNumber ? "Yes" : "No"}
              </p>
            </td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="px-3 py-2 font-medium text-slate-800">
              Credential coverage
            </td>
            <td className="px-3 py-2 align-top">
              <CheckStatusBadge status={checks.credentialCoverage.status} />
            </td>
            <td className="px-3 py-2 text-slate-600">
              <p>{checks.credentialCoverage.message}</p>
              <p className="mt-1 text-xs text-slate-500">
                Matching rows: {checks.credentialCoverage.matchingCredentialCount}{" "}
                · Valid (non-expired):{" "}
                {checks.credentialCoverage.validCredentialCount}
              </p>
            </td>
          </tr>
          <tr className="border-b border-slate-100 last:border-0">
            <td className="px-3 py-2 font-medium text-slate-800">
              Completion state
            </td>
            <td className="px-3 py-2 align-top">
              <CheckStatusBadge status={checks.completionState.status} />
            </td>
            <td className="px-3 py-2 text-slate-600">
              <p>{checks.completionState.message}</p>
              {checks.completionState.completedAt && (
                <p className="mt-1 text-xs text-slate-500">
                  Completed{" "}
                  {new Date(
                    checks.completionState.completedAt
                  ).toLocaleString()}
                </p>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
