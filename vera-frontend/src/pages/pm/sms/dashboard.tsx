'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { listJhaFlha } from '@/lib/jha-flha';
import { listPmCorrectiveActions } from '@/lib/pm-corrective-actions';
import { listPmIncidents } from '@/lib/pm-incidents';
import { listPmInspections } from '@/lib/pm-inspections';
import { fetchSmsMeta } from '@/lib/pm-sms-core';
import { usePmSmsScope } from '@/hooks/usePmSmsScope';
import { apiLoadErrorMessage } from '@/lib/network-error-message';
import { PmWorkflowJourney } from '@/src/components/pm/PmWorkflowJourney';
import {
  SMS_LANDING_WORKFLOW,
  SMS_QUICK_ACTIONS,
  SMS_TOOL_CARDS,
  SmsQuickActionsSection,
  SmsToolsPanelSection,
  SmsIntegrationsSection,
  mapCapaStatus,
  mapJhaStatus,
  type SmsRecordRow,
} from '@/src/components/sms/landing';
import { smsCoreOutboundIntegrations } from '@/lib/sms-core-integrations';
import {
  SmsAlert,
  SmsBadge,
  SmsButton,
  SmsSkeleton,
  SmsUniversalLayout,
} from '@/src/components/sms/design-system';
import {
  ClipboardList,
  LayoutGrid,
  Workflow,
} from 'lucide-react';

const SmsRecordsHistorySection = dynamic(
  () =>
    import('@/src/components/sms/landing/SmsRecordsHistorySection').then(
      (m) => m.SmsRecordsHistorySection,
    ),
  {
    loading: () => <SmsSkeleton className="h-48" aria-label="Loading records" />,
    ssr: false,
  },
);

type Props = {
  queryCompanyId?: number;
  queryProjectId?: number;
};

function mapIncidentStatus(status: string): SmsRecordRow['status'] {
  const s = status.toLowerCase();
  if (s.includes('draft') || s === 'open') return 'Draft';
  if (s.includes('invest') || s.includes('progress')) return 'In Progress';
  if (s.includes('submit')) return 'Submitted';
  if (s.includes('closed')) return 'Closed';
  return 'Other';
}

function mapInspectionStatus(status: string): SmsRecordRow['status'] {
  const s = status.toLowerCase();
  if (s.includes('draft')) return 'Draft';
  if (s.includes('progress') || s === 'in_progress') return 'In Progress';
  if (s.includes('submit') || s === 'completed') return 'Submitted';
  if (s.includes('closed')) return 'Closed';
  return 'Other';
}

