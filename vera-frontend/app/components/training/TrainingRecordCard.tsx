export function TrainingRecordCard({ record }: any) {
    const expired =
      record.expiresAt && new Date(record.expiresAt) <= new Date();
  
    return (
      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-bold">{record.certification?.name}</h3>
        <p className="text-gray-600">
          Completed: {record.completedAt?.slice(0, 10)}
        </p>
        <p className={expired ? "text-red-600 font-semibold" : "text-gray-600"}>
          Expires: {record.expiresAt?.slice(0, 10)}
        </p>
      </div>
    );
  }
  