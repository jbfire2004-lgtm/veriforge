"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAssignOrientationDelivery,
  useCreateOrientationCompletion,
  useOrientationDefinition,
} from "@/lib/orientation/veriforge-queries";
import {
  parseContentBlocks,
  type OrientationContentBlock,
  type OrientationCompletion,
} from "@/lib/orientation/veriforge-types";
import { OrientationWalletCard } from "./OrientationWalletCard";

type Props = {
  orientationId: string;
  workerId: number;
  companyId: number;
  projectId?: number;
  companyLabel?: string | null;
  projectLabel?: string | null;
  listPath?: string;
};

function progressKey(workerId: number, orientationId: string) {
  return `vf-orient-progress:${workerId}:${orientationId}`;
}

function saveProgress(
  workerId: number,
  orientationId: string,
  index: number,
  answers: Record<string, number>,
  acks: Record<string, boolean>,
) {
  try {
    localStorage.setItem(
      progressKey(workerId, orientationId),
      JSON.stringify({ index, answers, acks }),
    );
  } catch {
    /* ignore */
  }
}

function clearProgress(workerId: number, orientationId: string) {
  try {
    localStorage.removeItem(progressKey(workerId, orientationId));
  } catch {
    /* ignore */
  }
}

function loadProgress(workerId: number, orientationId: string) {
  try {
    const raw = localStorage.getItem(progressKey(workerId, orientationId));
    if (!raw) return null;
    return JSON.parse(raw) as {
      index: number;
      answers: Record<string, number>;
      acks: Record<string, boolean>;
    };
  } catch {
    return null;
  }
}

