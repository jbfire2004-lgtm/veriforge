import { Suspense } from "react";
import { WorkerVerificationView } from "@/components/verify/WorkerVerificationView";
import { VerifySuspenseFallback } from "@/components/VerifySuspenseFallback";

export default function Page() {
  return (
    <Suspense fallback={<VerifySuspenseFallback />}>
      <WorkerVerificationView />
    </Suspense>
  );
}
