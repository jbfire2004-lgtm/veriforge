import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type HcCailInsight = {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  explanation: string;
  inputs: Record<string, unknown>;
  recommendation: string;
  correlatedModules: string[];
};

@Injectable()
export class PmUnifiedHazardControlCailService {
  constructor(private readonly prisma: PrismaService) {}

  companyHazardScore(metrics: {
    publishedHazards: number;
    unmappedHazards: number;
    sifCount: number;
    chronicCount: number;
  }): number {
    let score = 100;
    score -= metrics.unmappedHazards * 8;
    score -= metrics.sifCount * 5;
    score -= metrics.chronicCount * 10;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  async insights(filters: {
    companyId: number;
    projectId?: number;
  }): Promise<HcCailInsight[]> {
    const where = {
      companyId: filters.companyId,
      deletedAt: null,
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    };

    const [unmapped, sifHazards, weakLinks, chronic, openCapa] =
      await Promise.all([
        this.prisma.pmUnifiedHazard.count({
          where: {
            ...where,
            status: 'published',
            controlLinks: { none: {} },
          },
        }),
        this.prisma.pmUnifiedHazard.count({
          where: { ...where, sifPotential: true, status: 'published' },
        }),
        this.prisma.pmUnifiedHazardControlLink.count({
          where: {
            hazard: { ...where },
            OR: [{ effectivenessScore: { lt: 2 } }, { verified: false }],
          },
        }),
        this.prisma.pmUnifiedHazard.count({
          where: {
            ...where,
            sourceType: 'incident',
            createdAt: { gte: new Date(Date.now() - 90 * 86400000) },
          },
        }),
        this.prisma.pmCorrectiveAction.count({
          where: {
            companyId: filters.companyId,
            ...(filters.projectId ? { projectId: filters.projectId } : {}),
            status: { in: ['open', 'assigned', 'in_progress'] },
          },
        }),
      ]);

    const insights: HcCailInsight[] = [];

    if (unmapped > 0) {
      insights.push({
        id: `hc-unmapped-${filters.companyId}`,
        category: 'control_mapping',
        severity: unmapped >= 5 ? 'high' : 'medium',
        title: 'Published hazards without mapped controls',
        explanation: `${unmapped} published hazard(s) have no linked controls — enforcement may block tasks and zone entry.`,
        inputs: {
          unmapped,
          companyId: filters.companyId,
          projectId: filters.projectId,
        },
        recommendation:
          'Run control suggestion engine and publish mapped controls.',
        correlatedModules: [
          'unified-hazard-control',
          'jha-flha',
          'project-management',
        ],
      });
    }

    if (sifHazards > 0) {
      insights.push({
        id: `hc-sif-${filters.companyId}`,
        category: 'sif_heca',
        severity: 'critical',
        title: 'SIF-potential hazards active',
        explanation: `${sifHazards} hazard(s) flagged SIF-potential require supervisor review and strong controls.`,
        inputs: { sifHazards },
        recommendation:
          'Complete SIF/HECA review and link engineering + administrative controls.',
        correlatedModules: ['sif-heca', 'jha-flha', 'corrective-actions'],
      });
    }

    if (weakLinks > 0) {
      insights.push({
        id: `hc-weak-${filters.companyId}`,
        category: 'control_effectiveness',
        severity: 'medium',
        title: 'Weak or unverified controls',
        explanation: `${weakLinks} hazard-control link(s) below effectiveness threshold or not verified.`,
        inputs: { weakLinks },
        recommendation:
          'Verify controls in field and update effectiveness scores.',
        correlatedModules: ['inspections', 'corrective-actions'],
      });
    }

    if (chronic >= 3) {
      insights.push({
        id: `hc-chronic-${filters.companyId}`,
        category: 'chronic_hazard',
        severity: 'high',
        title: 'Chronic hazard pattern from incidents',
        explanation: `${chronic} incident-sourced hazards in 90 days indicate recurring exposure.`,
        inputs: { chronic },
        recommendation:
          'Launch CAPA and update company hazard library with engineered controls.',
        correlatedModules: [
          'incidents',
          'corrective-actions',
          'company-safety-context',
        ],
      });
    }

    if (openCapa > 0) {
      insights.push({
        id: `hc-capa-${filters.companyId}`,
        category: 'corrective_actions',
        severity: openCapa >= 5 ? 'high' : 'low',
        title: 'Open CAPA linked to hazard program',
        explanation: `${openCapa} open corrective action(s) may correlate with weak hazard controls.`,
        inputs: { openCapa },
        recommendation:
          'Close high-severity CAPA before publishing new task-level hazards.',
        correlatedModules: ['corrective-actions', 'worker-safety-profile'],
      });
    }

    return insights;
  }

  async predictHazardDetection(filters: {
    companyId: number;
    projectId?: number;
  }): Promise<Array<{ title: string; source: string; confidence: number }>> {
    const since = new Date(Date.now() - 90 * 86400000);
    const [defs, incidents, existing] = await Promise.all([
      this.prisma.pmInspectionDeficiency.findMany({
        where: {
          inspection: {
            companyId: filters.companyId,
            ...(filters.projectId ? { projectId: filters.projectId } : {}),
          },
          createdAt: { gte: since },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pmSafetyEvent.findMany({
        where: {
          companyId: filters.companyId,
          ...(filters.projectId ? { projectId: filters.projectId } : {}),
          occurredAt: { gte: since },
        },
        take: 8,
        orderBy: { occurredAt: 'desc' },
      }),
      this.prisma.pmUnifiedHazard.findMany({
        where: {
          companyId: filters.companyId,
          deletedAt: null,
          ...(filters.projectId ? { projectId: filters.projectId } : {}),
        },
        select: { title: true },
      }),
    ]);
    const seen = new Set(existing.map((h) => h.title.toLowerCase()));
    const out: Array<{ title: string; source: string; confidence: number }> =
      [];
    for (const d of defs) {
      if (seen.has(d.title.toLowerCase())) continue;
      out.push({ title: d.title, source: 'inspection', confidence: 0.74 });
    }
    for (const e of incidents) {
      if (seen.has(e.title.toLowerCase())) continue;
      out.push({ title: e.title, source: 'incident', confidence: 0.7 });
    }
    return out.slice(0, 12);
  }

  async hazardIncidentCorrelation(filters: {
    companyId: number;
    projectId?: number;
  }): Promise<
    Array<{ hazardId: string; title: string; incidentCount: number }>
  > {
    const hazards = await this.prisma.pmUnifiedHazard.findMany({
      where: {
        companyId: filters.companyId,
        sourceType: 'incident',
        deletedAt: null,
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
      },
      select: { id: true, title: true, sourceId: true },
      take: 50,
    });
    const correlations: Array<{
      hazardId: string;
      title: string;
      incidentCount: number;
    }> = [];
    for (const h of hazards) {
      const count = h.sourceId
        ? await this.prisma.pmSafetyEvent.count({
            where: { id: h.sourceId },
          })
        : 0;
      correlations.push({
        hazardId: h.id,
        title: h.title,
        incidentCount: count || 1,
      });
    }
    return correlations.sort((a, b) => b.incidentCount - a.incidentCount);
  }

  async projectHazardScore(projectId: number): Promise<number> {
    const [published, unmapped, sif, weak] = await Promise.all([
      this.prisma.pmUnifiedHazard.count({
        where: { projectId, status: 'published', deletedAt: null },
      }),
      this.prisma.pmUnifiedHazard.count({
        where: {
          projectId,
          status: 'published',
          deletedAt: null,
          controlLinks: { none: {} },
        },
      }),
      this.prisma.pmUnifiedHazard.count({
        where: { projectId, sifPotential: true, deletedAt: null },
      }),
      this.prisma.pmUnifiedHazardControlLink.count({
        where: {
          hazard: { projectId },
          OR: [{ effectivenessScore: { lt: 2 } }, { verified: false }],
        },
      }),
    ]);
    return this.companyHazardScore({
      publishedHazards: published,
      unmappedHazards: unmapped,
      sifCount: sif,
      chronicCount: weak,
    });
  }

  async companyHazardScoreFromDb(
    companyId: number,
    projectId?: number,
  ): Promise<number> {
    const where = {
      companyId,
      deletedAt: null,
      status: 'published' as const,
      ...(projectId ? { projectId } : {}),
    };
    const [published, unmapped, sif, chronic] = await Promise.all([
      this.prisma.pmUnifiedHazard.count({ where }),
      this.prisma.pmUnifiedHazard.count({
        where: { ...where, controlLinks: { none: {} } },
      }),
      this.prisma.pmUnifiedHazard.count({
        where: { ...where, sifPotential: true },
      }),
      this.prisma.pmUnifiedHazard.count({
        where: {
          companyId,
          sourceType: 'incident',
          createdAt: { gte: new Date(Date.now() - 90 * 86400000) },
          ...(projectId ? { projectId } : {}),
        },
      }),
    ]);
    return this.companyHazardScore({
      publishedHazards: published,
      unmappedHazards: unmapped,
      sifCount: sif,
      chronicCount: chronic,
    });
  }

  async chronicHazardDetection(filters: {
    companyId: number;
    projectId?: number;
  }): Promise<Array<{ title: string; repeatCount: number }>> {
    const since = new Date(Date.now() - 180 * 86400000);
    const hazards = await this.prisma.pmUnifiedHazard.findMany({
      where: {
        companyId: filters.companyId,
        deletedAt: null,
        createdAt: { gte: since },
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
      },
      select: { title: true },
    });
    const counts = new Map<string, number>();
    for (const h of hazards) {
      const key = h.title.toLowerCase().trim();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, n]) => n >= 2)
      .map(([title, repeatCount]) => ({ title, repeatCount }))
      .sort((a, b) => b.repeatCount - a.repeatCount)
      .slice(0, 10);
  }
}
