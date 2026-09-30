import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

type Props = {
  title: string;
  excerpt: string;
  expertName?: string;
  answeredAt?: string;
};

export function ExpertAnswerCard({
  title,
  excerpt,
  expertName,
  answeredAt,
}: Props) {
  return (
    <Card className="h-full border-vera-teal/20 bg-vera-teal/5">
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-wider text-vera-teal">
          Expert answer
        </p>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="line-clamp-3">{excerpt}</CardDescription>
      </CardHeader>
      <CardContent className="text-xs text-vera-muted">
        {expertName ? `Answered by ${expertName}` : "Verified safety expert"}
        {answeredAt
          ? ` · ${new Date(answeredAt).toLocaleDateString()}`
          : null}
      </CardContent>
    </Card>
  );
}
