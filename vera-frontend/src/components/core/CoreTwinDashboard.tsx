"use client";

import { useState } from "react";
import { TwinDashboardSection } from "@/components/digital-twin/TwinDashboardSection";
import { hydrateCoreTwins } from "@/lib/core/vera-core-platform";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CoreTwinDashboard() {
  const [companyId, setCompanyId] = useState("1");
  const [hydrating, setHydrating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleHydrate() {
    const cid = Number(companyId);
    if (!Number.isFinite(cid)) return;
    setHydrating(true);
    setMessage(null);
    try {
      const twins = await hydrateCoreTwins(cid);
      setMessage(`Generated ${twins.length} digital twins for company ${cid}.`);
    } catch {
      setMessage("Hydration failed — check API and company ID.");
    } finally {
      setHydrating(false);
    }
  }

  const cid = Number(companyId);
  const validCompany = Number.isFinite(cid) ? cid : undefined;

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Digital twin generator</h2>
        <p className="mt-1 text-sm text-slate-600">
          Hydrate worker, equipment, and project twins from live compliance data.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="twin-company" className="text-xs font-medium text-slate-600">
              Company ID
            </label>
            <Input
              id="twin-company"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="mt-1 w-28"
            />
          </div>
          <Button type="button" onClick={() => void handleHydrate()} disabled={hydrating}>
            {hydrating ? "Generating…" : "Generate twins"}
          </Button>
        </div>
        {message ? <p className="mt-3 text-sm text-teal-800">{message}</p> : null}
      </section>

      <TwinDashboardSection companyId={validCompany} />
    </div>
  );
}
