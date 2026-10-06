import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RcaEngine } from './rca.engine';

@Injectable()
export class PmInvestigationReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rca: RcaEngine,
  ) {}

  async buildReport(eventId: string) {
    const event = await this.prisma.pmSafetyEvent.findFirst({
      where: { id: eventId, deletedAt: null },
      include: {
        investigation: true,
        rootCauses: true,
        contributingFactors: true,
        correctiveActions: true,
        witnesses: { include: { statements: true } },
        attachments: true,
        injuries: true,
        project: { select: { name: true } },
        createdBy: { select: { username: true } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');

    let causalTree = event.investigation?.causalTreeJson;
    if (!causalTree || Object.keys(causalTree as object).length === 0) {
      causalTree = this.rca.buildCausalTree({
        eventTitle: event.title,
        rootCauses: event.rootCauses.map((r) => ({
          id: r.id,
          description: r.description,
          category: r.category,
        })),
        contributingFactors: event.contributingFactors,
      });
    }

    const executiveSummary = this.buildExecutiveSummary(event);

    if (event.investigation) {
      await this.prisma.pmSafetyEventInvestigation.update({
        where: { eventId },
        data: { executiveSummary },
      });
    }

    return {
      eventId,
      generatedAt: new Date().toISOString(),
      executiveSummary,
      event: {
        title: event.title,
        type: event.eventType,
        severity: event.severity,
        riskScore: event.riskScore,
        project: event.project.name,
        occurredAt: event.occurredAt,
        status: event.status,
      },
      rootCauseMap: causalTree,
      pathways: this.rca.taprootPathways(),
      rootCauses: event.rootCauses,
      contributingFactors: event.contributingFactors,
      correctiveActions: event.correctiveActions,
      evidence: {
        attachments: event.attachments.length,
        witnesses: event.witnesses.length,
        statements: event.witnesses.reduce(
          (s, w) => s + w.statements.length,
          0,
        ),
        injuries: event.injuries.length,
      },
      html: this.renderPrintableHtml(event, executiveSummary, causalTree),
    };
  }

  private buildExecutiveSummary(event: {
    title: string;
    eventType: string;
    severity: string;
    description: string | null;
    rootCauses: Array<{ description: string }>;
    correctiveActions: Array<{ title: string; status: string }>;
    investigation?: {
      immediateActions?: string | null;
      narrative?: string | null;
    } | null;
  }): string {
    const parts = [
      `${event.eventType.replace(/_/g, ' ')} — ${event.severity} severity: ${
        event.title
      }.`,
      event.description ? event.description.slice(0, 400) : '',
      event.investigation?.immediateActions
        ? `Immediate actions: ${event.investigation.immediateActions}`
        : '',
      event.rootCauses.length
        ? `Root causes identified: ${event.rootCauses
            .map((r) => r.description)
            .join('; ')}`
        : 'Root cause analysis in progress.',
      event.correctiveActions.length
        ? `${event.correctiveActions.length} corrective action(s) — ${
            event.correctiveActions.filter(
              (c) => c.status === 'closed' || c.status === 'verified',
            ).length
          } closed.`
        : '',
    ].filter(Boolean);
    return parts.join('\n\n');
  }

  private renderPrintableHtml(
    event: {
      title: string;
      eventType: string;
      severity: string;
      project: { name: string };
      occurredAt: Date;
      rootCauses: Array<{ description: string; method: string }>;
      correctiveActions: Array<{
        title: string;
        status: string;
        dueAt: Date | null;
      }>;
    },
    summary: string,
    tree: unknown,
  ): string {
    const treeJson = JSON.stringify(tree, null, 2);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Investigation Report — ${escapeHtml(
      event.title,
    )}</title>
<style>
body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#0a2540}
h1{font-size:1.5rem}h2{font-size:1.1rem;margin-top:1.5rem;border-bottom:1px solid #e2e8f0;padding-bottom:.25rem}
.meta{color:#64748b;font-size:.875rem}.summary{white-space:pre-wrap;line-height:1.5}
pre{background:#f8fafc;padding:1rem;border-radius:8px;font-size:11px;overflow:auto}
ul{padding-left:1.25rem}
@media print{body{margin:0}}
</style></head><body>
<h1>Investigation Report</h1>
<p class="meta">${escapeHtml(event.project.name)} · ${event.eventType} · ${
      event.severity
    } · ${event.occurredAt.toLocaleDateString()}</p>
<h2>Executive summary</h2>
<div class="summary">${escapeHtml(summary)}</div>
<h2>Root causes</h2>
<ul>${
      event.rootCauses
        .map((r) => `<li>${escapeHtml(r.description)} (${r.method})</li>`)
        .join('') || '<li>None recorded</li>'
    }</ul>
<h2>Corrective actions</h2>
<ul>${
      event.correctiveActions
        .map(
          (c) =>
            `<li>${escapeHtml(c.title)} — ${c.status}${
              c.dueAt ? ` (due ${c.dueAt.toLocaleDateString()})` : ''
            }</li>`,
        )
        .join('') || '<li>None</li>'
    }</ul>
<h2>Root cause map</h2>
<pre>${escapeHtml(treeJson)}</pre>
<p class="meta">Generated by Vera Platform · ${new Date().toLocaleString()}</p>
</body></html>`;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
