import type { FeedItemDto } from "@vera/api-contract";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { cn } from "@/src/lib/utils";

const SOURCE_LABEL: Record<FeedItemDto["source"], string> = {
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
  item: FeedItemDto;
  className?: string;
};

export function FeedItemCard({ item, className }: Props) {
  const inner = (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-vera-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-vera-teal">
          {SOURCE_LABEL[item.source]}
        </p>
        <CardTitle className="text-base">{item.title}</CardTitle>
        {item.summary ? (
          <CardDescription className="line-clamp-2">{item.summary}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="text-xs text-vera-muted">
        {new Date(item.publishedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </CardContent>
    </Card>
  );

  if (item.url) {
    return (
      <Link href={item.url} className="block no-underline">
        {inner}
      </Link>
    );
  }
  return inner;
}
