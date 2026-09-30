import { redirect } from "next/navigation";

/** Legacy URL — canonical create flow is `/admin/workers/new`. */
export default function WorkerCreateRedirectPage() {
  redirect("/admin/workers/new");
}
