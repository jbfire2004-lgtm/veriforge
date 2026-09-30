import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";

export function TrialLockScreen() {
  const { organization } = useAuth();
  const { canManageBilling } = usePermissions();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-20 text-center">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-forge-moss">
        Access locked
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold text-forge-ink">
        Activate subscription to continue
      </h1>
      <p className="mt-3 text-forge-steel">
        {organization?.name ?? "Your organization"}’s trial has ended and paid access is not active.
        Module features are locked until billing is set up.
      </p>
      {canManageBilling ? (
        <Link to="/billing/activate" className="vf-btn-primary mt-8">
          Activate subscription
        </Link>
      ) : (
        <p className="mt-8 text-sm text-forge-steel">
          Ask an Owner or Admin to activate billing for this organization.
        </p>
      )}
    </div>
  );
}
