"use client";

import { useEffect, useState } from "react";
import { getCompany } from "@/lib/api/companies";

export function CompanyIncidentSummary({ companyId }: { companyId: number }) {
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    getCompany(companyId).then(setCompany);
  }, [companyId]);

  if (!company) return <div className="p-4">Loading incidents...</div>;

  const workerIncidents = company.workers.flatMap((w: any) => w.incidents);
  const equipmentIncidents = company.equipment.flatMap((e: any) => e.incidents);

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded shadow">
      <h2 className="text-xl font-bold">Company Incident Summary</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-semibold">Worker Incidents</div>
          <div>{workerIncidents.length}</div>
        </div>
        <div>
          <div className="font-semibold">Equipment Incidents</div>
          <div>{equipmentIncidents.length}</div>
        </div>
      </div>
    </div>
  );
}
