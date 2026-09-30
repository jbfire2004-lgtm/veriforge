import "server-only";

import { getServerAuthSession } from "@/lib/server-session";
import { loadPmInspectionLibraryServer } from "@/lib/pm-inspection-library-server";
import {
  resolvePmInspectionCompanyId,
  resolvePmInspectionProjectId,
} from "@/lib/pm-inspection-scope";

export async function getPmInspectionRouteScope(searchParams: {
  projectId?: string;
  companyId?: string;
}) {
  const session = await getServerAuthSession();
  const companyId = resolvePmInspectionCompanyId(session, searchParams.companyId);
  const projectId = resolvePmInspectionProjectId(searchParams.projectId);
  const library = await loadPmInspectionLibraryServer(session, companyId, projectId);

  return {
    session,
    companyId,
    projectId,
    initialTemplates: library.templates,
    libraryError: library.error,
    seedResult: library.seedResult,
  };
}
