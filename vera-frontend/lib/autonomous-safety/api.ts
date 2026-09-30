import type { AutonomousSafetyReport, SafetyContextInput } from "@vera/autonomous-safety";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export async function analyzeSafety(companyId: number, projectId?: number) {
  return apiAxiosPost<AutonomousSafetyReport>("/api/v1/safety/analyze", null, {
    params: { companyId, projectId },
  });
}

export async function fetchSafetyDashboard() {
  return apiAxiosGet("/api/v1/safety/dashboard");
}

export async function fetchSafetyReport() {
  return apiAxiosGet<AutonomousSafetyReport>("/api/v1/safety/report");
}

export async function analyzeSafetyOffline(ctx: SafetyContextInput) {
  return apiAxiosPost<AutonomousSafetyReport>("/api/v1/safety/offline/analyze", ctx);
}
