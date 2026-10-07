import { api } from "~/utils/api";

export default function TrainingDashboardPage() {
  const { data, isLoading } = api.training.getCompanyTrainingStatus.useQuery();

  if (isLoading || !data) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Training Status</h1>

      <section>
        <h2 className="text-lg font-medium mb-2">Not Compliant</h2>
        <ul className="space-y-1 text-sm">
          {data.nonCompliant.map((w) => (
            <li key={w.workerId}>
              {w.name} — {w.issues.map((i) => i.courseName).join(", ")}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Expiring Soon</h2>
        <ul className="space-y-1 text-sm">
          {data.expiringSoon.map((w) => (
            <li key={w.workerId}>
              {w.name} — {w.issues.map((i) => i.courseName).join(", ")}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
