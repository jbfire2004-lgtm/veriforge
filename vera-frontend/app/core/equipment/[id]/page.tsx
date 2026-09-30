import { CoreEquipmentProfileView } from "@/src/components/core/CoreEquipmentProfileView";

type Props = { params: Promise<{ id: string }> };

export default async function CoreEquipmentProfilePage({ params }: Props) {
  const { id } = await params;
  const equipmentId = Number(id);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <CoreEquipmentProfileView equipmentId={equipmentId} />
    </div>
  );
}
