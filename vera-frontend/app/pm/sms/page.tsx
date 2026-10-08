import SmsCoreDashboard from '@/src/screens/pm/sms/dashboard';
import { resolveSearchParams } from '@/lib/resolve-search-params';
import {
  resolvePmInspectionCompanyId,
  resolvePmInspectionProjectId,
} from '@/lib/pm-inspection-scope';
import { getServerAuthSession } from '@/lib/server-session';

export default async function SmsCoreRoute({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const sp = await resolveSearchParams(searchParams);
  const session = await getServerAuthSession();
  const queryCompanyId = sp.companyId
    ? parseInt(sp.companyId, 10)
    : resolvePmInspectionCompanyId(session, 1);
  const queryProjectId = resolvePmInspectionProjectId(sp.projectId);

  return (
    <SmsCoreDashboard queryCompanyId={queryCompanyId} queryProjectId={queryProjectId} />
  );
}
