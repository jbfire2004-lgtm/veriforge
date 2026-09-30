import type { ProjectUpdateDto } from "@vera/api-contract";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

type Props = { update: ProjectUpdateDto };

export function ProjectUpdateCard({ update }: Props) {
  const body = (
    <Card className="h-full">
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-wider text-vera-muted">
          {update.projectName}
        </p>
        <CardTitle className="text-base">{update.title}</CardTitle>
        {update.summary ? (
          <CardDescription className="line-clamp-2">{update.summary}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="text-xs text-vera-muted">
        {new Date(update.publishedAt).toLocaleDateString()}
      </CardContent>
    </Card>
  );
  if (update.url) {
    return (
      <Link href={update.url} className="block no-underline">
        {body}
      </Link>
    );
  }
  return body;
}
