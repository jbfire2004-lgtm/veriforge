import type { EnterpriseAutomationReport, EnterpriseContextInput } from "@vera/enterprise-automation";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export async function orchestrateEnterprise(
  companyId: number,
  projectId?: number,
  unionHallId?: number,
  autoExecute = true
) {
  return apiAxiosPost<EnterpriseAutomationReport>("/api/v1/enterprise/orchestrate", null, {
    params: { companyId, projectId, unionHallId, autoExecute },
  });
}

export async function fetchEnterpriseDashboard() {
  return apiAxiosGet("/api/v1/enterprise/dashboard");
}

export async function fetchEnterpriseReport() {
  return apiAxiosGet<EnterpriseAutomationReport>("/api/v1/enterprise/report");
}

export async function overrideEnterpriseAction(actionId: string, reason: string) {
  return apiAxiosPost<EnterpriseAutomationReport>("/api/v1/enterprise/override", {
    actionId,
    reason,
  });
}

export async function orchestrateEnterpriseOffline(ctx: EnterpriseContextInput) {
  return apiAxiosPost<EnterpriseAutomationReport>(
    "/api/v1/enterprise/offline/orchestrate",
    ctx
  );
}
