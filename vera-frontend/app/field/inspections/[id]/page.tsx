import { PmInspectionFieldChecklist } from "@/components/inspection/PmInspectionFieldChecklist";

export default async function FieldInspectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { id } = await params;
  const { projectId: projectRaw } = await searchParams;

  return (
    <div className="p-4">
      <PmInspectionFieldChecklist
        inspectionId={id}
        projectId={projectRaw ? Number(projectRaw) : 1}
      />
    </div>
  );
}
