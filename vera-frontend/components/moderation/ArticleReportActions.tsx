"use client";

import { ReportDialog } from "@/components/moderation/ReportDialog";

type Props = {
  articleId: string;
  title: string;
};

export function ArticleReportActions({ articleId, title }: Props) {
  return (
    <ReportDialog
      target={{
        kind: "post",
        targetType: "SAFETY_ARTICLE",
        targetId: articleId,
        label: title,
      }}
    />
  );
}
