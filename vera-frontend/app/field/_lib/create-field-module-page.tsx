import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import { FieldOsModuleView } from "@/components/field/FieldOsModuleView";
import type { FieldOsModuleId } from "@/lib/field/modules";

type SearchParams = Promise<{ projectId?: string; companyId?: string }>;

async function resolveScope(searchParams: SearchParams) {
  const session = await getServerSession(authOptions);
  const sp = await resolveSearchParams(searchParams);
  const projectId = sp.projectId ? parseInt(sp.projectId, 10) : undefined;
  const companyId = sp.companyId
    ? parseInt(sp.companyId, 10)
    : (session?.user as { companyId?: number } | undefined)?.companyId;
  return {
    projectId: Number.isFinite(projectId) ? projectId : undefined,
    companyId: Number.isFinite(companyId) ? companyId : undefined,
  };
}

export function createFieldModulePage(moduleId: FieldOsModuleId) {
  return async function FieldModulePage({
    searchParams,
  }: {
    searchParams: SearchParams;
  }) {
    const scope = await resolveScope(searchParams);
    return (
      <Suspense
        fallback={
          <p className="p-6 text-sm text-slate-500">Loading FieldOS module…</p>
        }
      >
        <FieldOsModuleView
          moduleId={moduleId}
          projectId={scope.projectId}
          companyId={scope.companyId}
        />
      </Suspense>
    );
  };
}
