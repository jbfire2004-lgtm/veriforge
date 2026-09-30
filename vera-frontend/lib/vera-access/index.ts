/**
 * Vera Access, Subscription & Control — unified client surface.
 */
export {
  fetchAcpAccessMe,
  fetchAcpHubModules,
  fetchAcpModuleCards,
  checkAcpAccess,
  type AcpAccessContext,
} from "@/lib/acp-api";

export {
  getAcpAccessContext,
  getHubModuleAllowMap,
  clearAcpAccessCache,
  hasAcpPermission,
  hasAcpFeature,
  hrefToHubModuleId,
  isPmLinkAllowedByAcp,
} from "@/lib/acp-access";

export {
  fetchSubscriptionCatalog,
  fetchMySubscription,
  purchaseSubscription,
  purchaseAddons,
} from "@/lib/subscriptions-api";

export {
  fetchHubWidgetsSummary,
  fetchHubModules,
  type HubWidgetsBundle,
  type HubModuleCard,
} from "@/lib/hub/hub-dashboard-api";

export { useHubAccess } from "@/lib/hub/use-hub-access";
export { useAcpHubModules } from "@/lib/acp/use-acp-hub-modules";
export { useModuleAccess } from "@/lib/vera-access/use-module-access";
export { VeraModuleBoundary } from "@/components/vera-access/VeraModuleBoundary";
export { VeraAccessGate } from "@/components/vera-access/VeraAccessGate";
