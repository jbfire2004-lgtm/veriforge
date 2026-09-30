"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  VerificationOverallBanner,
  VerificationStatusBadge,
} from "@/app/components/verification/VerificationStatusBadge";
import type { VerificationCheckStatus } from "@/src/api/core-verification";
import { completeTrainingVerification } from "@/src/api/core-verification";
import { useTrainingRecordVerification } from "@/src/hooks/useTrainingRecordVerification";
import { unknownToErrorMessage } from "@/lib/core";
import { ErrorState, VerificationFlowSkeleton } from "@/components/ui";
import { CredentialVerificationChainPanel } from "@/src/components/credential/CredentialVerificationChainPanel";

function CheckRow({
  title,
  status,
  body,
}: {
  title: string;
  status: VerificationCheckStatus;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <VerificationStatusBadge status={status} />
      </div>
      <div className="text-sm text-gray-600">{body}</div>
    </div>
  );
}

export function CoreTrainingVerificationContent({ id }: { id: string }) {
  const search = useSearchParams();
  const searchSerialized = search?.toString() ?? "";
  const recordId = Number.parseInt(id, 10);
  const [completeBusy, setCompleteBusy] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completeOk, setCompleteOk] = useState(false);
  const { data, error, loading, refetch: load } = useTrainingRecordVerification(
    recordId,
    searchSerialized
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <VerificationFlowSkeleton />
        <p className="mt-vera-4 text-center text-sm text-gray-500">Verifying training record…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl space-y-vera-4 p-6">
        <ErrorState
          title="Could not load verification"
          description={
            error ??
            "Record not found, the ID may be invalid, or the API could not be reached. Check the training record id and try again."
          }
        >
          <button type="button" onClick={() => void load()} className="text-sm font-semibold text-vera-deep underline">
            Retry
          </button>
        </ErrorState>
      </div>
    );
  }

  const { checks } = data;

  async function markComplete() {
    if (!data) return;
    setCompleteError(null);
    setCompleteBusy(true);
    try {
      await completeTrainingVerification(data.trainingRecordId);
      setCompleteOk(true);
    } catch (e: unknown) {
      setCompleteError(unknownToErrorMessage(e, "Could not mark complete"));
    } finally {
      setCompleteBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <VerificationOverallBanner status={data.overallStatus} />

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="text-lg font-bold text-gray-900">
          {data.certification.name}
        </h2>
        {data.certification.code && (
          <p className="text-sm text-gray-600">Code: {data.certification.code}</p>
        )}
        <p className="mt-2 text-gray-800">
          {data.worker.firstName} {data.worker.lastName}
        </p>
        <p className="text-xs text-gray-500">Record ID: {data.trainingRecordId}</p>
      </div>

      <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-vera-deep">Verification chain</h3>
        <p className="mb-3 text-xs text-gray-600">
          Credential → training (this page) → worker → company. Use the links below to move along the trail.
        </p>
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <Link className="font-medium text-blue-700 underline" href="/verify/credential">
              Credential lookup
            </Link>
          </li>
          <li>
            <Link className="font-medium text-blue-700 underline" href={`/verify/${data.worker.id}`}>
              Worker wallet
            </Link>
          </li>
          {data.worker.companyId != null && (
            <li>
              <Link className="font-medium text-blue-700 underline" href={`/companies/${data.worker.companyId}`}>
                Company
              </Link>
            </li>
          )}
          <li>
            <Link
              className="font-medium text-blue-700 underline"
              href={`/admin/training/${data.trainingRecordId}`}
            >
              Admin training record
            </Link>
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <CheckRow
          title="Expiry"
          status={checks.expiry.status}
          body={
            <>
              <p>{checks.expiry.message}</p>
              <p className="mt-1 text-xs text-gray-500">
                Issued:{" "}
                {new Date(checks.expiry.issuedAt).toLocaleDateString()}
              </p>
              {checks.expiry.expiresAt && (
                <p className="mt-1">
                  Expires:{" "}
                  <span className="font-medium text-gray-800">
                    {new Date(checks.expiry.expiresAt).toLocaleDateString()}
                  </span>
                  {checks.expiry.daysUntilExpiry != null && (
                    <span className="text-gray-500">
                      {" "}
                      ({checks.expiry.daysUntilExpiry} days)
                    </span>
                  )}
                </p>
              )}
            </>
          }
        />

        <CheckRow
          title="Provider"
          status={checks.provider.status}
          body={
            <>
              <p>{checks.provider.message}</p>
              {checks.provider.providerId != null && (
                <p className="mt-1 text-xs text-gray-500">
                  Provider ID: {checks.provider.providerId}
                </p>
              )}
              {checks.provider.providerName && (
                <p className="mt-1 font-medium text-gray-800">
                  {checks.provider.providerName}
                </p>
              )}
            </>
          }
        />

        <CheckRow
          title="Expected provider"
          status={checks.expectedProvider.status}
          body={
            <>
              <p>{checks.expectedProvider.message}</p>
              {checks.expectedProvider.recordProviderId != null && (
                <p className="mt-1 text-xs text-gray-500">
                  Provider ID: {checks.expectedProvider.recordProviderId}
                </p>
              )}
              {checks.expectedProvider.recordProviderName && (
                <p className="mt-1 font-medium text-gray-800">
                  {checks.expectedProvider.recordProviderName}
                </p>
              )}
              {checks.expectedProvider.expectedProviderName && (
                <p className="mt-1 text-xs text-gray-500">
                  Expected (query): {checks.expectedProvider.expectedProviderName}
                </p>
              )}
            </>
          }
        />

        <CheckRow
          title="Worker identity"
          status={checks.workerIdentity.status}
          body={
            <>
              <p>{checks.workerIdentity.message}</p>
              <p className="mt-1 text-xs text-gray-500">
                Worker #{checks.workerIdentity.workerId} · Status:{" "}
                {checks.workerIdentity.workerStatus}
              </p>
              {checks.workerIdentity.companyName && (
                <p className="mt-1 text-gray-800">
                  Company: {checks.workerIdentity.companyName}
                </p>
              )}
            </>
          }
        />

        {"expectedCompany" in checks && checks.expectedCompany != null && (
          <CheckRow
            title="Expected company"
            status={checks.expectedCompany.status}
            body={<p>{checks.expectedCompany.message}</p>}
          />
        )}

        {"credentialCoverage" in checks && checks.credentialCoverage != null && (
          <CheckRow
            title="Credential coverage"
            status={checks.credentialCoverage.status}
            body={
              <>
                <p>{checks.credentialCoverage.message}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Matching credentials on file: {checks.credentialCoverage.matchingCredentialCount} · Valid:{" "}
                  {checks.credentialCoverage.validCredentialCount}
                </p>
              </>
            }
          />
        )}

        {"completionState" in checks && checks.completionState != null && (
          <CheckRow
            title="Completion state"
            status={checks.completionState.status}
            body={
              <>
                <p>{checks.completionState.message}</p>
                {checks.completionState.completedAt != null && (
                  <p className="mt-1 text-xs text-gray-500">
                    Completed at: {new Date(checks.completionState.completedAt).toLocaleString()}
                  </p>
                )}
              </>
            }
          />
        )}

        <CheckRow
          title="Training type"
          status={checks.trainingType.status}
          body={
            <>
              <p>{checks.trainingType.message}</p>
              <p className="mt-1 text-xs text-gray-500">
                On file: {checks.trainingType.recordName}
                {checks.trainingType.recordCode
                  ? ` · Code ${checks.trainingType.recordCode}`
                  : ""}
              </p>
              {checks.trainingType.expectedTrainingType && (
                <p className="mt-1 text-xs text-gray-500">
                  Expected (query): {checks.trainingType.expectedTrainingType}
                </p>
              )}
            </>
          }
        />

        <CheckRow
          title="Certificate number"
          status={checks.certificateNumber.status}
          body={
            <>
              <p>{checks.certificateNumber.message}</p>
              <p className="mt-1 text-xs text-gray-500">
                Stored:{" "}
                {checks.certificateNumber.hasCertificateNumber ? "Yes" : "No"}
              </p>
              {checks.certificateNumber.expectedCertificateNumber && (
                <p className="mt-1 text-xs text-gray-500">
                  Expected (query) is set
                </p>
              )}
            </>
          }
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-2 font-semibold text-gray-900">Summary</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          {data.summary.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-2 font-semibold text-gray-900">Completion</h3>
        <p className="mb-3 text-sm text-gray-600">
          Mark this verification as completed to write an attestation audit row.
        </p>
        <button
          type="button"
          onClick={() => void markComplete()}
          disabled={completeBusy || completeOk}
          className="rounded bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60"
        >
          {completeOk
            ? "Marked complete"
            : completeBusy
              ? "Saving..."
              : "Mark verification complete"}
        </button>
        {completeError && (
          <p className="mt-2 text-sm text-red-600">{completeError}</p>
        )}
        {completeOk && (
          <p className="mt-2 text-sm text-emerald-700">
            Verification completed.{" "}
            <Link href="/pm/safety/assess" className="underline">
              Continue to PM safety assessment
            </Link>
            {" · "}
            <Link href="/core/verification" className="underline">
              Back to verification hub
            </Link>
          </p>
        )}
      </div>

      <CredentialVerificationChainPanel credentialId={data.trainingRecordId} />

      <p className="text-center text-xs text-gray-400">
        Verified at {new Date(data.verifiedAt).toLocaleString()}
      </p>
    </div>
  );
}
