"use client";

import { useVeraAuthOrHook } from "@/contexts/VeraAuthContext";
import {
  pmInspectionQuery,
  resolvePmInspectionCompanyId,
} from "@/lib/pm-inspection-scope";

export function usePmInspectionScope(
  queryCompanyId: number,
  queryProjectId: number,
) {
  const { session, authLoading, authenticated, tokenReady, sessionExpired } =
    useVeraAuthOrHook();
  const companyId = resolvePmInspectionCompanyId(session, queryCompanyId);

  return {
    companyId,
    projectId: queryProjectId,
    query: pmInspectionQuery(companyId, queryProjectId),
    session,
    authLoading,
    authenticated,
    tokenReady,
    sessionExpired,
  };
}
