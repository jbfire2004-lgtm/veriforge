import { API_URL, apiFetchJson } from "./api-fetch";

const BASE = `${API_URL}/api/v1/acp`;

export type AcpAccessContext = {
  userId: number;
  tenantId: string | null;
  legacyRole: string;
  permissions: string[];
  features: string[];
  subscriptionTierKey: string | null;
  subscriptionStatus: string | null;
  isPlatformAdmin: boolean;
};

export type AcpTenant = {
  id: string;
  slug: string;
  name: string;
  companyId: number | null;
  status: string;
  subscription?: { tier: { key: string; name: string }; status: string } | null;
  _count?: { users: number };
};

export type AcpRole = {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  tenantId?: string | null;
  isSystem: boolean;
  permissions?: Array<{ permission: { id: string; key: string; module: string } }>;
};

export type AcpPermission = {
  id: string;
  key: string;
  module: string;
  action: string;
  description?: string | null;
};

export type AcpFeatureFlag = {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  defaultEnabled: boolean;
  requiredTierKey?: string | null;
  module?: string | null;
};

export type AcpUserRow = {
  id: number;
  email: string;
  username: string;
  role: string;
  active?: boolean;
  acpTenantId: string | null;
  acpUserRoles: Array<{ role: { id: string; key: string; name: string } }>;
};

export type AcpAuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  actor?: { email: string } | null;
};

const ACCESS_BASE = `${API_URL}/api/v1/access`;

export async function fetchAcpAccessMe() {
  return apiFetchJson<AcpAccessContext>(`${ACCESS_BASE}/me`);
}

export async function fetchAcpHubModules() {
  return apiFetchJson<Array<{ moduleId: string; allowed: boolean; reason?: string }>>(
    `${ACCESS_BASE}/hub-modules`,
  );
}

export async function fetchAcpModuleCards() {
  return apiFetchJson<
    Array<{
      key: string;
      title: string;
      description: string;
      href: string;
      allowed: boolean;
      reason?: string;
      features: string[];
    }>
  >(`${ACCESS_BASE}/modules`);
}

export async function checkAcpAccess(body: {
  permission?: string;
  feature?: string;
  module?: string;
  minTier?: string;
}) {
  return apiFetchJson<{ allowed: boolean; reason?: string }>(`${ACCESS_BASE}/check`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchTenants() {
  return apiFetchJson<AcpTenant[]>(`${BASE}/tenants`);
}

export async function fetchTenant(id: string) {
  return apiFetchJson<
    AcpTenant & {
      tenantFeatureFlags?: Array<{ featureFlagId: string; enabled: boolean }>;
    }
  >(`${BASE}/tenants/${id}`);
}

export async function createTenant(body: {
  slug: string;
  name: string;
  companyId?: number;
}) {
  return apiFetchJson<AcpTenant>(`${BASE}/tenants`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateTenant(id: string, body: Record<string, unknown>) {
  return apiFetchJson<AcpTenant>(`${BASE}/tenants/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteTenant(id: string) {
  return apiFetchJson(`${BASE}/tenants/${id}`, { method: "DELETE" });
}

export async function fetchAcpUsers(tenantId?: string) {
  const q = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
  return apiFetchJson<AcpUserRow[]>(`${BASE}/users${q}`);
}

export async function createAcpUser(body: {
  email: string;
  username: string;
  password: string;
  role?: string;
  acpTenantId?: string;
}) {
  return apiFetchJson(`${BASE}/users`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchAcpUser(userId: number) {
  return apiFetchJson(`${BASE}/users/${userId}`);
}

export async function updateAcpUser(
  userId: number,
  body: { role?: string; acpTenantId?: string | null; active?: boolean },
) {
  return apiFetchJson(`${BASE}/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function setUserActive(userId: number, active: boolean) {
  return apiFetchJson(`${BASE}/users/${userId}/active`, {
    method: "PUT",
    body: JSON.stringify({ active }),
  });
}

export async function deleteAcpUser(userId: number) {
  return apiFetchJson(`${BASE}/users/${userId}`, { method: "DELETE" });
}

export async function assignUserTenant(userId: number, tenantId: string | null) {
  return apiFetchJson(`${BASE}/users/${userId}/tenant`, {
    method: "PUT",
    body: JSON.stringify({ tenantId }),
  });
}

export async function assignTenantAddons(
  tenantId: string,
  featureKeys: string[],
  enabled = true,
) {
  return apiFetchJson(`${BASE}/tenants/${tenantId}/addons`, {
    method: "PUT",
    body: JSON.stringify({ featureKeys, enabled }),
  });
}

export async function setTenantModules(tenantId: string, featureKeys: string[]) {
  return apiFetchJson(`${BASE}/tenants/${tenantId}/modules`, {
    method: "PUT",
    body: JSON.stringify({ featureKeys }),
  });
}

export async function updateAcpRole(
  id: string,
  body: { name?: string; description?: string },
) {
  return apiFetchJson(`${BASE}/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteAcpRole(id: string) {
  return apiFetchJson(`${BASE}/roles/${id}`, { method: "DELETE" });
}

export async function fetchAcpRoles(tenantId?: string) {
  const q = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
  return apiFetchJson<AcpRole[]>(`${BASE}/roles${q}`);
}

export async function createAcpRole(body: {
  key: string;
  name: string;
  description?: string;
  tenantId?: string;
}) {
  return apiFetchJson<AcpRole>(`${BASE}/roles`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function assignUserRole(userId: number, roleId: string, tenantId?: string) {
  return apiFetchJson(`${BASE}/users/${userId}/roles`, {
    method: "POST",
    body: JSON.stringify({ roleId, tenantId }),
  });
}

export async function removeUserRole(userId: number, roleId: string, tenantId?: string) {
  const q = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
  return apiFetchJson(`${BASE}/users/${userId}/roles/${roleId}${q}`, {
    method: "DELETE",
  });
}

export async function fetchPermissions() {
  return apiFetchJson<AcpPermission[]>(`${BASE}/permissions`);
}

export async function fetchPermissionMatrix() {
  return apiFetchJson<{ roles: AcpRole[]; permissions: AcpPermission[] }>(
    `${BASE}/permissions/matrix`,
  );
}

export async function setRolePermissions(roleId: string, permissionIds: string[]) {
  return apiFetchJson(`${BASE}/roles/${roleId}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissionIds }),
  });
}

export async function fetchSubscriptionTiers() {
  return apiFetchJson<
    Array<{ id: string; key: string; name: string; sortOrder: number }>
  >(`${BASE}/subscriptions/tiers`);
}

export async function assignTenantSubscription(
  tenantId: string,
  tierId: string,
  status?: string,
) {
  return apiFetchJson(`${BASE}/tenants/${tenantId}/subscription`, {
    method: "PUT",
    body: JSON.stringify({ tierId, status }),
  });
}

export async function fetchFeatureFlags() {
  return apiFetchJson<AcpFeatureFlag[]>(`${BASE}/features`);
}

export async function toggleTenantFeature(
  tenantId: string,
  featureFlagId: string,
  enabled: boolean,
) {
  return apiFetchJson(`${BASE}/tenants/${tenantId}/features/${featureFlagId}`, {
    method: "PUT",
    body: JSON.stringify({ enabled }),
  });
}

export async function fetchAcpAuditLogs(tenantId?: string) {
  const q = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
  return apiFetchJson<AcpAuditLog[]>(`${BASE}/audit-logs${q}`);
}
