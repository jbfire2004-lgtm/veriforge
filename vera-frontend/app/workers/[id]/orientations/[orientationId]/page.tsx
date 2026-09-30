import { VeraPageLayout } from "@/src/components/navigation";
import { OrientationPlayer } from "@/components/orientation/veriforge";

type Props = {
  params: Promise<{ id: string; orientationId: string }>;
  searchParams: Promise<{ companyId?: string; projectId?: string }>;
};

export default async function WorkerOrientationPlayerPage({
  params,
  searchParams,
}: Props) {
  const { id, orientationId } = await params;
  const sp = await searchParams;
  const workerId = parseInt(id, 10);
  const companyId = sp.companyId ? parseInt(sp.companyId, 10) : 0;
  const projectId = sp.projectId ? parseInt(sp.projectId, 10) : undefined;

  return (
    <VeraPageLayout title="Orientation player">
      {companyId > 0 ? (
        <OrientationPlayer
          orientationId={orientationId}
          workerId={workerId}
          companyId={companyId}
          projectId={projectId}
          listPath={`/workers/${workerId}/orientations?companyId=${companyId}${
            projectId ? `&projectId=${projectId}` : ""
          }`}
        />
      ) : (
        <p className="text-sm text-[#2A2E33]/70">
          Add <code>?companyId=</code> to the URL to complete this orientation.
        </p>
      )}
    </VeraPageLayout>
  );
}
