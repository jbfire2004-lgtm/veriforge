import { Card, CardContent } from "@/components/ui";

export function ReportStatGrid({
  stats,
}: {
  stats: { label: string; value: number | string; warn?: boolean }[];
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p
              className={`text-2xl font-semibold tabular-nums ${
                s.warn && Number(s.value) > 0 ? "text-amber-700" : ""
              }`}
            >
              {s.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
