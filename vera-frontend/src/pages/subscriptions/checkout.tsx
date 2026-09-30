"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  fetchSubscriptionCatalog,
  fetchMySubscription,
  purchaseSubscription,
  type SubscriptionCatalog,
} from "@/lib/subscriptions-api";
import { clearAcpAccessCache } from "@/lib/acp-access";
import { AddonSelector } from "@/src/components/subscriptions/AddonSelector";
import { cn } from "@/src/lib/utils";

const ALL_PLAN_KEYS = [
  "basic",
  "pro",
  "pm",
  "predictive",
  "autonomous",
  "enterprise",
  "command_center",
  "global_intelligence",
  "marketplace",
] as const;

export default function SubscriptionsCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams?.get("plan") ?? "pm";

  const [catalog, setCatalog] = useState<SubscriptionCatalog | null>(null);
  const [planKey, setPlanKey] = useState(initialPlan);
  const [addonKeys, setAddonKeys] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const load = useCallback(async () => {
    const cat = await fetchSubscriptionCatalog();
    setCatalog(cat);
    try {
      const me = await fetchMySubscription();
      if (me?.subscription?.tier?.key) {
        const match = cat.plans.find((p) => p.acpTierKey === me.subscription?.tier?.key);
        if (match) setPlanKey(match.key);
      }
    } catch {
      /* guest or no tenant yet */
    }
  }, []);

  useEffect(() => {
    void load().catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load checkout"),
    );
  }, [load]);

  const plan = useMemo(
    () => catalog?.plans.find((p) => p.key === planKey) ?? catalog?.plans.find((p) => p.key === "pm"),
    [catalog, planKey],
  );

  const addonTotal = useMemo(() => {
    if (!catalog) return 0;
    return addonKeys.reduce((sum, key) => {
      const a = catalog.addons.find((x) => x.key === key);
      return sum + (a?.priceMonthly ?? 0);
    }, 0);
  }, [catalog, addonKeys]);

  const totalMonthly = (plan?.priceMonthly ?? 0) + addonTotal;

  async function handleConfirm() {
    if (!plan) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await purchaseSubscription({
        planKey: plan.key,
        addonKeys: addonKeys.length ? addonKeys : undefined,
      });
      clearAcpAccessCache();
      setConfirmed(true);
      setTimeout(() => {
        router.push(result.redirectUrl ?? "/welcome");
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Purchase failed — sign in as a company admin");
    } finally {
      setSubmitting(false);
    }
  }

  if (!catalog) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-[#5a6b7c]">
        Loading checkout…
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold text-[#2A2E33]">Subscription confirmed</h1>
        <p className="mt-2 text-[#5a6b7c]">Redirecting to Vera Hub…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-[#2A2E33]/10 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/subscriptions" className="text-sm font-medium text-teal-700 hover:underline">
            ← Plans
          </Link>
          <span className="text-sm font-semibold text-[#2A2E33]">Checkout</span>
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl gap-8 px-4 py-10 lg:grid-cols-5">
        <div className="space-y-8 lg:col-span-3">
          <section className="rounded-2xl border border-[#2A2E33]/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#2A2E33]">1. Select plan</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {catalog.plans
                .filter((p) => ALL_PLAN_KEYS.includes(p.key as (typeof ALL_PLAN_KEYS)[number]))
                .map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPlanKey(p.key)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left text-sm transition",
                      planKey === p.key
                        ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500/30"
                        : "border-slate-200 hover:border-teal-300",
                    )}
                  >
                    <span className="font-semibold text-[#2A2E33]">{p.name}</span>
                    <span className="mt-0.5 block text-[#5a6b7c]">
                      {p.priceMonthly === 0 ? "Free" : `$${p.priceMonthly}/mo`}
                    </span>
                  </button>
                ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#2A2E33]/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#2A2E33]">2. Select add-ons</h2>
            <div className="mt-4">
              <AddonSelector
                addons={catalog.addons}
                selected={addonKeys}
                onChange={setAddonKeys}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[#2A2E33]/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#2A2E33]">3. Confirm</h2>
            <p className="mt-2 text-sm text-[#5a6b7c]">
              This updates your tenant subscription and enables feature flags. Payment
              integration is simulated for demo — no card required.
            </p>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            <button
              type="button"
              disabled={submitting || !plan}
              onClick={() => void handleConfirm()}
              className="mt-4 w-full rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {submitting ? "Processing…" : "Confirm subscription"}
            </button>
            <p className="mt-3 text-center text-xs text-[#5a6b7c]">
              <Link href="/auth/login" className="text-teal-700 hover:underline">
                Sign in
              </Link>{" "}
              as a company admin if checkout fails.
            </p>
          </section>
        </div>

        <aside className="lg:col-span-2">
          <div className="sticky top-8 rounded-2xl border border-[#2A2E33]/10 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-[#2A2E33]">Order summary</h2>
            {plan ? (
              <>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[#5a6b7c]">{plan.name} plan</dt>
                    <dd className="font-medium">
                      {plan.priceMonthly === 0 ? "Free" : `$${plan.priceMonthly}/mo`}
                    </dd>
                  </div>
                  {addonKeys.map((key) => {
                    const a = catalog.addons.find((x) => x.key === key);
                    if (!a) return null;
                    return (
                      <div key={key} className="flex justify-between">
                        <dt className="text-[#5a6b7c]">{a.name}</dt>
                        <dd className="font-medium">${a.priceMonthly}/mo</dd>
                      </div>
                    );
                  })}
                </dl>
                <div className="mt-4 border-t border-slate-100 pt-4 flex justify-between font-semibold text-[#2A2E33]">
                  <span>Total</span>
                  <span>{totalMonthly === 0 ? "Free" : `$${totalMonthly}/mo`}</span>
                </div>
                <ul className="mt-4 space-y-1 text-xs text-[#5a6b7c]">
                  {plan.modules.map((m) => (
                    <li key={m}>✓ {m}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </aside>
      </main>
    </div>
  );
}
