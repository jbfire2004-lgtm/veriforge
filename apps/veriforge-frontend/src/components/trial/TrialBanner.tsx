import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../lib/format";

export function TrialBanner() {
  const { organization, daysRemaining, subscriptionStatus, hasActiveAccess } = useAuth();

  if (!organization) return null;

  if (organization.isTrialActive && subscriptionStatus !== "active") {
    return (
      <div className="border-b border-amber-200/80 bg-amber-50 px-4 py-2.5 text-sm text-amber-950" data-testid="trial-banner">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
          <p>
            <span className="font-semibold">{daysRemaining} day{daysRemaining === 1 ? "" : "s"} left</span>{" "}
            in your trial · ends {formatDate(organization.trialEnd)}
          </p>
          <Link to="/billing/activate" className="font-semibold text-forge-forest underline-offset-2 hover:underline">
            Activate subscription
          </Link>
        </div>
      </div>
    );
  }

  if (!hasActiveAccess) {
    return (
      <div className="border-b border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
          <p>Your trial has ended. Activate a subscription to continue using VeriForge modules.</p>
          <Link to="/billing/activate" className="font-semibold underline-offset-2 hover:underline">
            Activate now
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
