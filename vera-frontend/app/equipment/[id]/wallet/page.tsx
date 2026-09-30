import { canViewEquipmentDetail } from "@/lib/phase1-roles";
import { requireRouteAccess } from "@/lib/route-access";
import { EquipmentWalletView } from "@/components/wallet/EquipmentWalletView";

export default async function EquipmentWalletPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  await requireRouteAccess({
    callbackUrl: `/equipment/${id}/wallet`,
    guard: canViewEquipmentDetail,
  });

  return <EquipmentWalletView equipmentId={id} />;
}
