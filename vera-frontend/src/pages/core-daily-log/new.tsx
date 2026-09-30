"use client";

import { CoreDailyLogForm } from "@/src/components/core-daily-log/CoreDailyLogForm";
import type {
  DailyLogCompanyOption,
  DailyLogSiteOption,
} from "@/src/components/core-daily-log/CoreDailyLogForm";
import { VeraPageLayout } from "@/src/components/navigation";

export type CoreDailyLogNewPageProps = {
  companies?: DailyLogCompanyOption[];
  sites?: DailyLogSiteOption[];
  defaultCompanyId?: number;
  defaultSiteId?: number;
  lockCompany?: boolean;
  defaultCreatedByUserId?: number;
  defaultSupervisorUserId?: number;
};

export default function CoreDailyLogNewPage({
  companies,
  sites,
  defaultCompanyId,
  defaultSiteId,
  lockCompany,
  defaultCreatedByUserId,
  defaultSupervisorUserId,
}: CoreDailyLogNewPageProps) {
  return (
    <VeraPageLayout
      title="New daily log"
      description="Schema: log_id, site_id, company_id, supervisor, date, activities, safety_notes, attachments."
    >
      <CoreDailyLogForm
        companies={companies}
        sites={sites}
        defaultCompanyId={defaultCompanyId}
        defaultSiteId={defaultSiteId}
        lockCompany={lockCompany}
        defaultCreatedByUserId={defaultCreatedByUserId}
        defaultSupervisorUserId={defaultSupervisorUserId}
      />
    </VeraPageLayout>
  );
}
