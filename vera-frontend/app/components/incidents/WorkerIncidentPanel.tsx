"use client";

import { useEffect, useState } from "react";
import { getWorker } from "@/lib/api/workers";
import { IncidentList } from "./IncidentList";

export function WorkerIncidentPanel({ workerId }: { workerId: number }) {
  const [worker, setWorker] = useState<any>(null);

  useEffect(() => {
    getWorker(workerId).then(setWorker);
  }, [workerId]);

  if (!worker) return <div className="p-4">Loading incidents...</div>;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded shadow">
      <h2 className="text-xl font-bold">Worker Incidents</h2>
      <IncidentList incidents={worker.incidents} />
    </div>
  );
}
