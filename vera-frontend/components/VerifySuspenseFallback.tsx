import { VerificationFlowSkeleton } from "@/components/ui";

export function VerifySuspenseFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-vera-surface/80 to-vera-white px-vera-5 py-vera-10">
      <VerificationFlowSkeleton />
    </div>
  );
}
