import type { ReactNode } from "react";
import { SignedInVeraLayout } from "@/src/components/layout/signed-in-vera-layout";

export default function SubscriptionsLayout({ children }: { children: ReactNode }) {
  return (
    <SignedInVeraLayout callbackUrl="/subscriptions" homeHref="/welcome">
      {children}
    </SignedInVeraLayout>
  );
}
