"use client";

import { useEffect, useMemo, useState } from "react";
import {
  completeMyOrientation,
  getOrientation,
  startMyOrientation,
  type OrientationPackageDetail,
} from "@/lib/orientation/api";
import { OrientationViewer } from "./OrientationViewer";
import { OrientationQuiz } from "./OrientationQuiz";
import { OrientationCertificate } from "./OrientationCertificate";
import { WorkspaceHero, WorkspaceSection } from "@/components/theme/workspace";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Step = "content" | "quiz" | "certificate";

type Props = {
  packageId: string;
  onFinished?: () => void;
};

export function OrientationWorkerCompleteView({ packageId, onFinished }: Props) {
  const [pkg, setPkg] = useState<OrientationPackageDetail | null>(null);
  const [step, setStep] = useState<Step>("content");
  const [lang, setLang] = useState("en");
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void startMyOrientation(packageId).catch(() => undefined);
    void getOrientation(packageId).then(setPkg);
  }, [packageId]);

  const questions = useMemo(() => {
    const quiz = pkg?.currentVersion?.quiz ?? {};
    const list = (quiz[lang] ?? quiz.en ?? []) as Array<{
      id: string;
      prompt: string;
      choices: string[];
      answerIndex: number;
    }>;
    return list;
  }, [pkg, lang]);

  const sections = (pkg?.currentVersion?.sections ?? {}) as Record<
    string,
    { id: string; type: string; title: string; body: string }[]
  >;

  async function finish(score: number) {
    setBusy(true);
    try {
      const result = (await completeMyOrientation(packageId, {
        quizScore: score,
        languageCode: lang,
      })) as { certificateId?: string };
      setQuizScore(score);
      setCertificateId(result?.certificateId ?? `ORI-${packageId.slice(0, 8)}`);
      setStep("certificate");
    } finally {
      setBusy(false);
    }
  }

  if (!pkg) return <Skeleton className="h-64 w-full rounded-2xl" />;

  return (
    <div className="space-y-6">
      <WorkspaceHero
        eyebrow="Onboarding"
        title={pkg.title}
        description={`Complete orientation v${pkg.version} before accessing projects and tasks.`}
        badges={[{ label: "Required", tone: "amber" }]}
      />

      {step === "content" ? (
        <WorkspaceSection title="Read orientation">
          <OrientationViewer
            languages={pkg.languages}
            sections={sections}
            defaultLanguage={lang}
            onLanguageChange={setLang}
          />
          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              onClick={() => setStep(questions.length ? "quiz" : "quiz")}
            >
              Continue to {questions.length ? "quiz" : "completion"}
            </Button>
          </div>
        </WorkspaceSection>
      ) : null}

      {step === "quiz" ? (
        <WorkspaceSection title="Knowledge check">
          <OrientationQuiz
            questions={questions}
            onComplete={(score) => {
              if (questions.length) {
                void finish(score);
              } else {
                void finish(100);
              }
            }}
          />
          {!questions.length ? (
            <Button
              type="button"
              className="mt-4"
              disabled={busy}
              onClick={() => void finish(100)}
            >
              {busy ? "Saving…" : "Mark complete"}
            </Button>
          ) : null}
        </WorkspaceSection>
      ) : null}

      {step === "certificate" && certificateId ? (
        <WorkspaceSection title="Certificate">
          <OrientationCertificate
            workerName="You"
            packageTitle={pkg.title}
            certificateId={certificateId}
            languageCode={lang}
            completedAt={new Date().toISOString()}
          />
          <div className="mt-6 flex justify-end">
            <Button type="button" onClick={() => onFinished?.()}>
              Done
            </Button>
          </div>
        </WorkspaceSection>
      ) : null}
    </div>
  );
}
