"use client";

import { useEffect, useState } from "react";
import {
  assignTenantAddons,
  assignTenantSubscription,
  fetchFeatureFlags,
  fetchSubscriptionTiers,
  fetchTenant,
  type AcpFeatureFlag,
} from "@/lib/acp-api";
import { AcpToggle } from "@/components/vera-access/AcpToggle";

const MODULE_FEATURE_KEYS = [
  "hub.social",
  "core.workers",
  "core.equipment",
  "core.training",
  "pm.sms",
  "pm.inspections.ai",
  "contractor.portal",
  "pm.substance_testing",
  "pm.predictive",
];

type Props = {
  tenantId: string;
  onUpdated?: () => void;
};

export function TenantModulesPanel({ tenantId, onUpdated }: Props) {
  const [flags, setFlags] = useState<AcpFeatureFlag[]>([]);
  const [tiers, setTiers] = useState<Array<{ id: string; key: string; name: string }>>([]);
  const [tierId, setTierId] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void Promise.all([fetchFeatureFlags(), fetchSubscriptionTiers()]).then(([f, t]) => {
      setFlags(f);
      setTiers(t);
    });
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    void fetchTenant(tenantId).then((t) => {
      if (t.subscription?.tier?.key) {
        const match = tiers.find((x) => x.key === t.subscription?.tier?.key);
        if (match) setTierId(match.id);
      }
      const map: Record<string, boolean> = {};
      for (const row of t.tenantFeatureFlags ?? []) {
        map[row.featureFlagId] = row.enabled;
      }
      for (const flag of flags) {
        if (map[flag.id] === undefined) map[flag.id] = flag.defaultEnabled;
      }
      setEnabled(map);
    });
  }, [tenantId, flags, tiers]);

  async function saveTier() {
    if (!tierId) return;
    setSaving(true);
    try {
      await assignTenantSubscription(tenantId, tierId);
      onUpdated?.();
    } finally {
      setSaving(false);
    }
  }

  async function saveModules() {
    const keys = flags
      .filter((f) => MODULE_FEATURE_KEYS.includes(f.key) && enabled[f.id])
      .map((f) => f.key);
    setSaving(true);
    try {
      await assignTenantAddons(tenantId, keys, true);
      onUpdated?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 space-y-6 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
        Subscription & modules
      </h3>

      <label className="block text-sm">
        <span className="mb-1 block text-slate-500">Subscription tier</span>
        <div className="flex gap-2">
          <select
            className="flex-1 rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            value={tierId}
            onChange={(e) => setTierId(e.target.value)}
          >
            <option value="">Select tier…</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.key})
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={saving || !tierId}
            onClick={() => void saveTier()}
            className="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </label>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Module features
        </p>
        <ul className="space-y-2">
          {flags
            .filter((f) => MODULE_FEATURE_KEYS.includes(f.key))
            .map((flag) => (
              <li
                key={flag.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800"
              >
                <span className="text-sm">{flag.name}</span>
                <AcpToggle
                  checked={enabled[flag.id] ?? flag.defaultEnabled}
                  onChange={(on) => setEnabled((prev) => ({ ...prev, [flag.id]: on }))}
                />
              </li>
            ))}
        </ul>
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveModules()}
          className="mt-3 rounded-lg border border-teal-600 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50"
        >
          Save module toggles
        </button>
      </div>
    </div>
  );
}
