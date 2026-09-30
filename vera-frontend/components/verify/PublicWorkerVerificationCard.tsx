"use client";

import Link from "next/link";
import { Search, UserX } from "lucide-react";
import { WorkerVerificationResult } from "@/components/verify/worker-verification-display";
import { EmptyState, ErrorState, VerificationFlowSkeleton } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { loadWorkerWallet } from "@/components/wallet/wallet-api";
import { parseVerifyRefTarget, useAsyncResource } from "@/lib/use-async-resource";

/** Public anonymous worker verification at /verify/[id] and /verify/t/[token]. */
export function PublicWorkerVerificationCard({ workerId }: { workerId: string }) {
  const { result } = useAsyncResource({
    rawId: workerId,
    parser: parseVerifyRefTarget,
    loader: (id) => loadWorkerWallet(String(id)),
    loaderRef: loadWorkerWallet,
    invalidMessage: "Enter a valid verification token or worker id.",
  });

  if (result.status === "loading" || result.status === "idle") {
    return <VerificationFlowSkeleton />;
  }

  if (result.status === "error") {
    return (
      <ErrorState title="Verification unavailable" description={result.message}>
        <Link href="/qr" className={buttonStyles({ variant: "outline", size: "md" })}>
          Try QR scanner
        </Link>
      </ErrorState>
    );
  }

  if (result.status === "not-found") {
    return (
      <EmptyState
        icon={UserX}
        title="Worker not found"
        description="Check the link or QR code and try again."
      >
        <Link href="/qr" className={buttonStyles({ variant: "outline", size: "md" })}>
          <Search className="h-4 w-4" aria-hidden />
          Scan another QR
        </Link>
      </EmptyState>
    );
  }

  return <WorkerVerificationResult data={result.data} />;
}
