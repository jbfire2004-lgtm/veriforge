"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { workerQrToPngDataUrl } from "@/lib/qr-render";

export async function generateWorkerQR(workerId: string) {
  const session = await getServerSession(authOptions);

  const role = session?.user.role?.toUpperCase();
  if (!session?.accessToken || role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const { pngDataUrl } = await workerQrToPngDataUrl(workerId);
  return pngDataUrl;
}
