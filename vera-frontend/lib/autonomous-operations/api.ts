import type { AutonomousOperationsReport, OperationsContextInput } from "@vera/autonomous-operations";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export async function runAutonomousOperations(
  companyId: number,
  projectId?: number,
  unionHallId?: number,
  autoExecute = true
) {
  return apiAxiosPost<AutonomousOperationsReport>("/api/v1/operations/run", null, {
    params: { companyId, projectId, unionHallId, autoExecute },
  });
}

export async function fetchOperationsDashboard() {
  return apiAxiosGet("/api/v1/operations/dashboard");
}

export async function fetchOperationsReport() {
  return apiAxiosGet<AutonomousOperationsReport>("/api/v1/operations/report");
}

export async function overrideOperation(actionId: string, reason: string) {
  return apiAxiosPost<AutonomousOperationsReport>("/api/v1/operations/override", {
    actionId,
    reason,
  });
}

export async function runOperationsOffline(ctx: OperationsContextInput) {
  return apiAxiosPost<AutonomousOperationsReport>("/api/v1/operations/offline/run", ctx);
}
