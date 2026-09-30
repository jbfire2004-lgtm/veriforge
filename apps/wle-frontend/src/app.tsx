import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/app-shell";
import { WorkerDashboardPage } from "./pages/worker-dashboard.page";
import { WorkerDetailPage } from "./pages/worker-detail.page";
import { ExpiryRulesPage } from "./pages/expiry-rules.page";
import { PresenceTrackingPage } from "./pages/presence-tracking.page";
import { CompanyDashboardPage } from "./pages/company-dashboard.page";
import { PresenceScanPage } from "./pages/presence-scan.page";
import { WorkerPresenceHistoryPage } from "./pages/worker-presence-history.page";
import { SupervisorRequestsPage } from "./pages/supervisor-requests.page";
import { WorkerImportExportPage } from "./pages/worker-import-export.page";
import { OrientationAdminPage } from "./pages/orientation-admin.page";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<WorkerDashboardPage />} />
        <Route path="/workers/:id" element={<WorkerDetailPage />} />
        <Route path="/rules" element={<ExpiryRulesPage />} />
        <Route path="/presence" element={<PresenceTrackingPage />} />
        <Route path="/presence/scan" element={<PresenceScanPage />} />
        <Route path="/presence/history" element={<WorkerPresenceHistoryPage />} />
        <Route path="/supervisor/requests" element={<SupervisorRequestsPage />} />
        <Route path="/workers/import-export" element={<WorkerImportExportPage />} />
        <Route path="/orientation" element={<OrientationAdminPage />} />
        <Route path="/company" element={<CompanyDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
