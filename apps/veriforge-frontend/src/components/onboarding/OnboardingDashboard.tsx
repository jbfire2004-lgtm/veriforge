import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { formatDate } from "../../lib/format";
import { MODULE_META, type ModuleCode } from "../../types/api";
import { OnboardingChecklist } from "./OnboardingChecklist";

export function OnboardingDashboard() {
  const { organization, modules, daysRemaining, subscriptionStatus, hasActiveAccess } = useAuth();
  const { canManageBilling } = usePermissions();

  const enabledCodes = modules.filter((m) => m.enabled).map((m) => m.module.code as ModuleCode);

  return (
    <div className="space-y-8" data-testid="onboarding-dashboard">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-forge-moss">
            Onboarding
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-forge-ink">
            Welcome, {organization?.name}
          </h1>
          <p className="mt-2 max-w-2xl text-forge-steel">
            {organization?.isTrialActive
              ? `Your trial is active with ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining (ends ${formatDate(organization.trialEnd)}).`
              : hasActiveAccess
                ? "Your subscription is active. Continue configuring your workspace."
                : "Your trial has ended. Activate billing to unlock modules."}
          </p>
        </div>
        {canManageBilling && subscriptionStatus !== "active" && (
          <Link to="/billing/activate" className="vf-btn-primary">
            Activate subscription
          </Link>
        )}
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Trial days left" value={organization?.isTrialActive ? String(daysRemaining) : "0"} />
        <Stat label="Trial end" value={formatDate(organization?.trialEnd)} />
        <Stat
          label="Subscription"
          value={subscriptionStatus ?? (organization?.isTrialActive ? "trialing" : "none")}
        />
      </section>

      <section className="vf-panel p-5">
        <h2 className="font-display text-lg font-semibold text-forge-ink">Enabled modules</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {enabledCodes.length === 0 && (
            <li className="text-sm text-forge-steel">No modules enabled.</li>
          )}
          {enabledCodes.map((code) => (
            <li key={code}>
              <Link
                to={MODULE_META[code].path}
                className="block rounded-lg border border-forge-sand bg-forge-mist/50 p-4 transition hover:border-forge-moss/50"
              >
                <p className="font-semibold text-forge-ink">{MODULE_META[code].label}</p>
                <p className="mt-1 text-sm text-forge-steel">{MODULE_META[code].blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <OnboardingChecklist enabledModules={enabledCodes} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="vf-panel px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-forge-steel">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold capitalize text-forge-ink">{value}</p>
    </div>
  );
}
