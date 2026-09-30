"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import type { SubscriptionCatalog } from "@/lib/subscriptions-api";
import { cn } from "@/src/lib/utils";

type Props = {
  plans: SubscriptionCatalog["plans"];
  currentPlanKey?: string | null;
};

function formatPrice(amount: number, currency: string) {
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PricingCards({ plans, currentPlanKey }: Props) {
  const displayPlans = plans.filter((p) =>
    ["basic", "pro", "pm", "predictive", "enterprise"].includes(p.key),
  );

  return (
    <section aria-labelledby="pricing-heading" className="space-y-6">
      <div>
        <h2 id="pricing-heading" className="text-2xl font-semibold text-[#2A2E33]">
          Pricing
        </h2>
        <p className="mt-1 text-sm text-[#5a6b7c]">
          Choose a plan — upgrade anytime. Specialized tiers (Autonomous, Command Center, etc.)
          are available from the full comparison above.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {displayPlans.map((plan) => {
          const isCurrent = currentPlanKey === plan.key;
          return (
            <article
              key={plan.key}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 shadow-sm",
                plan.highlighted
                  ? "border-teal-500/40 bg-gradient-to-b from-teal-50/80 to-white ring-2 ring-teal-500/20"
                  : "border-[#2A2E33]/10 bg-white",
              )}
            >
              {plan.highlighted ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-3 py-0.5 text-xs font-semibold text-white">
                  Most popular
                </span>
              ) : null}
              <h3 className="text-lg font-semibold text-[#2A2E33]">{plan.name}</h3>
              <p className="text-sm text-[#5a6b7c]">{plan.tagline}</p>
              <p className="mt-4 text-3xl font-bold text-[#2A2E33]">
                {formatPrice(plan.priceMonthly, plan.currency)}
                {plan.priceMonthly > 0 ? (
                  <span className="text-base font-normal text-[#5a6b7c]">/mo</span>
                ) : null}
              </p>
              {plan.priceAnnual > 0 ? (
                <p className="text-xs text-[#5a6b7c]">
                  or {formatPrice(plan.priceAnnual, plan.currency)}/yr (save 20%)
                </p>
              ) : null}
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-teal-700">
                {plan.modules.join(" · ")}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#2A2E33]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/subscriptions/checkout?plan=${encodeURIComponent(plan.key)}`}
                className={cn(
                  "mt-6 block rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition",
                  isCurrent
                    ? "border border-slate-200 bg-slate-100 text-slate-600"
                    : plan.highlighted
                      ? "bg-teal-600 text-white hover:bg-teal-700"
                      : "border border-[#2A2E33]/15 bg-white text-[#2A2E33] hover:border-teal-500/40 hover:bg-teal-50",
                )}
                aria-disabled={isCurrent}
              >
                {isCurrent ? "Current plan" : "Choose plan"}
              </Link>
            </article>
          );
        })}
      </div>
      <p className="text-center text-sm text-[#5a6b7c]">
        Need Autonomous, Command Center, Global Intelligence, or Marketplace?{" "}
        <Link href="/subscriptions/checkout" className="font-medium text-teal-700 hover:underline">
          Open checkout
        </Link>{" "}
        to select any tier.
      </p>
    </section>
  );
}
