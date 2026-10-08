"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  fetchMySubscription,
  fetchSubscriptionCatalog,
  type SubscriptionCatalog,
} from "@/lib/subscriptions-api";
import { clearAcpAccessCache } from "@/lib/acp-access";
import { ModuleCards } from "@/src/components/subscriptions/ModuleCards";
import { FeatureComparisonTable } from "@/src/components/subscriptions/FeatureComparisonTable";
import { PricingCards } from "@/src/components/subscriptions/PricingCards";

export default function SubscriptionsPage() {
  const [catalog, setCatalog] = useState<SubscriptionCatalog | null>(null);
  const [currentPlanKey, setCurrentPlanKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [cat, me] = await Promise.all([
          fetchSubscriptionCatalog(),
          fetchMySubscription().catch(() => null),
        ]);
        setCatalog(cat);
        const tierKey = me?.subscription?.tier?.key ?? null;
        if (tierKey) {
          const match = cat.plans.find((p) => p.acpTierKey === tierKey);
          setCurrentPlanKey(match?.key ?? tierKey);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load subscriptions");
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-600">{error}</p>
        <button
          type="button"
          className="mt-4 text-teal-700 underline"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-[#5a6b7c]">
        Loading Vera subscriptions…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-[#2A2E33]/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/welcome" className="text-sm font-medium text-teal-700 hover:underline">
            ← Vera Hub
          </Link>
          <Link
            href="/subscriptions/checkout"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Checkout
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6">
        <section className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-800">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Vera subscriptions
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#2A2E33] sm:text-5xl">
            Choose the right safety platform for your team
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#5a6b7c]">
            Hub, Core, and PM — plus predictive, autonomous, and enterprise add-ons.
            One subscription powers permissions and feature flags across your tenant.
          </p>
          {currentPlanKey ? (
            <p className="mt-4 text-sm text-teal-700">
              Current plan: <strong className="capitalize">{currentPlanKey}</strong>
            </p>
          ) : null}
        </section>

        <ModuleCards modules={catalog.modules} />
        <PricingCards plans={catalog.plans} currentPlanKey={currentPlanKey} />
        <FeatureComparisonTable comparison={catalog.comparison} />

        <section className="rounded-2xl bg-[#2A2E33] px-8 py-10 text-center text-white">
          <h2 className="text-2xl font-semibold">Ready to subscribe?</h2>
          <p className="mx-auto mt-2 max-w-lg text-slate-300">
            Select your plan and add-ons — we&apos;ll update your tenant subscription and
            enable features instantly.
          </p>
          <Link
            href="/subscriptions/checkout"
            className="mt-6 inline-block rounded-xl bg-teal-500 px-8 py-3 font-semibold text-white hover:bg-teal-400"
            onClick={() => clearAcpAccessCache()}
          >
            Go to checkout
          </Link>
        </section>
      </main>
    </div>
  );
}
