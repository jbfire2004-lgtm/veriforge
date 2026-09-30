import type { ReactNode } from "react";
import { SignedInVeraLayout } from "@/src/components/layout/signed-in-vera-layout";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <SignedInVeraLayout callbackUrl="/onboarding" homeHref="/welcome">
      {children}
    </SignedInVeraLayout>
  );
}
