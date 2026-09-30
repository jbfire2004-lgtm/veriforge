import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { orgApi, getApiErrorMessage } from "../lib/api";
import { formatCents } from "../lib/format";
import { usePricingQuote } from "../hooks/usePricingQuote";
import type { ModuleCode } from "../types/api";

/**
 * Payment activation placeholder.
 * Production: redirect to Stripe Checkout / Customer Portal session from the API.
 * Current flow calls POST /organizations/:orgId/billing/convert (requires Stripe price IDs).
 */
export function ActivateSubscriptionPage() {
  const { organization, modules, refreshSession } = useAuth();
  const { canManageBilling } = usePermissions();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabled = modules
    .filter((m) => m.enabled)
    .map((m) => m.module.code as ModuleCode);

  const quote = usePricingQuote(enabled, organization?.defaultBillingCycle ?? "monthly");

  if (!canManageBilling) {
    return (
      <p className="text-forge-steel">
        You don’t have permission to manage billing. Contact an Owner or Admin.
      </p>
    );
  }

  const activate = async () => {
    if (!organization) return;
    setBusy(true);
    setError(null);
    try {
      await orgApi.convertBilling(organization.id, {
        billingCycle: organization.defaultBillingCycle,
      });
      await refreshSession();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Could not activate. Ensure Stripe is configured and module prices have external_price_id.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6" data-testid="activate-subscription-page">
      <div>
        <h1 className="font-display text-3xl font-bold text-forge-ink">Activate subscription</h1>
        <p className="mt-2 text-forge-steel">
          Convert your trial into a paid plan for{" "}
          <span className="font-medium text-forge-ink">{organization?.name}</span>.
        </p>
      </div>

      <div className="vf-panel space-y-3 p-5 text-sm">
        <p>
          Cycle:{" "}
          <span className="font-semibold capitalize">
            {organization?.defaultBillingCycle ?? "monthly"}
          </span>
        </p>
        <p>
          Modules:{" "}
          <span className="font-semibold">{enabled.join(", ") || "none"}</span>
        </p>
        <p>
          Total:{" "}
          <span className="font-semibold tabular-nums">
            {quote.data
              ? formatCents(quote.data.selectedCycleTotalCents, quote.data.currency)
              : "—"}
          </span>
        </p>
      </div>

      {error && <p className="text-sm text-forge-danger">{error}</p>}

      <button
        type="button"
        className="vf-btn-primary"
        data-testid="activate-subscription-btn"
        disabled={busy || enabled.length === 0}
        onClick={() => void activate()}
      >
        {busy ? "Activating…" : "Confirm & activate with Stripe"}
      </button>
    </div>
  );
}
