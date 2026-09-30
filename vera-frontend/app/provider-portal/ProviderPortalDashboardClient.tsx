"use client";

import { ProviderPortalDashboard, type ProviderPortalData } from "@/components/vera-core-ui";

export function ProviderPortalDashboardClient({ data }: { data: ProviderPortalData }) {
  return <ProviderPortalDashboard data={data} />;
}
