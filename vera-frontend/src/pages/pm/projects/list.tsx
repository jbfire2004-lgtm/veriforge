"use client";

import {
  PmPageShell,
  PmSurfaceCard,
} from "@/src/components/pm/layout";
import { PmProjectsList } from "@/src/components/pm/PmProjectsList";
import { useVeraAuthOrHook } from "@/contexts/VeraAuthContext";
import type { CompanyOption } from "@/src/components/core/CompanySelectField";
import { smsCoreSiblingIntegrations } from "@/lib/sms-core-integrations";
import { SmsCoreFederationStrip } from "@/components/verisuite-intelligence-ui/SmsCoreFederationStrip";

type Props = {
  companies: CompanyOption[];
  defaultCompanyId?: number;
  lockCompany?: boolean;
};

export default function PmProjectsListPage({
  companies,
  defaultCompanyId,
  lockCompany,
}: Props) {
  const { authLoading, authenticated, tokenReady, sessionExpired } =
    useVeraAuthOrHook();

  return (
    <PmPageShell
      title="Projects"
      description="Operational project management — tasks, schedules, assignments, readiness, and SMS Core safety federation."
      auth={{
        authLoading,
        authenticated,
        tokenReady,
        sessionExpired,
        signInMessage: "Sign in to manage projects.",
      }}
    >
      <div className="space-y-4">
        <SmsCoreFederationStrip
          items={smsCoreSiblingIntegrations("projects", {
            companyId: defaultCompanyId,
          })}
        />
        <PmSurfaceCard>
          <PmProjectsList
            companies={companies}
            defaultCompanyId={defaultCompanyId}
            lockCompany={lockCompany}
          />
        </PmSurfaceCard>
      </div>
    </PmPageShell>
  );
}
