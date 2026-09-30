import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RequirePlatformAdmin } from "./components/auth/RequirePlatformAdmin";
import { AppShell } from "./components/layout/AppShell";
import { PublicShell } from "./components/layout/PublicShell";
import { AdminShell } from "./components/layout/AdminShell";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { PublicHubPage } from "./pages/PublicHubPage";

const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const ActivateSubscriptionPage = lazy(() =>
  import("./pages/ActivateSubscriptionPage").then((m) => ({
    default: m.ActivateSubscriptionPage,
  })),
);
const VeriCorePage = lazy(() =>
  import("./pages/modules/modulePages").then((m) => ({ default: m.VeriCorePage })),
);
const VeriPmPage = lazy(() =>
  import("./pages/modules/modulePages").then((m) => ({ default: m.VeriPmPage })),
);
const VeriHubPage = lazy(() =>
  import("./pages/modules/modulePages").then((m) => ({ default: m.VeriHubPage })),
);
const AdminOrganizationsPage = lazy(() =>
  import("./pages/admin/AdminOrganizationsPage").then((m) => ({
    default: m.AdminOrganizationsPage,
  })),
);
const AdminOrganizationDetailPage = lazy(() =>
  import("./pages/admin/AdminOrganizationDetailPage").then((m) => ({
    default: m.AdminOrganizationDetailPage,
  })),
);
const AdminOnboardingPage = lazy(() =>
  import("./pages/admin/AdminOnboardingPage").then((m) => ({
    default: m.AdminOnboardingPage,
  })),
);
const AdminPricingPage = lazy(() =>
  import("./pages/admin/AdminPricingPage").then((m) => ({
    default: m.AdminPricingPage,
  })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-forge-steel">
      Loading…
    </div>
  );
}

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<PublicShell />}>
        <Route path="/hub" element={<PublicHubPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route
            path="/dashboard"
            element={
              <Lazy>
                <DashboardPage />
              </Lazy>
            }
          />
          <Route
            path="/settings"
            element={
              <Lazy>
                <SettingsPage />
              </Lazy>
            }
          />
          <Route
            path="/billing/activate"
            element={
              <Lazy>
                <ActivateSubscriptionPage />
              </Lazy>
            }
          />
          <Route
            path="/modules/vericore"
            element={
              <Lazy>
                <VeriCorePage />
              </Lazy>
            }
          />
          <Route
            path="/modules/veripm"
            element={
              <Lazy>
                <VeriPmPage />
              </Lazy>
            }
          />
          <Route
            path="/modules/verihub"
            element={
              <Lazy>
                <VeriHubPage />
              </Lazy>
            }
          />
        </Route>

        <Route element={<RequirePlatformAdmin />}>
          <Route element={<AdminShell />}>
            <Route path="/admin" element={<Navigate to="/admin/organizations" replace />} />
            <Route
              path="/admin/organizations"
              element={
                <Lazy>
                  <AdminOrganizationsPage />
                </Lazy>
              }
            />
            <Route
              path="/admin/organizations/:orgId"
              element={
                <Lazy>
                  <AdminOrganizationDetailPage />
                </Lazy>
              }
            />
            <Route
              path="/admin/onboarding"
              element={
                <Lazy>
                  <AdminOnboardingPage />
                </Lazy>
              }
            />
            <Route
              path="/admin/pricing"
              element={
                <Lazy>
                  <AdminPricingPage />
                </Lazy>
              }
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
