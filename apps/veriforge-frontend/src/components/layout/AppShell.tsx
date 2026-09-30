import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { TrialBanner } from "../trial/TrialBanner";
import { TrialLockScreen } from "../trial/TrialLockScreen";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const ALLOW_WHEN_LOCKED = ["/billing/activate", "/settings", "/dashboard"];

export function AppShell() {
  const { hasActiveAccess } = useAuth();
  const location = useLocation();

  const allowLocked =
    ALLOW_WHEN_LOCKED.some((p) => location.pathname.startsWith(p)) ||
    location.pathname.startsWith("/billing");

  return (
    <div className="min-h-screen">
      <Navigation />
      <TrialBanner />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {!hasActiveAccess && !allowLocked ? <TrialLockScreen /> : <Outlet />}
      </main>
    </div>
  );
}
