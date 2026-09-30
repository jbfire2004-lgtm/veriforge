/** Stable device identifier for offline sync (shared across field + PM offline mode). */
export function getOfflineDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("vera:field:clientId");
  if (!id) {
    id = `field_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("vera:field:clientId", id);
  }
  return id;
}

export function getOfflineScope(): { companyId?: number; projectId?: number } {
  if (typeof window === "undefined") return {};
  const companyId = localStorage.getItem("vera:offline:companyId");
  const projectId = localStorage.getItem("vera:offline:projectId");
  return {
    companyId: companyId ? parseInt(companyId, 10) : undefined,
    projectId: projectId ? parseInt(projectId, 10) : undefined,
  };
}

export function setOfflineScope(scope: { companyId?: number; projectId?: number }): void {
  if (typeof window === "undefined") return;
  if (scope.companyId != null) {
    localStorage.setItem("vera:offline:companyId", String(scope.companyId));
  }
  if (scope.projectId != null) {
    localStorage.setItem("vera:offline:projectId", String(scope.projectId));
  }
}
