"use client";

import type { ExpertQaQuestionDetail } from "@vera/api-contract";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { acceptAnswer, voteAnswer } from "@/lib/expert-qa/api";
import { ExpertBadge } from "./ExpertBadge";
import { ReportDialog } from "@/components/moderation/ReportDialog";
import { buttonStyles } from "@/components/ui";

export function AnswerList({
  question,
  onAccepted,
}: {
  question: ExpertQaQuestionDetail;
  onAccepted?: () => void;
}) {
  const { data: session } = useSession();
  const [voterKey] = useState(() =>
    typeof crypto !== "undefined" ? crypto.randomUUID() : `v-${Date.now()}`,
  );

  const vote = useCallback(
    async (answerId: string, value: 1 | -1) => {
      try {
        await voteAnswer(answerId, value, voterKey);
        onAccepted?.();
      } catch {
        /* already voted */
      }
    },
    [voterKey, onAccepted],
  );

  const accept = useCallback(
    async (answerId: string) => {
      if (!session) return;
      await acceptAnswer(session, question.id, answerId);
      onAccepted?.();
    },
    [session, question.id, onAccepted],
  );

  return (
    <ul className="space-y-vera-4">
      {question.answers.map((a) => (
        <li
          key={a.id}
          className={`rounded-xl border p-vera-4 ${
            a.isAccepted ? "border-vera-teal bg-vera-teal/5" : "border-vera-border bg-white"
          }`}
        >
          <div className="mb-vera-2 flex flex-wrap items-center gap-vera-2">
            <span className="font-medium text-sm">{a.author.displayName}</span>
            {a.author.badgeLevel ? (
              <ExpertBadge
                level={a.author.badgeLevel}
                verified={a.author.verified}
              />
            ) : null}
            {a.isExpertAnswer ? (
              <span className="text-xs text-vera-teal">Expert answer</span>
            ) : null}
            {a.isAccepted ? (
              <span className="text-xs font-semibold text-vera-teal">Accepted</span>
            ) : null}
          </div>
          <p className="text-sm whitespace-pre-wrap">{a.body}</p>
          <div className="mt-vera-3 flex flex-wrap gap-vera-2">
            <button
              type="button"
              onClick={() => vote(a.id, 1)}
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              ▲ {a.voteScore}
            </button>
            <button
              type="button"
              onClick={() => vote(a.id, -1)}
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              ▼
            </button>
            {session && !question.hasAcceptedAnswer ? (
              <button
                type="button"
                onClick={() => accept(a.id)}
                className={buttonStyles({ variant: "outline", size: "sm" })}
              >
                Accept
              </button>
            ) : null}
            <ReportDialog
              target={{
                kind: "post",
                targetType: "EXPERT_QA_ANSWER",
                targetId: a.id,
                label: a.body.slice(0, 80),
              }}
            />
            <ReportDialog
              target={{
                kind: "user",
                userId: a.author.userId,
                label: a.author.displayName,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
