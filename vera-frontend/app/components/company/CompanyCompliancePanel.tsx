"use client";

import { useEffect, useState } from "react";
import { getCompanyCompliance } from "@/lib/api/companies";
import { CompanyComplianceBadge } from "./CompanyComplianceBadge";

export function CompanyCompliancePanel({ id }: { id: number }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getCompanyCompliance(id).then(setData);
  }, [id]);

  if (!data) return <div className="p-4">Loading compliance...</div>;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Compliance Summary</h2>
        <CompanyComplianceBadge score={data.score} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-semibold">Expired Training</div>
          <div>{data.expiredTraining.length}</div>
        </div>
        <div>
          <div className="font-semibold">Expired Credentials</div>
          <div>{data.expiredCredentials.length}</div>
        </div>
        <div>
          <div className="font-semibold">Worker Incidents</div>
          <div>{data.workerIncidents.length}</div>
        </div>
        <div>
          <div className="font-semibold">Equipment Incidents</div>
          <div>{data.equipmentIncidents.length}</div>
        </div>
      </div>
    </div>
  );
}
