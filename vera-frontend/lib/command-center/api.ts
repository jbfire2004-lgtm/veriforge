import type { CommandCenterReport, CommandContextInput } from "@vera/command-center";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export async function refreshCommandCenter(
  companyId: number,
  projectId?: number,
  unionHallId?: number
) {
  return apiAxiosPost<CommandCenterReport>("/api/v1/command-center/refresh", null, {
    params: { companyId, projectId, unionHallId },
  });
}

export async function fetchCommandCenterDashboard() {
  return apiAxiosGet("/api/v1/command-center/dashboard");
}

export async function fetchCommandCenterReport() {
  return apiAxiosGet<CommandCenterReport>("/api/v1/command-center/report");
}

export async function refreshCommandCenterOffline(ctx: CommandContextInput) {
  return apiAxiosPost<CommandCenterReport>("/api/v1/command-center/offline/refresh", ctx);
}
