"use client";

import { useEffect, useState } from "react";
import { getEquipmentFull } from "@/lib/api/verify";
import { EquipmentStatusBadge } from "./EquipmentStatusBadge";

export function EquipmentVerificationPanel({ id }: { id: number }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getEquipmentFull(id).then(setData);
  }, [id]);

  if (!data) return <div className="p-4">Loading...</div>;

  const isSafe = data.ruleResult?.result === "SAFE";

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Verification</h2>
        <EquipmentStatusBadge isSafe={isSafe} />
      </div>

      {!isSafe && (
        <div className="bg-red-100 p-3 rounded">
          <h3 className="font-semibold mb-2">Issues</h3>
          <ul className="list-disc ml-6">
            {data.ruleResult.reasons.map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="font-semibold">Required Certifications</h3>
        <ul className="list-disc ml-6">
          {data.requiredCerts.map((c: any) => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold">Assigned Workers</h3>
        <ul className="list-disc ml-6">
          {data.assignedWorkers.map((w: any) => (
            <li key={w.id}>{w.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
