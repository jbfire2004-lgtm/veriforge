"use client";

import { useEffect, useState } from "react";
import { getCompanyCompliance } from "@/lib/api/companies";

export function TrainingCompliancePanel({ companyId }: { companyId: number }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getCompanyCompliance(companyId).then(setData);
  }, [companyId]);

  if (!data) return <div className="p-4">Loading compliance...</div>;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded shadow">
      <h2 className="text-xl font-bold">Training Compliance</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-semibold">Expired Training</div>
          <div>{data.expiredTraining.length}</div>
        </div>
        <div>
          <div className="font-semibold">Expired Credentials</div>
          <div>{data.expiredCredentials.length}</div>
        </div>
      </div>
    </div>
  );
}
