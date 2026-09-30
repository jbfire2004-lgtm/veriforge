import { Suspense } from "react";
import { CredentialVerificationView } from "@/components/verify/CredentialVerificationView";
import { VerifySuspenseFallback } from "@/components/VerifySuspenseFallback";

export default function Page() {
  return (
    <Suspense fallback={<VerifySuspenseFallback />}>
      <CredentialVerificationView />
    </Suspense>
  );
}
