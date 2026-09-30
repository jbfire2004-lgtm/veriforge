"use client";

import { ReportDialog } from "@/components/moderation/ReportDialog";

type Props = {
  questionId: string;
  title: string;
  authorUserId?: number | null;
  anonymous?: boolean;
};

export function QuestionReportActions({
  questionId,
  title,
  authorUserId,
  anonymous,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-vera-2">
      <ReportDialog
        target={{
          kind: "post",
          targetType: "EXPERT_QA_QUESTION",
          targetId: questionId,
          label: title,
        }}
      />
      {!anonymous && authorUserId ? (
        <ReportDialog
          target={{
            kind: "user",
            userId: authorUserId,
            label: "Question author",
          }}
        />
      ) : null}
    </div>
  );
}
