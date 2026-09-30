"use client";

import { SmsPageLayout, type SmsPageLayoutProps } from "@/src/components/sms/design-system";
import { PmAuthBanner } from "./PmAuthBanner";

type AuthProps = {
  authLoading: boolean;
  authenticated: boolean;
  tokenReady: boolean;
  sessionExpired: boolean;
  signInMessage?: string;
};

export type PmPageShellProps = Omit<SmsPageLayoutProps, "children"> & {
  children: React.ReactNode;
  auth?: AuthProps;
};

/**
 * Standard Vera PM / SMS page shell — delegates to {@link SmsPageLayout}
 * for mobile-first headers, spacing, and action placement.
 */
export function PmPageShell({
  title,
  description,
  filters,
  actions,
  mobileActions,
  toolDrawer,
  footer,
  width,
  eyebrow,
  className,
  auth,
  children,
}: PmPageShellProps) {
  return (
    <SmsPageLayout
      eyebrow={eyebrow}
      title={title}
      description={description}
      filters={filters}
      actions={actions}
      mobileActions={mobileActions}
      toolDrawer={toolDrawer}
      footer={footer}
      width={width}
      className={className}
    >
      {auth ? <PmAuthBanner {...auth} /> : null}
      {children}
    </SmsPageLayout>
  );
}
