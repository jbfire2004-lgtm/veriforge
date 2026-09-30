"use client";

import { HubWelcomeBanner } from "./HubWelcomeBanner";
import { HubModuleGrid } from "./HubModuleGrid";
import { HubWorkerWalletCard } from "./HubWorkerWalletCard";
import { HubDailyWidgets } from "../widgets/HubDailyWidgets";
import { useHubAccess } from "@/lib/hub/use-hub-access";

type Props = {
  userName?: string | null;
  role?: string | null;
  /** Hide wallet card on readiness sub-page */
  showWallet?: boolean;
  /** Hide daily widgets when on readiness page */
  showWidgets?: boolean;
};

/** ACP-aware hub workspace: banner, module nav, modules, wallet, daily widgets. */
export function HubWorkspaceShell({
  userName,
  role,
  showWallet = true,
  showWidgets = true,
}: Props) {
  const { modules, loading, canShowAdminPanel, subscriptionLabel } = useHubAccess(role);

  return (
    <div className="space-y-10">
      <HubWelcomeBanner
        userName={userName}
        subscriptionLabel={subscriptionLabel()}
        showAdminPanel={canShowAdminPanel()}
      />

      <HubModuleGrid modules={modules} loading={loading} />

      {showWallet ? <HubWorkerWalletCard /> : null}

      {showWidgets ? <HubDailyWidgets /> : null}
    </div>
  );
}
