import type { FeedItemWithEngagement } from "@vera/api-contract";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { cn } from "@/src/lib/utils";
import { FeedInteractionBar } from "../FeedInteractionBar";
import { ReportDialog } from "@/components/moderation/ReportDialog";

export const SOURCE_LABEL: Record<FeedItemWithEngagement["source"], string> = {
  VERA_CORE_TRAINING: "Training",
  TRAINING_EXPIRY: "Expiring",
  VERA_CORE_PROJECT: "Project",
  VERA_CORE_EQUIPMENT: "Equipment",
  JOB_BOARD: "Jobs",
  SAFETY_BLOG: "Safety",
  COMPANY_ANNOUNCEMENT: "Announcement",
  WORKER_ACHIEVEMENT: "Achievement",
  EXPERT_ANSWER: "Expert",
  UNION_DISPATCH: "Dispatch",
  SYSTEM: "System",
};

type Props = {
  item: FeedItemWithEngagement;
  className?: string;
  accent?: string;
  badge?: string;
  onComment: () => void;
  onShare: () => void;
};

export function FeedCardBase({
  item,
  className,
  accent = "text-vera-teal",
  badge,
  onComment,
  onShare,
}: Props) {
  const label = badge ?? SOURCE_LABEL[item.source];
  const inner = (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-vera-2">
        <p className={cn("text-xs font-semibold uppercase tracking-wider", accent)}>
          {label}
          {item.safetyPriority && item.safetyPriority > 1 ? (
            <span className="ml-vera-2 text-vera-warning">Priority</span>
          ) : null}
        </p>
        <CardTitle className="text-base">{item.title}</CardTitle>
        {item.summary ? (
          <CardDescription className="line-clamp-3">{item.summary}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="mt-auto space-y-vera-3">
        <time className="block text-xs text-vera-muted">
          {new Date(item.publishedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
        <div className="flex flex-wrap items-center justify-between gap-vera-2">
          <FeedInteractionBar item={item} onComment={onComment} onShare={onShare} />
          <ReportDialog
            target={{
              kind: "post",
              targetType: "FEED_ITEM",
              targetId: item.id,
              label: item.title,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );

  if (item.url) {
    return (
      <div className="relative">
        <Link href={item.url} className="block no-underline [&_button]:relative [&_button]:z-10">
          {inner}
        </Link>
      </div>
    );
  }
  return inner;
}
