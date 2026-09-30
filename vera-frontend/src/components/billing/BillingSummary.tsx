"use client";

import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { formatCents, type BillingView, type ModulesView } from "@/lib/subscription-api";
import { StatusIndicator } from "@/components/ui/status-indicator";

export function BillingSummary({
  billing,
  modules,
}: {
  billing: BillingView | null;
  modules?: ModulesView | null;
}) {
  if (!billing) {
    return <p className="text-sm text-zinc-500">Loading billing…</p>;
  }
  const cycle = billing.billingCycle;
  const total =
    cycle === "annual"
      ? billing.totals.annualTotalCents
      : billing.totals.monthlyTotalCents;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-zinc-500">Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-lg font-semibold capitalize">{billing.billingPlan}</p>
          <StatusIndicator label={billing.billingStatus} tone="info" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-zinc-500">
            Estimated {cycle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{formatCents(total)}</p>
          {billing.isTrialActive ? (
            <p className="text-sm text-emerald-700">Trial active</p>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-normal text-zinc-500">Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {modules?.totals.enabledCount ?? billing.totals.enabledCount}
          </p>
          <p className="text-xs text-zinc-500">{billing.billingEmail ?? "No billing email"}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function PlanSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (plan: string) => void;
}) {
  const plans = ["trial", "starter", "professional", "enterprise"];
  return (
    <div className="flex flex-wrap gap-2">
      {plans.map((plan) => (
        <Button
          key={plan}
          type="button"
          size="sm"
          variant={value === plan ? "primary" : "outline"}
          onClick={() => onChange(plan)}
          className="capitalize"
        >
          {plan}
        </Button>
      ))}
    </div>
  );
}

export function PaymentHistory({
  items = [],
}: {
  items?: { id: string; label: string; amountCents: number; date: string }[];
}) {
  if (!items.length) {
    return (
      <p className="text-sm text-zinc-500">
        Payment history scaffold — connect Stripe invoices when ready.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-zinc-200 border border-zinc-200 bg-white">
      {items.map((row) => (
        <li key={row.id} className="flex justify-between px-4 py-3 text-sm">
          <span>
            {row.label}
            <span className="ml-2 text-zinc-500">{row.date}</span>
          </span>
          <span className="font-mono">{formatCents(row.amountCents)}</span>
        </li>
      ))}
    </ul>
  );
}
