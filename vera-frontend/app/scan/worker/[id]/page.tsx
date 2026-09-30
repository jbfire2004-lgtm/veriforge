import { redirect } from "next/navigation";
import { workerVerifyPath } from "@/lib/wallet-routing";

/** Legacy QR alias: `/scan/worker/:id` → public verify wallet. */
export default async function ScanWorkerRedirectPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = await Promise.resolve(params);
  const trimmed = String(id ?? "").trim();
  if (!/^\d+$/.test(trimmed)) {
    redirect("/qr");
  }
  redirect(workerVerifyPath(Number(trimmed)));
}
