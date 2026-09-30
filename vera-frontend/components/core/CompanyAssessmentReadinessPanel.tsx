"use client";

import { useCallback, useEffect, useState } from "react";
import {
  downloadAssessmentPdf,
  getCompanySpceHistory,
  getLatestCompanySmartGap,
  getLatestCompanySpce,
  runCompanySmartGapAnalysis,
  runCompanySpceAssessment,
  smartGapPdfUrl,
  spcePdfUrl,
  type CompanyAssessmentSummary,
  type SgaeAssessmentResult,
  type SpceAssessmentResult,
} from "@/lib/assessment-engines";
import {
  assessmentHistoryToTrend,
  parseSmartGapAssessmentResult,
  parseSpceAssessmentResult,
  type AssessmentTrendPoint,
} from "@/lib/assessment-readiness-display";
import { SpceAssessmentDetail } from "@/components/core/SpceAssessmentDetail";
import { SmartGapAssessmentDetail } from "@/components/core/SmartGapAssessmentDetail";
import { Button } from "@/components/ui/button";

type LoadedAssessment<T> = {
  summary: CompanyAssessmentSummary;
  result: T;
};

export function CompanyAssessmentReadinessPanel({
  companyId,
  spce: spceSummary,
  smartGap: smartGapSummary,
}: {
  companyId?: number | null;
  spce: CompanyAssessmentSummary | null;
  smartGap: CompanyAssessmentSummary | null;
}) {
  const [spceLoaded, setSpceLoaded] = useState<LoadedAssessment<SpceAssessmentResult> | null>(
    null,
  );
  const [sgaLoaded, setSgaLoaded] = useState<LoadedAssessment<SgaeAssessmentResult> | null>(
    null,
  );
  const [spceTrend, setSpceTrend] = useState<AssessmentTrendPoint[]>([]);
  const [busy, setBusy] = useState<"spce" | "sga" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshLatest = useCallback(async (cid: number) => {
    const [spceLatest, sgaLatest, spceHistory] = await Promise.all([
      getLatestCompanySpce(cid).catch(() => null),
      getLatestCompanySmartGap(cid).catch(() => null),
      getCompanySpceHistory(cid).catch(() => []),
    ]);

    setSpceTrend(assessmentHistoryToTrend(spceHistory));

    const spceResult = spceLatest
      ? parseSpceAssessmentResult(spceLatest.resultJson)
      : null;
    setSpceLoaded(
      spceLatest && spceResult
        ? {
            summary: {
              overallScore: spceLatest.overallScore,
              overallStatus: spceLatest.overallStatus,
              evaluatedAt: spceLatest.evaluatedAt,
            },
            result: spceResult,
          }
        : null,
    );

    const sgaResult = sgaLatest
      ? parseSmartGapAssessmentResult(sgaLatest.resultJson)
      : null;
    setSgaLoaded(
      sgaLatest && sgaResult
        ? {
            summary: {
              overallScore: sgaLatest.overallScore,
              overallStatus: sgaLatest.overallStatus,
              evaluatedAt: sgaLatest.evaluatedAt,
            },
            result: sgaResult,
          }
        : null,
    );
  }, []);

  useEffect(() => {
    if (companyId == null || companyId <= 0) {
      setSpceLoaded(null);
      setSgaLoaded(null);
      setSpceTrend([]);
      return;
    }
    void refreshLatest(companyId).catch(() => {
      setSpceLoaded(null);
      setSgaLoaded(null);
      setSpceTrend([]);
    });
  }, [companyId, refreshLatest]);

  async function runSpce() {
    if (companyId == null) return;
    setBusy("spce");
    setError(null);
    try {
      const out = await runCompanySpceAssessment(companyId);
      setSpceLoaded({
        summary: {
          overallScore: out.result.overallScore,
          overallStatus: out.result.overallStatus,
          evaluatedAt: new Date().toISOString(),
        },
        result: out.result,
      });
      const history = await getCompanySpceHistory(companyId).catch(() => []);
      setSpceTrend(assessmentHistoryToTrend(history));
    } catch (e) {
      setError(e instanceof Error ? e.message : "SPCE failed");
    } finally {
      setBusy(null);
    }
  }

  async function runSga() {
    if (companyId == null) return;
    setBusy("sga");
    setError(null);
    try {
      const out = await runCompanySmartGapAnalysis(companyId);
      setSgaLoaded({
        summary: {
          overallScore: out.result.overallGapScore,
          overallStatus: out.result.overallStatus,
          evaluatedAt: new Date().toISOString(),
        },
        result: out.result,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Smart gap analysis failed");
    } finally {
      setBusy(null);
    }
  }

  async function exportPdf(kind: "spce" | "sga") {
    if (companyId == null) return;
    setBusy("pdf");
    setError(null);
    try {
      if (kind === "spce") {
        await downloadAssessmentPdf(spcePdfUrl(companyId), `spce-${companyId}.pdf`);
      } else {
        await downloadAssessmentPdf(smartGapPdfUrl(companyId), `smart-gap-${companyId}.pdf`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF export failed");
    } finally {
      setBusy(null);
    }
  }

  const spceWhen = spceLoaded?.summary.evaluatedAt ?? spceSummary?.evaluatedAt;
  const sgaWhen = sgaLoaded?.summary.evaluatedAt ?? smartGapSummary?.evaluatedAt;

  if (companyId == null) {
    return (
      <section
        className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4"
        data-testid="company-assessments-empty-company"
      >
        <h2 className="font-semibold text-slate-900">SPCE &amp; Smart Gap Analysis</h2>
        <p className="mt-2 text-sm text-slate-600">
          Select a company above to view safety program compliance scores, gap analysis, and
          recommended actions.
        </p>
      </section>
    );
  }

  return (
    <section
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-4"
      data-testid="company-assessments-panel"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">SPCE &amp; Smart Gap Analysis</h2>
          <p className="mt-1 text-sm text-slate-600">
            Company {companyId} — safety program compliance, identified gaps, and corrective
            recommendations for hiring-client readiness.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={busy !== null}
            onClick={() => void runSpce()}
          >
            {busy === "spce" ? "Running SPCE…" : "Run SPCE"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy !== null}
            onClick={() => void runSga()}
          >
            {busy === "sga" ? "Running SGA…" : "Run Smart Gap"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy !== null || !spceLoaded}
            onClick={() => void exportPdf("spce")}
          >
            SPCE PDF
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy !== null || !sgaLoaded}
            onClick={() => void exportPdf("sga")}
          >
            SGA PDF
          </Button>
        </div>
      </header>

      {error ? (
        <p className="text-sm text-amber-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-lg border border-slate-100 p-4">
          <h3 className="font-medium text-slate-900">Safety Program Compliance (SPCE)</h3>
          {spceLoaded ? (
            <div className="mt-3">
              <SpceAssessmentDetail
                result={spceLoaded.result}
                evaluatedAt={spceWhen}
                trend={spceTrend}
              />
            </div>
          ) : spceSummary ? (
            <p className="mt-2 text-sm text-slate-600" data-testid="spce-summary-only">
              {spceSummary.overallStatus} · {spceSummary.overallScore}% · loading full
              dimensions…
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500" data-testid="spce-empty">
              No SPCE assessment on file for this company.
            </p>
          )}
        </article>

        <article className="rounded-lg border border-slate-100 p-4">
          <h3 className="font-medium text-slate-900">Smart Gap Analysis</h3>
          {sgaLoaded ? (
            <div className="mt-3">
              <SmartGapAssessmentDetail
                result={sgaLoaded.result}
                evaluatedAt={sgaWhen}
              />
            </div>
          ) : smartGapSummary ? (
            <p className="mt-2 text-sm text-slate-600" data-testid="sga-summary-only">
              {smartGapSummary.overallStatus} · {smartGapSummary.overallScore}% · loading gaps
              and recommendations…
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500" data-testid="sga-empty">
              No smart gap analysis on file for this company.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
