import { VeraPageLayout } from "@/src/components/navigation";
import { OrientationRequirementManager } from "@/components/orientation/veriforge";
import { apiFetchJson } from "@/lib/api-fetch";

type Props = { params: Promise<{ id: string }> };

export default async function ProjectOrientationsPage({ params }: Props) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  let companyId = 0;
  try {
    const project = await apiFetchJson<{ companyId?: number }>(
      `/api/v1/pm/projects/${projectId}`,
      { requireAuth: true },
    ).catch(() =>
      apiFetchJson<{ companyId?: number }>(`/projects/${projectId}`, {
        requireAuth: true,
      }),
    );
    companyId = project.companyId ?? 0;
  } catch {
    companyId = 0;
  }

  return (
    <VeraPageLayout
      title="Project orientation requirements"
      description={`Project ${projectId}`}
    >
      {companyId > 0 ? (
        <OrientationRequirementManager
          companyId={companyId}
          projectId={projectId}
        />
      ) : (
        <p className="text-sm text-[#2A2E33]/70">
          Could not resolve company for this project. Open requirements from the
          company orientations page instead.
        </p>
      )}
    </VeraPageLayout>
  );
}
