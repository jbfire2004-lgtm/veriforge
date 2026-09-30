import { VeraPageLayout } from "@/src/components/navigation";
import { OrientationDashboard } from "@/components/orientation/veriforge";
import { OrientationRequirementManager } from "@/components/orientation/veriforge";
import { apiFetchJson } from "@/lib/api-fetch";

type Props = { params: Promise<{ id: string }> };

export default async function PmProjectOrientationsPage({ params }: Props) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  let companyId = 0;
  try {
    const project = await apiFetchJson<{ companyId?: number }>(
      `/api/v1/pm/projects/${projectId}`,
    ).catch(() => null);
    companyId = project?.companyId ?? 0;
  } catch {
    companyId = 0;
  }

  return (
    <VeraPageLayout title="Project orientations">
      {companyId > 0 ? (
        <div className="space-y-10">
          <OrientationDashboard
            companyId={companyId}
            projectId={projectId}
            basePath={`/companies/${companyId}/orientations`}
            requirementsPath={`/pm/projects/${projectId}/orientations#requirements`}
          />
          <div id="requirements">
            <h2 className="mb-4 text-lg font-semibold">Requirements</h2>
            <OrientationRequirementManager
              companyId={companyId}
              projectId={projectId}
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#2A2E33]/70">
          Unable to load project company context.
        </p>
      )}
    </VeraPageLayout>
  );
}
