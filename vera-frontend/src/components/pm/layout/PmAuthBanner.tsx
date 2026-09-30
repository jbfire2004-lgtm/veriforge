"use client";

import { InspectionAuthStatus } from "@/components/inspections";

type Props = {
  authLoading: boolean;
  authenticated: boolean;
  tokenReady: boolean;
  sessionExpired: boolean;
  signInMessage?: string;
};

/** Consistent PM session hydration banner (shared across PM modules). */
export function PmAuthBanner(props: Props) {
  return <InspectionAuthStatus {...props} />;
}
