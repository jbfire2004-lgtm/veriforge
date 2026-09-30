import { redirect } from "next/navigation";
import { equipmentVerifyPath } from "@/lib/wallet-routing";

/** Legacy QR alias: `/scan/equipment/:id` → public equipment verify. */
export default async function ScanEquipmentRedirectPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  const trimmed = String(id ?? "").trim();
  if (!/^\d+$/.test(trimmed)) {
    redirect("/qr");
  }
  redirect(equipmentVerifyPath(Number(trimmed)));
}
