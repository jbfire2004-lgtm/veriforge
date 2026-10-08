"use client";

import { useCallback, useEffect, useState } from "react";
import {
  assignTenantSubscription,
  fetchSubscriptionTiers,
  fetchTenants,
  type AcpTenant,
} from "@/lib/acp-api";
import { AcpPage } from "@/src/components/acp/AcpPage";

export default function AcpSubscriptionsPage() {
  const [tenants, setTenants] = useState<AcpTenant[]>([]);
  const [tiers, setTiers] = useState<Array<{ id: string; key: string; name: string }>>(
    [],
  );

  const load = useCallback(async () => {
    const [t, tierRows] = await Promise.all([fetchTenants(), fetchSubscriptionTiers()]);
    setTenants(t);
    setTiers(tierRows);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AcpPage
      title="Subscriptions"
      description="Assign subscription tiers to tenants — gates feature flags and limits."
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
          >
            <p className="font-semibold">{tier.name}</p>
            <p className="font-mono text-xs text-slate-500">{tier.key}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 font-medium">Tenant</th>
              <th className="px-4 py-3 font-medium">Current tier</th>
              <th className="px-4 py-3 font-medium">Change tier</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3">{t.name}</td>
                <td className="px-4 py-3">{t.subscription?.tier?.name ?? "None"}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded border px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
                    value={t.subscription?.tier?.key ?? ""}
                    onChange={(e) => {
                      const tier = tiers.find((x) => x.key === e.target.value);
                      if (tier) void assignTenantSubscription(t.id, tier.id).then(load);
                    }}
                  >
                    <option value="">Select tier…</option>
                    {tiers.map((tier) => (
                      <option key={tier.id} value={tier.key}>
                        {tier.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AcpPage>
  );
}