export default function SmsCoreDashboard({ queryCompanyId = 1, queryProjectId = 1 }: Props) {
  const { companyId, projectId, query, tokenReady, authLoading } = usePmSmsScope(
    queryCompanyId,
    queryProjectId,
  );

  const [meta, setMeta] = useState<{ pillars?: string[] } | null>(null);
  const [records, setRecords] = useState<SmsRecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLanding = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [metaRes, jhaFlha, inspections, capa, incidents] = await Promise.all([
        fetchSmsMeta().catch(() => ({ pillars: [] as string[] })),
        listJhaFlha({ companyId, projectId }).catch(() => []),
        listPmInspections(projectId, companyId).catch(() => []),
        listPmCorrectiveActions(projectId).catch(() => []),
        listPmIncidents(projectId).catch(() => []),
      ]);

      setMeta(metaRes);

      const rows: SmsRecordRow[] = [];

      for (const j of jhaFlha) {
        rows.push({
          id: j.id,
          type: j.kind === 'FLHA' ? 'FLHA' : 'JHA',
          title: j.taskDescription?.trim() || `${j.kind} #${j.id.slice(0, 8)}`,
          status: mapJhaStatus(j.status),
          updatedAt: j.updatedAt,
          href: `/pm/jha-flha/${j.id}${query}`,
        });
      }

      for (const i of inspections) {
        const title =
          (i as { title?: string }).title ||
          (i as { templateName?: string }).templateName ||
          `Inspection ${i.id.slice(0, 8)}`;
        rows.push({
          id: i.id,
          type: 'Inspection',
          title,
          status: mapInspectionStatus((i as { status?: string }).status ?? ''),
          updatedAt:
            (i as { updatedAt?: string }).updatedAt ??
            (i as { createdAt?: string }).createdAt ??
            new Date().toISOString(),
          href: `/pm/inspections/${i.id}${query}`,
        });
      }

      for (const c of capa) {
        rows.push({
          id: c.id,
          type: 'Corrective Action',
          title: c.title,
          status: mapCapaStatus(c.status),
          updatedAt: c.dueAt ?? new Date().toISOString(),
          href: `/pm/corrective-actions/${c.id}${query}`,
        });
      }

      for (const inc of incidents) {
        rows.push({
          id: inc.id,
          type: 'Investigation',
          title: inc.title,
          status: mapIncidentStatus(inc.status),
          updatedAt:
            (inc as { updatedAt?: string }).updatedAt ??
            (inc as { createdAt?: string }).createdAt ??
            new Date().toISOString(),
          href: `/pm/incidents/${inc.id}${query}`,
        });
      }

      setRecords(rows);
    } catch (e) {
      setError(apiLoadErrorMessage(e, 'Could not load Safety Management System data.'));
    } finally {
      setLoading(false);
    }
  }, [companyId, projectId, query]);

  useEffect(() => {
    if (authLoading || !tokenReady) return;
    void loadLanding();
  }, [authLoading, tokenReady, loadLanding]);

  return (
    <SmsUniversalLayout
      header={{
        eyebrow: "Vera SMS",
        title: "Safety Management System",
        description: (
          <>
            Plan, execute, investigate, and close corrective actions — with SCL,
            HECA, and Energy Wheel classification.
            {meta?.pillars?.length ? (
              <span className="mt-2 flex flex-wrap gap-2">
                {meta.pillars.map((p) => (
                  <SmsBadge key={p} tone="secondary">
                    {p}
                  </SmsBadge>
                ))}
              </span>
            ) : null}
          </>
        ),
      }}
      actions={
        <SmsButton
          type="button"
          variant="secondary"
          size="sm"
          disabled={loading}
          onClick={() => void loadLanding()}
        >
          Refresh
        </SmsButton>
      }
      summaryCards={[
        {
          id: "records",
          label: "Active records",
          value: loading ? "—" : records.length,
          hint: "JHA, FLHA, inspections, actions, investigations",
          tone: "info",
          icon: ClipboardList,
        },
        {
          id: "open",
          label: "In progress",
          value: loading
            ? "—"
            : records.filter(
                (r) => r.status === "In Progress" || r.status === "Draft",
              ).length,
          hint: "Draft or in-progress items",
          tone: "caution",
          icon: Workflow,
        },
        {
          id: "tools",
          label: "SMS tools",
          value: SMS_TOOL_CARDS.length,
          hint: "Quick-access workflow modules",
          tone: "default",
          icon: LayoutGrid,
        },
      ]}
      footer={
        <p>
          SMS Core template · Header · Summary · Main · Actions · Footer
        </p>
      }
    >
      {error ? (
        <SmsAlert tone="error" onRetry={() => void loadLanding()}>
          {error}
        </SmsAlert>
      ) : null}

      <PmWorkflowJourney
        steps={SMS_LANDING_WORKFLOW}
        sectionEyebrow="SMS field pipeline"
        sectionTitle="Recommended workflow"
        sectionDescription="Move from planning through field execution, investigation, and verified corrective-action closure."
      />

      <SmsQuickActionsSection actions={SMS_QUICK_ACTIONS} querySuffix={query} />

      <SmsToolsPanelSection tools={SMS_TOOL_CARDS} querySuffix={query} />

      <SmsIntegrationsSection
        items={smsCoreOutboundIntegrations({ companyId, projectId })}
      />

      <SmsRecordsHistorySection records={records} loading={loading} />
    </SmsUniversalLayout>
  );
}
