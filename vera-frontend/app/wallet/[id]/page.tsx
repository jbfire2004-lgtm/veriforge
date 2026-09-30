"use client";

import { useParams } from "next/navigation";
import { WorkerWalletView } from "@/components/wallet/WorkerWalletView";

export default function WalletPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  if (!id) {
    return null;
  }

  return <WorkerWalletView workerId={id} mode="staff" />;
}
