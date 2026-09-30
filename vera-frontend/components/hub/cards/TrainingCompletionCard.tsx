import type { WorkerAchievementDto } from "@vera/api-contract";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

type Props = { achievement: WorkerAchievementDto };

export function TrainingCompletionCard({ achievement }: Props) {
  return (
    <Card className="h-full border-emerald-200/80 bg-emerald-50/40">
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Training completed
        </p>
        <CardTitle className="text-base">{achievement.title}</CardTitle>
        <CardDescription>{achievement.workerName}</CardDescription>
      </CardHeader>
      <CardContent className="text-xs text-vera-muted">
        {new Date(achievement.completedAt).toLocaleDateString()}
      </CardContent>
    </Card>
  );
}
