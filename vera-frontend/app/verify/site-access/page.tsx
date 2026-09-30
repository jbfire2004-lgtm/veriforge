import { Suspense } from "react";
import VerifyPage from "@/components/VerifyPage";
import { VerifySuspenseFallback } from "@/components/VerifySuspenseFallback";

export default function Page() {
  return (
    <Suspense fallback={<VerifySuspenseFallback />}>
      <VerifyPage title="Site Access Verification" endpoint="site-access" />
    </Suspense>
  );
}