export function OrientationPlayer({
  orientationId,
  workerId,
  companyId,
  projectId,
  companyLabel,
  projectLabel,
  listPath,
}: Props) {
  const { data, isLoading, error } = useOrientationDefinition(orientationId);
  const complete = useCreateOrientationCompletion(workerId);
  const assign = useAssignOrientationDelivery(workerId);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [acks, setAcks] = useState<Record<string, boolean>>({});
  const [pending, startTransition] = useTransition();
  const [completion, setCompletion] = useState<OrientationCompletion | null>(
    null,
  );
  const [walletLink, setWalletLink] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{
    correct: number;
    total: number;
    score: number;
  } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const blocks = useMemo(
    () => (data ? parseContentBlocks(data.contentBlocks) : []),
    [data],
  );
  const block = blocks[index];
  const isLast = blocks.length === 0 || index >= blocks.length - 1;
  const progressPct =
    blocks.length === 0 ? 0 : Math.round(((index + 1) / blocks.length) * 100);

  const backHref =
    listPath ??
    `/workers/${workerId}/orientations${
      companyId
        ? `?companyId=${companyId}${projectId ? `&projectId=${projectId}` : ""}`
        : ""
    }`;

  useEffect(() => {
    const saved = loadProgress(workerId, orientationId);
    if (saved) {
      setIndex(saved.index ?? 0);
      setAnswers(saved.answers ?? {});
      setAcks(saved.acks ?? {});
    }
    setHydrated(true);
  }, [workerId, orientationId]);

  useEffect(() => {
    if (!hydrated || completion) return;
    saveProgress(workerId, orientationId, index, answers, acks);
  }, [hydrated, workerId, orientationId, index, answers, acks, completion]);

  function canAdvance(b: OrientationContentBlock | undefined) {
    if (!b) return false;
    if (b.type === "quiz") return answers[b.id] != null;
    if (b.type === "policy_ack") return !!acks[b.id];
    return true;
  }

  function computeQuizFeedback() {
    const quizBlocks = blocks.filter((b) => b.type === "quiz" && b.quiz);
    if (!quizBlocks.length) return null;
    const correct = quizBlocks.filter(
      (b) => answers[b.id] === b.quiz!.answerIndex,
    ).length;
    return {
      correct,
      total: quizBlocks.length,
      score: Math.round((correct / quizBlocks.length) * 100),
    };
  }

  function goNext() {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    const feedback = computeQuizFeedback();
    if (feedback && !quizFeedback) {
      setQuizFeedback(feedback);
      return;
    }
    finish(feedback?.score);
  }

  function finish(score?: number) {
    setLocalError(null);
    startTransition(async () => {
      try {
        const quizScore = score ?? computeQuizFeedback()?.score;
        const row = await complete.mutateAsync({
          workerId,
          orientationId,
          companyId,
          projectId,
          score: quizScore,
          clientSyncId: `web-${workerId}-${orientationId}-${Date.now()}`,
        });
        clearProgress(workerId, orientationId);
        setCompletion(row);
      } catch (e) {
        setLocalError(e instanceof Error ? e.message : "Completion failed");
      }
    });
  }

  function addToWallet() {
    startTransition(async () => {
      try {
        const res = await assign.mutateAsync({
          workerId,
          orientationId,
          companyId,
        });
        setWalletLink(res.deepLink);
      } catch (e) {
        setLocalError(e instanceof Error ? e.message : "Wallet assign failed");
      }
    });
  }

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (error || !data) {
    return (
      <p className="text-sm text-[#B33A3A]" role="alert">
        {error instanceof Error ? error.message : "Orientation not found"}
      </p>
    );
  }

  if (completion) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-5 px-1">
        <Card className="overflow-hidden border-[#3D8F58]/30">
          <CardContent className="space-y-5 p-8 text-center">
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#4FAF6F]/20"
              aria-hidden
            >
              <CheckCircle2 className="h-12 w-12 text-[#3D8F58]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-[#1F2328]">
                You&apos;re all set
              </h2>
              <p className="text-sm text-[#2A2E33]/70">{data.title}</p>
            </div>
            <dl className="mx-auto grid max-w-xs gap-2 text-left text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#2A2E33]/60">Completed</dt>
                <dd className="font-medium tabular-nums">
                  {completion.completedOn
                    ? new Date(completion.completedOn).toLocaleDateString()
                    : "Today"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#2A2E33]/60">Expires</dt>
                <dd className="font-medium tabular-nums">
                  {completion.expiresOn
                    ? new Date(completion.expiresOn).toLocaleDateString()
                    : "—"}
                </dd>
              </div>
              {completion.score != null ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#2A2E33]/60">Score</dt>
                  <dd className="font-medium tabular-nums">
                    {completion.score}%
                  </dd>
                </div>
              ) : null}
            </dl>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                className="gap-2"
                onClick={addToWallet}
                disabled={pending || assign.isPending}
              >
                <Wallet className="h-4 w-4" aria-hidden />
                Add to wallet
              </Button>
              <Link href={backHref}>
                <Button variant="outline" className="w-full sm:w-auto">
                  Back to orientations
                </Button>
              </Link>
            </div>
            {localError ? (
              <p className="text-sm text-[#B33A3A]" role="alert">
                {localError}
              </p>
            ) : null}
          </CardContent>
        </Card>
        {walletLink ? (
          <OrientationWalletCard
            orientationId={orientationId}
            title={data.title}
            companyLabel={companyLabel}
            projectLabel={projectLabel}
            status="completed"
            deepLink={walletLink}
            href={backHref}
          />
        ) : null}
      </div>
    );
  }

  if (quizFeedback) {
    const passed = quizFeedback.score >= 70;
    return (
      <div className="mx-auto w-full max-w-lg space-y-4 px-1">
        <Card>
          <CardContent className="space-y-4 p-6 text-center">
            <h2 className="text-xl font-semibold">Quiz results</h2>
            <p className="text-3xl font-semibold tabular-nums text-[#1A5553]">
              {quizFeedback.score}%
            </p>
            <p className="text-sm text-[#2A2E33]/70">
              {quizFeedback.correct} of {quizFeedback.total} correct
              {passed
                ? " — nice work."
                : " — review the material and continue when ready."}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setQuizFeedback(null);
                  setIndex(0);
                }}
              >
                Review again
              </Button>
              <Button
                disabled={pending || complete.isPending}
                onClick={() => finish(quizFeedback.score)}
              >
                Finish &amp; record
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fileRef =
    data.contentMode === "uploaded"
      ? String(
          (data.metadata as { sourceFileId?: string } | undefined)
            ?.sourceFileId ??
            data.sourceFileKey ??
            "",
        )
      : "";

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col px-1 sm:px-0">
      <header className="space-y-3 border-b border-[#2A2E33]/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#2A2E33]/55">
            Step {Math.min(index + 1, Math.max(blocks.length, 1))} of{" "}
            {Math.max(blocks.length, 1)}
          </p>
          <h1 className="text-xl font-semibold text-[#1F2328] sm:text-2xl">
            {data.title}
          </h1>
        </div>
        <ProgressBar
          value={progressPct}
          label="Orientation progress"
          showLabel
          tone="teal"
          size="sm"
        />
      </header>

      <main className="flex flex-1 flex-col justify-center py-6">
        {data.contentMode === "uploaded" && fileRef ? (
          <Card className="mb-4">
            <CardContent className="space-y-3 p-4">
              <p className="text-sm text-[#2A2E33]/70">
                Uploaded material reference: {fileRef}
              </p>
              {fileRef.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                <video className="w-full rounded-[3px]" controls src={fileRef} />
              ) : (
                <iframe
                  title="Orientation document"
                  className="h-[50vh] w-full rounded-[3px] border"
                  src={fileRef.startsWith("http") ? fileRef : undefined}
                />
              )}
            </CardContent>
          </Card>
        ) : null}

        {(data.contentMode === "native" ||
          data.contentMode === "hybrid" ||
          !fileRef) &&
        block ? (
          <Card>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <h2 className="text-lg font-semibold">
                {block.title || block.type}
              </h2>
              {block.type === "video" && block.mediaUrl ? (
                <video
                  className="w-full rounded-[3px]"
                  controls
                  src={block.mediaUrl}
                />
              ) : null}
              {block.type === "quiz" && block.quiz ? (
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">
                    {block.quiz.prompt}
                  </legend>
                  {block.quiz.choices.map((choice, i) => (
                    <label
                      key={i}
                      className={`flex cursor-pointer items-start gap-3 rounded-[3px] border px-3 py-3 text-sm transition-colors ${
                        answers[block.id] === i
                          ? "border-[#2F8F8C] bg-[#2F8F8C]/10"
                          : "border-[#2A2E33]/15 hover:border-[#2A2E33]/30"
                      }`}
                    >
                      <input
                        type="radio"
                        className="mt-0.5"
                        name={`quiz-${block.id}`}
                        checked={answers[block.id] === i}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [block.id]: i }))
                        }
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </fieldset>
              ) : null}
              {block.type === "policy_ack" ? (
                <label className="flex items-start gap-3 rounded-[3px] border border-[#2A2E33]/15 px-3 py-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={!!acks[block.id]}
                    onChange={(e) =>
                      setAcks((prev) => ({
                        ...prev,
                        [block.id]: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    {block.body ||
                      "I acknowledge that I have reviewed this orientation."}
                  </span>
                </label>
              ) : null}
              {(block.type === "slide" || block.type === "text") &&
              block.body ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#2A2E33]/85">
                  {block.body}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : !blocks.length && data.contentMode !== "uploaded" ? (
          <p className="text-sm text-[#2A2E33]/65">
            This orientation has no content blocks yet.
          </p>
        ) : null}

        {localError ? (
          <p className="mt-3 text-sm text-[#B33A3A]" role="alert">
            {localError}
          </p>
        ) : null}
      </main>

      <footer className="sticky bottom-0 border-t border-[#2A2E33]/10 bg-[#F7F8F9]/95 py-3 backdrop-blur">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            Back
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={backHref}>
              <Button variant="outline" className="w-full sm:w-auto">
                Save &amp; exit
              </Button>
            </Link>
            <Button
              disabled={
                pending ||
                complete.isPending ||
                (block ? !canAdvance(block) : blocks.length > 0)
              }
              onClick={goNext}
            >
              {isLast ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
