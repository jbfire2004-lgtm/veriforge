import { IncidentCard } from "./IncidentCard";

export function IncidentList({ incidents }: any) {
  if (!incidents || incidents.length === 0) {
    return <p className="text-gray-500">No incidents</p>;
  }

  return (
    <div className="grid gap-4">
      {incidents.map((i: any) => (
        <IncidentCard key={i.id} incident={i} />
      ))}
    </div>
  );
}
