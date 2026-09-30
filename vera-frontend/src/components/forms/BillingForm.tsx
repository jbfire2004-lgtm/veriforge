"use client";

import { FormEvent, useState } from "react";
import { Button, Label, Select } from "@/components/ui";
import { updateSubscriptionBilling } from "@/lib/subscription-api";
import type { BillingView } from "@/lib/subscription-api";

export function BillingForm({
  billing,
  onUpdated,
}: {
  billing: BillingView | null;
  onUpdated?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await updateSubscriptionBilling({
        billingPlan: String(fd.get("billingPlan") || undefined) || undefined,
        billingCycle: (String(fd.get("billingCycle") || "") || undefined) as
          | "monthly"
          | "annual"
          | undefined,
      });
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-md gap-3">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div>
        <Label htmlFor="billingPlan">Plan</Label>
        <Select
          id="billingPlan"
          name="billingPlan"
          defaultValue={billing?.billingPlan ?? "trial"}
        >
          <option value="trial">Trial</option>
          <option value="starter">Starter</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="billingCycle">Billing cycle</Label>
        <Select
          id="billingCycle"
          name="billingCycle"
          defaultValue={billing?.billingCycle ?? "monthly"}
        >
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </Select>
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Update billing"}
      </Button>
    </form>
  );
}
