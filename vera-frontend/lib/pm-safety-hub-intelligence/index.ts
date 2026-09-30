export type * from "./types";
export { buildSafetyHubIntelligence } from "./build";

import { getServerAuthSession } from "@/lib/server-session";
import { apiGetSafe } from "@/lib/api";
import { buildSafetyHubIntelligence } from "./build";
import type { SafetyHubIntelligenceDashboard } from "./types";
import { buildEmergencyHub } from "@/lib/veripm-emergency-hub/build";

export async function loadSafetyHubIntelligence(input: {
  projectId: number;
  companyId: number;
}): Promise<SafetyHubIntelligenceDashboard> {
  const { projectId, companyId } = input;
  const session = await getServerAuthSession();

  const sifPath = `/api/v1/pm/sif-heca/analytics/project/${projectId}`;
  const leadingPath = `/api/v1/pm/sms/analytics/leading-indicators?companyId=${companyId}&projectId=${projectId}`;
  const trainingPath = `/api/v1/pm/training/analytics/company/${companyId}?projectId=${projectId}`;
  const hubPath = `/api/v1/pm/safety-hub/dashboard?companyId=${companyId}&projectId=${projectId}`;
  const smsHomePath = `/api/v1/verisuite-sms/dashboard/home?companyId=${companyId}&projectId=${projectId}`;

  const [sifRes, leadingRes, trainingRes, hubRes, smsHomeRes] =
    await Promise.all([
      apiGetSafe<Record<string, unknown>>(sifPath, session),
      apiGetSafe<{
        sclDistribution?: Record<string, number>;
        hecaHighEnergyConditionalLoss?: number;
        energyControlGaps?: Record<string, number>;
      }>(leadingPath, session),
      apiGetSafe<Record<string, unknown>>(trainingPath, session),
      apiGetSafe<{
        summary?: {
          alertScore?: number;
          openCapa?: number;
          openCail?: number;
          evidenceIndexed?: number;
          domainsNeedingAttention?: number;
        };
        domains?: Record<
          string,
          Record<string, number | string | null> & { href?: string }
        >;
        capaQueue?: Array<{
          id: string;
          title: string;
          status: string;
          severityLevel?: string;
          dueAt?: string;
          sourceModule?: string;
        }>;
      }>(hubPath, session),
      apiGetSafe<{
        kpis?: Array<{ id: string; value: number; unit?: string }>;
      }>(smsHomePath, session),
    ]);

  let emergency: { quality?: { drillReadiness?: number } } | null = null;
  try {
    const hub = buildEmergencyHub({ projectId, companyId });
    emergency = { quality: { drillReadiness: hub.quality?.drillReadiness } };
  } catch {
    emergency = null;
  }

  return buildSafetyHubIntelligence({
    projectId,
    companyId,
    live: {
      sif: sifRes.ok ? sifRes.data : null,
      leading: leadingRes.ok ? leadingRes.data : null,
      training: trainingRes.ok ? trainingRes.data : null,
      hub: hubRes.ok ? hubRes.data : null,
      emergency,
      smsHome: smsHomeRes.ok ? smsHomeRes.data : null,
    },
  });
}
