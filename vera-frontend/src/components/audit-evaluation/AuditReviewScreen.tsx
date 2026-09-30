"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@/components/ui";
import {
  addAuditFinding,
  addCorrectiveAction,
  assignAuditReviewer,
  closeEvaluationAudit,
  getEvaluationAudit,
  scoreAudit,
  startAuditReview,
  type AuditTemplate,
  type EvaluationAudit,
} from "@/lib/audit-evaluation-api";
import { getVeriHubSession } from "@/lib/verihub-org-api";
import { AuditScorePill, AuditStatusBadge } from "./AuditStatusBadge";
import { CorrectiveActionTracker } from "./CorrectiveActionTracker";

type AnswerState = Record<
  string,
  { scoreValue?: number; answerText?: string; isNa?: boolean }
>;

export function AuditReviewScreen({
  auditId,
  canManage = true,
}: {
  auditId: string;
  canManage?: boolean;
}) {
  const session = getVeriHubSession();
  const [audit, setAudit] = useState<EvaluationAudit | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reviewerId, setReviewerId] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [findingTitle, setFindingTitle] = useState("");
  const [caTitle, setCaTitle] = useState("");

  async function reload() {
    setError(null);
    try {
      const a = await getEvaluationAudit(auditId);
      setAudit(a);
      const next: AnswerState = {};
      for (const r of a.responses || []) {
        next[r.questionId] = {
          scoreValue: r.scoreValue ?? undefined,
          answerText: r.answerText ?? undefined,
          isNa: r.isNa,
        };
      }
      setAnswers(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }

  useEffect(() => {
    void reload();
  }, [auditId]);

  const template = audit?.template as AuditTemplate | undefined;
  const sectionScores = useMemo(() => {
    const raw = audit?.sectionScores;
    if (!Array.isArray(raw)) return [];
    return raw as { sectionId: string; score: number | null; weight: number }[];
  }, [audit?.sectionScores]);

  function setAnswer(
    questionId: string,
    patch: Partial<AnswerState[string]>,
  ) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...patch },
    }));
  }

  async function onSave(finalize: boolean) {
    if (!audit) return;
    setBusy(true);
    setError(null);
    try {
      const payload = Object.entries(answers).map(([questionId, v]) => ({
        questionId,
        scoreValue: v.scoreValue ?? null,
        answerText: v.answerText ?? null,
        isNa: !!v.isNa,
      }));
      if (!payload.length) throw new Error("Enter at least one answer");
      const updated = await scoreAudit(auditId, payload, finalize);
      setAudit(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Score failed");
    } finally {
      setBusy(false);
    }
  }

  async function onAssign(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await assignAuditReviewer(auditId, {
        reviewerId: reviewerId || session?.user?.id || "",
        reviewerName: reviewerName || session?.user?.email,
      });
      setAudit(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assign failed");
    } finally {
      setBusy(false);
    }
  }

  if (!audit) {
    return (
      <p className="text-sm text-zinc-500">
        {error || "Loading audit…"}
      </p>
    );
  }

  const locked =
    audit.status === "closed" || audit.status === "cancelled";

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{audit.title}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <AuditStatusBadge status={audit.status} />
            <span className="text-sm text-zinc-600">
              Score: <AuditScorePill score={audit.score} />
            </span>
            {audit.reviewerName || audit.reviewerId ? (
              <span className="text-sm text-zinc-500">
                Reviewer: {audit.reviewerName || audit.reviewerId}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManage && audit.status === "assigned" ? (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() =>
                void startAuditReview(auditId).then(setAudit).catch((e) =>
                  setError(e instanceof Error ? e.message : "Start failed"),
                )
              }
            >
              Start review
            </Button>
          ) : null}
          {canManage && audit.status === "scored" ? (
            <Button
              type="button"
              disabled={busy}
              onClick={() =>
                void closeEvaluationAudit(auditId)
                  .then(setAudit)
                  .catch((e) =>
                    setError(e instanceof Error ? e.message : "Close failed"),
                  )
              }
            >
              Close audit
            </Button>
          ) : null}
        </div>
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {audit.documentSnapshot &&
      typeof audit.documentSnapshot === "object" &&
      "indicators" in (audit.documentSnapshot as object) ? (
        <section className="border border-zinc-200 p-4 text-sm">
          <h3 className="mb-2 font-medium">Document Center snapshot</h3>
          <pre className="max-h-40 overflow-auto text-xs text-zinc-600">
            {JSON.stringify(audit.documentSnapshot, null, 2)}
          </pre>
        </section>
      ) : null}

      {canManage && !locked ? (
        <form
          onSubmit={onAssign}
          className="flex flex-wrap items-end gap-3 border border-zinc-200 p-4"
        >
          <label className="space-y-1 text-sm">
            <span>Reviewer user id</span>
            <Input
              value={reviewerId}
              onChange={(e) => setReviewerId(e.target.value)}
              placeholder={session?.user?.id || "UUID"}
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Display name</span>
            <Input
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Jane Reviewer"
            />
          </label>
          <Button type="submit" variant="outline" disabled={busy}>
            Assign reviewer
          </Button>
        </form>
      ) : null}

      {sectionScores.length ? (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {sectionScores.map((s) => {
            const title =
              template?.sections?.find((sec) => sec.id === s.sectionId)
                ?.title || s.sectionId.slice(0, 8);
            return (
              <li
                key={s.sectionId}
                className="border border-zinc-200 px-3 py-2 text-sm"
              >
                <div className="font-medium">{title}</div>
                <div className="text-zinc-600">
                  Weight {s.weight} ·{" "}
                  <AuditScorePill score={s.score} />
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <section className="space-y-6">
        <h3 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Scoring
        </h3>
        {(template?.sections || []).map((section) => (
          <div key={section.id} className="space-y-3 border border-zinc-200 p-4">
            <div className="flex justify-between gap-2">
              <h4 className="font-medium">{section.title}</h4>
              <span className="text-xs text-zinc-500">
                Section weight {section.weight}
              </span>
            </div>
            {section.questions.map((q) => (
              <div key={q.id} className="space-y-2 border-t border-zinc-100 pt-3">
                <p className="text-sm">{q.prompt}</p>
                {q.helpText ? (
                  <p className="text-xs text-zinc-500">{q.helpText}</p>
                ) : null}
                {q.documentCategoryHint ? (
                  <p className="text-xs text-sky-700">
                    Doc category: {q.documentCategoryHint}
                  </p>
                ) : null}
                {!locked ? (
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {q.questionType === "score" ? (
                      <Input
                        type="number"
                        min={0}
                        max={q.maxScore}
                        className="w-28"
                        value={answers[q.id]?.scoreValue ?? ""}
                        onChange={(e) =>
                          setAnswer(q.id, {
                            scoreValue: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        placeholder={`0–${q.maxScore}`}
                      />
                    ) : null}
                    {q.questionType === "yes_no" ? (
                      <select
                        className="border border-zinc-300 px-2 py-1"
                        value={answers[q.id]?.answerText || ""}
                        onChange={(e) =>
                          setAnswer(q.id, {
                            answerText: e.target.value,
                            scoreValue:
                              e.target.value === "yes" ? q.maxScore : 0,
                          })
                        }
                      >
                        <option value="">—</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    ) : null}
                    {q.questionType === "text" ? (
                      <Input
                        className="min-w-[220px] flex-1"
                        value={answers[q.id]?.answerText || ""}
                        onChange={(e) =>
                          setAnswer(q.id, { answerText: e.target.value })
                        }
                      />
                    ) : null}
                    <label className="flex items-center gap-1 text-xs text-zinc-600">
                      <input
                        type="checkbox"
                        checked={!!answers[q.id]?.isNa}
                        onChange={(e) =>
                          setAnswer(q.id, { isNa: e.target.checked })
                        }
                      />
                      N/A
                    </label>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">
                    {answers[q.id]?.isNa
                      ? "N/A"
                      : answers[q.id]?.scoreValue != null
                        ? `Score ${answers[q.id]?.scoreValue}`
                        : answers[q.id]?.answerText || "—"}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
        {!locked && canManage ? (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void onSave(false)}
            >
              Save scores
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void onSave(true)}
            >
              Finalize score
            </Button>
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Findings
        </h3>
        <ul className="divide-y divide-zinc-200 border border-zinc-200 text-sm">
          {(audit.findings || []).map((f) => (
            <li key={f.id} className="px-3 py-2">
              <div className="font-medium">
                {f.title}{" "}
                <span className="text-xs uppercase text-zinc-500">
                  {f.severity}
                </span>
              </div>
              {f.description ? (
                <p className="text-zinc-600">{f.description}</p>
              ) : null}
            </li>
          ))}
          {!audit.findings?.length ? (
            <li className="px-3 py-4 text-zinc-500">No findings.</li>
          ) : null}
        </ul>
        {!locked && canManage ? (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void addAuditFinding(auditId, { title: findingTitle })
                .then(() => {
                  setFindingTitle("");
                  return reload();
                })
                .catch((err) =>
                  setError(err instanceof Error ? err.message : "Failed"),
                );
            }}
          >
            <Input
              value={findingTitle}
              onChange={(e) => setFindingTitle(e.target.value)}
              placeholder="New finding"
              required
            />
            <Button type="submit" variant="outline">
              Add finding
            </Button>
          </form>
        ) : null}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Corrective actions
        </h3>
        <CorrectiveActionTracker
          actions={audit.correctiveActions || []}
          onChanged={() => void reload()}
        />
        {!locked && canManage ? (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void addCorrectiveAction(auditId, { title: caTitle })
                .then(() => {
                  setCaTitle("");
                  return reload();
                })
                .catch((err) =>
                  setError(err instanceof Error ? err.message : "Failed"),
                );
            }}
          >
            <Input
              value={caTitle}
              onChange={(e) => setCaTitle(e.target.value)}
              placeholder="New corrective action"
              required
            />
            <Button type="submit" variant="outline">
              Add CA
            </Button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
