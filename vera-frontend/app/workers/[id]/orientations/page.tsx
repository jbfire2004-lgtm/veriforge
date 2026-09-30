import { VeraPageLayout } from "@/src/components/navigation";
import { WorkerOrientationList } from "@/components/orientation/veriforge";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ companyId?: string; projectId?: string }>;
};

export default async function WorkerOrientationsPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const workerId = parseInt(id, 10);
  const companyId = sp.companyId ? parseInt(sp.companyId, 10) : undefined;
  const projectId = sp.projectId ? parseInt(sp.projectId, 10) : undefined;

  return (
    <VeraPageLayout
      title="My orientations"
      description="Required and completed orientation modules"
    >
      <WorkerOrientationList
        workerId={workerId}
        companyId={companyId}
        projectId={projectId}
        basePath={`/workers/${workerId}/orientations`}
      />
    </VeraPageLayout>
  );
}
