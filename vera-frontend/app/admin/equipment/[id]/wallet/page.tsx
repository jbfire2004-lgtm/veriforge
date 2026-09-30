import { redirect } from "next/navigation";

export default async function AdminEquipmentWalletRedirect({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  redirect(`/equipment/${id}/wallet`);
}
