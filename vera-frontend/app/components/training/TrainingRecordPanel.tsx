"use client";

import { useEffect, useState } from "react";
import { getWorker } from "@/lib/api/workers";
import { TrainingRecordList } from "./TrainingRecordList";

export function TrainingRecordPanel({ workerId }: { workerId: number }) {
  const [worker, setWorker] = useState<any>(null);

  useEffect(() => {
    getWorker(workerId).then(setWorker);
  }, [workerId]);

  if (!worker) return <div className="p-4">Loading training...</div>;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded shadow">
      <h2 className="text-xl font-bold">Training Records</h2>
      <TrainingRecordList records={worker.trainingRecords} />
    </div>
  );
}
