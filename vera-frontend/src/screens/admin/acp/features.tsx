"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchFeatureFlags,
  fetchTenant,
  fetchTenants,
  toggleTenantFeature,
  type AcpFeatureFlag,
  type AcpTenant,
} from "@/lib/acp-api";
import { AcpToggle } from "@/components/vera-access/AcpToggle";
import { AcpPage } from "@/src/components/acp/AcpPage";

export default function AcpFeaturesPage() {
  const [flags, setFlags] = useState<AcpFeatureFlag[]>([]);
  const [tenants, setTenants] = useState<AcpTenant[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    const [f, t] = await Promise.all([fetchFeatureFlags(), fetchTenants()]);
    setFlags(f);
    setTenants(t);
    if (!tenantId && t[0]) setTenantId(t[0].id);
  }, [tenantId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!tenantId) return;
    void fetchTenant(tenantId)
      .then((data) => {
        const map: Record<string, boolean> = {};
        for (const row of data.tenantFeatureFlags ?? []) {
          map[row.featureFlagId] = row.enabled;
        }
        setOverrides(map);
      })
      .catch(() => setOverrides({}));
  }, [tenantId]);

  return (
    <AcpPage
      title="Feature flags"
      description="Toggle features per tenant — combined with subscription tier requirements."
    >
      <label className="mb-6 block text-sm">
        <span className="mb-1 block text-slate-500">Tenant</span>
        <select
          className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
        >
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <ul className="space-y-3">
        {flags.map((flag) => {
          const enabled = overrides[flag.id] ?? flag.defaultEnabled;
          return (
            <li
              key={flag.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700"
            >
              <div>
                <p className="font-medium">{flag.name}</p>
                <p className="font-mono text-xs text-slate-500">{flag.key}</p>
                {flag.requiredTierKey ? (
                  <p className="text-xs text-amber-600">Min tier: {flag.requiredTierKey}</p>
                ) : null}
              </div>
              <AcpToggle
                checked={enabled}
                onChange={(v) => {
                  setOverrides((prev) => ({ ...prev, [flag.id]: v }));
                  if (tenantId) void toggleTenantFeature(tenantId, flag.id, v);
                }}
              />
            </li>
          );
        })}
      </ul>
    </AcpPage>
  );
}
