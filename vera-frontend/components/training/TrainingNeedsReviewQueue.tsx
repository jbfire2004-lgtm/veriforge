"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  approveIngestReview,
  fetchNeedsReviewQueue,
} from "@/lib/training-ingestion-v1";
import { rejectValidation } from "@/lib/api/training-standards";
import { unknownToErrorMessage } from "@/lib/core";
import { CoreAlert } from "@/src/components/core/CoreAlert";
import { CredentialVerificationChainPanel } from "@/src/components/credential/CredentialVerificationChainPanel";
import { buttonStyles, Card, CardContent, Badge } from "@/components/ui";
import { Button } from "@/components/ui/button";

export type NeedsReviewItem = {
  id: number;
  outcome: string;
  score?: number | null;
  details?: Record<string, unknown> | null;
  trainingRecord?: {
    id: number;
    worker?: { firstName: string; lastName: string };
    certification?: { name: string; code?: string | null };
    ingestionRun?: {
      coreFile?: { publicUrl: string | null; originalName: string } | null;
    } | null;
  } | null;
};

export type TrainingNeedsReviewQueueProps = {
  companyId: number;
  initialItems?: NeedsReviewItem[];
  /** Base path prefix for training record links (supervisor vs admin). */
  recordHrefPrefix?: string;
};

export function TrainingNeedsReviewQueue({
  companyId,
  initialItems = [],
  recordHrefPrefix = "/admin/training",
}: TrainingNeedsReviewQueueProps) {
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState<number | null>(null);
  const [expandedChain, setExpandedChain] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const rows = (await fetchNeedsReviewQueue(companyId, 50)) as NeedsReviewItem[];
      setItems(rows);
    } catch (e: unknown) {
      setError(unknownToErrorMessage(e));
    } finally {
      setRefreshing(false);
    }
  }, [companyId]);

  async function onApprove(validationId: number) {
    setBusy(validationId);
    setError(null);
    try {
      await approveIngestReview(validationId);
      await refresh();
      if (expandedChain === validationId) setExpandedChain(null);
    } catch (e: unknown) {
      setError(unknownToErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function onReject(validationId: number) {
    setBusy(validationId);
    setError(null);
    try {
      await rejectValidation(validationId, ["DOCUMENT_UNREADABLE"]);
      await refresh();
      if (expandedChain === validationId) setExpandedChain(null);
    } catch (e: unknown) {
      setError(unknownToErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={refreshing}
          onClick={() => void refresh()}
          className="min-h-[44px]"
        >
          {refreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          Refresh
        </Button>
        <span className="text-sm text-muted-foreground">
          {items.length} credential(s) need supervisor review
        </span>
      </div>

      {error ? <CoreAlert variant="error">{error}</CoreAlert> : null}

      {items.length === 0 ? (
        <Card className="border-emerald-100 bg-emerald-50/40">
          <CardContent className="flex items-center gap-3 pt-6">
            <CheckCircle2 className="h-5 w-5 text-emerald-700" aria-hidden />
            <p className="text-sm text-emerald-900">No credentials awaiting review.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => {
            const rec = item.trainingRecord;
            const worker = rec?.worker;
            const credentialId = rec?.id;
            const fileUrl = rec?.ingestionRun?.coreFile?.publicUrl;
            const chainOpen = expandedChain === item.id;
            const isBusy = busy === item.id;

            return (
              <li key={item.id}>
                <Card className="overflow-hidden border-amber-200/80 shadow-sm">
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="warning">Needs review</Badge>
                          {item.score != null ? (
                            <span className="text-xs text-muted-foreground">
                              Score {item.score}%
                            </span>
                          ) : null}
                        </div>
                        {worker ? (
                          <p className="font-medium text-[#2A2E33]">
                            {worker.firstName} {worker.lastName}
                            {rec?.certification?.name
                              ? ` · ${rec.certification.name}`
                              : ""}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Validation #{item.id}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 text-sm">
                          {credentialId ? (
                            <>
                              <Link
                                href={`${recordHrefPrefix}/${credentialId}`}
                                className="inline-flex items-center gap-1 text-[#247A78] underline underline-offset-2"
                              >
                                View record
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                              </Link>
                              <Link
                                href={`/verify/core/training/${credentialId}`}
                                className="inline-flex items-center gap-1 text-[#247A78] underline underline-offset-2"
                              >
                                Verify
                              </Link>
                            </>
                          ) : null}
                          {fileUrl ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#247A78] underline underline-offset-2"
                            >
                              Source document
                            </a>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[200px]">
                        <Button
                          type="button"
                          className="min-h-[44px] w-full"
                          disabled={isBusy}
                          onClick={() => void onApprove(item.id)}
                        >
                          {isBusy ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                          ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden />
                          )}
                          Approve
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="min-h-[44px] w-full"
                          disabled={isBusy}
                          onClick={() => void onReject(item.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" aria-hidden />
                          Reject
                        </Button>
                        {credentialId ? (
                          <Button
                            type="button"
                            variant="ghost"
                            className="min-h-[44px] w-full text-[#247A78]"
                            onClick={() =>
                              setExpandedChain(chainOpen ? null : item.id)
                            }
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" aria-hidden />
                            {chainOpen ? "Hide" : "View"} verification chain
                            {chainOpen ? (
                              <ChevronUp className="ml-auto h-4 w-4" aria-hidden />
                            ) : (
                              <ChevronDown className="ml-auto h-4 w-4" aria-hidden />
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {chainOpen && credentialId ? (
                      <CredentialVerificationChainPanel credentialId={credentialId} />
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
