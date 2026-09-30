import { TrainingRecordCard } from "./TrainingRecordCard";

export function TrainingRecordList({ records }: { records?: any[] }) {
  if (!records || records.length === 0) {
    return <p className="text-gray-500">No training records.</p>;
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <TrainingRecordCard key={record.id} record={record} />
      ))}
    </div>
  );
}
