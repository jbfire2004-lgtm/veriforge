import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { adminApi, getApiErrorMessage } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { BillingCycle, ModuleCode, OrgStatus } from "../../types/api";
import { MODULE_META } from "../../types/api";

const MODULE_ORDER: ModuleCode[] = ["vericore", "veripm", "verihub"];

export function AdminOrgDetail() {
  const { orgId = "" } = useParams();
  const qc = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const detail = useQuery({
    queryKey: ["admin-org", orgId],
    queryFn: async () => {
      const { data } = await adminApi.getOrganization(orgId);
      return data;
    },
    enabled: Boolean(orgId),
  });

  useEffect(() => {
    if (detail.data?.organization.onboardingNotes != null) {
      setNotes(detail.data.organization.onboardingNotes);
    }
  }, [detail.data?.organization.onboardingNotes]);

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ["admin-org", orgId] });
    await qc.invalidateQueries({ queryKey: ["admin-orgs"] });
    await qc.invalidateQueries({ queryKey: ["admin-onboarding"] });
  };

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setError(null);
    setMessage(null);
    try {
      await fn();
      await invalidate();
      setMessage(ok);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const toggleModule = useMutation({
    mutationFn: async (payload: { code: ModuleCode; enabled: boolean }) => {
      await adminApi.patchModules(orgId, [payload]);
    },
    onSuccess: () => void invalidate(),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  if (detail.isLoading) return <p className="text-white/60">Loading organization…</p>;
  if (detail.error) return <p className="text-red-300">{getApiErrorMessage(detail.error)}</p>;
  if (!detail.data) return null;

  const { organization: org, modules, trial } = detail.data;
  const enabledMap = Object.fromEntries(
    modules.map((m) => [m.module.code, m.enabled]),
  ) as Partial<Record<ModuleCode, boolean>>;

  return (
    <div className="space-y-8">
      <div>
        <Link to="/admin/organizations" className="text-sm text-emerald-300 hover:underline">
          ← Organizations
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold">{org.name}</h1>
        <p className="text-white/50">
          {org.slug} · {org.billingEmail ?? "no billing email"}
        </p>
      </div>

      {message && <p className="text-sm text-emerald-300">{message}</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Org status" value={org.status} />
        <InfoCard label="Billing cycle" value={org.defaultBillingCycle} />
        <InfoCard
          label="Subscription"
          value={trial.subscriptionStatus ?? "none"}
        />
        <InfoCard label="Trial active" value={org.isTrialActive ? "yes" : "no"} />
        <InfoCard label="Trial start" value={formatDate(org.trialStart)} />
        <InfoCard
          label="Trial end"
          value={`${formatDate(org.trialEnd)} (${trial.daysRemaining}d left)`}
        />
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-display text-lg font-semibold">Modules</h2>
        <ul className="mt-4 space-y-3">
          {MODULE_ORDER.map((code) => {
            const enabled = Boolean(enabledMap[code]);
            return (
              <li
                key={code}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{MODULE_META[code].label}</p>
                  <p className="text-xs text-white/50">{enabled ? "Enabled" : "Disabled"}</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
                  disabled={toggleModule.isPending}
                  onClick={() => toggleModule.mutate({ code, enabled: !enabled })}
                >
                  {enabled ? "Disable" : "Enable"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-display text-lg font-semibold">Controls</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold hover:bg-emerald-600"
            onClick={() =>
              void run(() => adminApi.extendTrial(orgId, 7), "Trial extended by 7 days")
            }
          >
            Extend trial +7 days
          </button>
          <CycleButtons
            current={org.defaultBillingCycle}
            onSelect={(billingCycle) =>
              void run(
                () => adminApi.patchSubscription(orgId, { billingCycle }),
                `Billing cycle set to ${billingCycle}`,
              )
            }
          />
          {org.status !== "suspended" ? (
            <button
              type="button"
              className="rounded-lg border border-red-400/40 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10"
              onClick={() =>
                void run(
                  () => adminApi.patchSubscription(orgId, { status: "suspended" }),
                  "Organization suspended",
                )
              }
            >
              Suspend org
            </button>
          ) : (
            <button
              type="button"
              className="rounded-lg border border-emerald-400/40 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-500/10"
              onClick={() =>
                void run(
                  () => adminApi.patchSubscription(orgId, { status: "active" as OrgStatus }),
                  "Organization reactivated",
                )
              }
            >
              Reactivate org
            </button>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-display text-lg font-semibold">Onboarding notes</h2>
        <textarea
          className="mt-3 min-h-[120px] w-full rounded-lg border border-white/15 bg-[#0c1210] px-3 py-2 text-sm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Manual onboarding steps, calls, blockers…"
        />
        <button
          type="button"
          className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15"
          onClick={() =>
            void run(
              () => adminApi.patchOnboarding(orgId, { notes }),
              "Onboarding notes saved",
            )
          }
        >
          Save notes
        </button>
      </section>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-white/45">{label}</p>
      <p className="mt-1 font-medium capitalize">{value}</p>
    </div>
  );
}

function CycleButtons({
  current,
  onSelect,
}: {
  current: BillingCycle;
  onSelect: (cycle: BillingCycle) => void;
}) {
  return (
    <>
      {(["monthly", "annual"] as BillingCycle[]).map((cycle) => (
        <button
          key={cycle}
          type="button"
          disabled={current === cycle}
          className="rounded-lg border border-white/20 px-3 py-2 text-sm capitalize disabled:opacity-40"
          onClick={() => onSelect(cycle)}
        >
          Set {cycle}
        </button>
      ))}
    </>
  );
}
