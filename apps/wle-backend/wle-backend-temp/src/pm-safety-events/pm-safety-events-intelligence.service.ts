import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SifHecaService } from '../sif-heca/sif-heca.service';
import { EventClassificationEngine } from './event-classification.engine';
import { SeverityRiskEngine } from './severity-risk.engine';
import { RcaEngine } from './rca.engine';

@Injectable()
export class PmSafetyEventsIntelligenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classifier: EventClassificationEngine,
    private readonly riskEngine: SeverityRiskEngine,
    private readonly rca: RcaEngine,
    @Optional() private readonly sifHeca?: SifHecaService,
  ) {}

  async getEventScore(eventId: string) {
    const event = await this.prisma.pmSafetyEvent.findFirst({
      where: { id: eventId, deletedAt: null },
      include: { injuries: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    if (event.sifEventId && this.sifHeca) {
      const sif = await this.sifHeca.getEvent(event.sifEventId);
      return {
        source: 'sif_heca',
        sifEventId: event.sifEventId,
        sif_score: sif.sifScore?.sifScore ?? null,
        sif_category: sif.sifScore?.sifCategory ?? null,
        heca_category:
          sif.hecaScore?.hecaCategoryCode ?? event.hecaCategoryCode,
        heca_category_label: sif.hecaScore?.hecaCategoryLabel ?? null,
        risk_score: event.riskScore,
        requires_supervisor_review: event.requiresSupervisorReview,
      };
    }

    if (this.sifHeca) {
      const hasMedical = event.injuries.some((i) => i.medicalAid || i.lostTime);
      const energyTypes = [
        this.classifier.suggestHecaCategory(
          event.description ?? event.title,
          event.hecaCategoryCode ?? undefined,
        ),
      ];
      const dry = await this.sifHeca.evaluateDryRun({
        title: event.title,
        description: event.description ?? undefined,
        companyId: event.companyId,
        projectId: event.projectId,
        scoringInput: {
          hazardSeverity:
            event.severity === 'critical'
              ? 5
              : event.severity === 'high'
              ? 4
              : event.severity === 'medium'
              ? 3
              : 2,
          hazardLikelihood: hasMedical ? 5 : event.likelihood,
          energyTypes,
          controls: [],
        },
      });
      return {
        source: 'dry_run',
        sifEventId: null,
        ...dry,
        risk_score: event.riskScore,
      };
    }

    return {
      source: 'event_risk',
      sif_score: null,
      heca_category: event.hecaCategoryCode,
      risk_score: event.riskScore,
      requires_supervisor_review: event.requiresSupervisorReview,
    };
  }

  /** CAIL-style inference before submit (deterministic). */
  async predictFromEvent(eventId: string) {
    const event = await this.prisma.pmSafetyEvent.findFirst({
      where: { id: eventId, deletedAt: null },
      include: {
        injuries: true,
        equipmentLinks: true,
        people: true,
        contributingFactors: true,
        rootCauses: true,
      },
    });
    if (!event) throw new NotFoundException('Event not found');

    const score = await this.getEventScore(eventId);
    const lib = await this.prisma.pmRootCauseLibraryEntry.findMany({
      where: { companyId: event.companyId, active: true },
    });
    const rootCauseSuggestions = this.rca.suggestRootCauses({
      description: event.description ?? event.title,
      eventType: event.eventType,
      contributingFactors: event.contributingFactors.map((f) => f.label),
      library: lib,
    });

    const workerIds = [
      ...event.people
        .map((p) => p.workerId)
        .filter((w): w is number => w != null),
      ...event.injuries
        .map((i) => i.workerId)
        .filter((w): w is number => w != null),
    ];
    const workerImpacts = await Promise.all(
      [...new Set(workerIds)].map((id) =>
        this.workerRiskProfile(id, event.projectId),
      ),
    );

    const equipmentCount = event.equipmentLinks.length;
    const recurrenceLikelihood = Math.min(
      100,
      ((score.sif_score as number | null) ?? event.riskScore) +
        event.rootCauses.length * 5 +
        (event.severity === 'critical' ? 20 : 0),
    );

    return {
      sif_score: score.sif_score,
      heca_category: score.heca_category,
      root_cause_suggestions: rootCauseSuggestions,
      recommended_corrective_actions: rootCauseSuggestions
        .slice(0, 3)
        .map((r) => ({
          title: `Address: ${r.label}`,
          priority: r.score >= 3 ? 'high' : 'medium',
        })),
      predictive_recurrence_likelihood: recurrenceLikelihood,
      worker_risk_impacts: workerImpacts,
      equipment_risk_impact: {
        equipmentInvolved: equipmentCount,
        lockoutsApplied: event.equipmentLinks.filter((e) => e.lockoutApplied)
          .length,
      },
      requires_safety_review:
        event.requiresSupervisorReview ||
        (typeof score.sif_score === 'number' && score.sif_score >= 70),
      explainability: [
        {
          rule: 'recurrence',
          detail: `risk + RCA depth + severity → ${recurrenceLikelihood}%`,
        },
      ],
    };
  }

  async projectAnalytics(projectId: number) {
    const since90 = new Date(Date.now() - 90 * 86400000);
    const events = await this.prisma.pmSafetyEvent.findMany({
      where: { projectId, deletedAt: null },
      select: {
        eventType: true,
        severity: true,
        status: true,
        createdAt: true,
        sifEventId: true,
        hecaCategoryCode: true,
      },
    });

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    for (const e of events) {
      byType[e.eventType] = (byType[e.eventType] ?? 0) + 1;
      bySeverity[e.severity] = (bySeverity[e.severity] ?? 0) + 1;
    }

    const rootCauses = await this.prisma.pmSafetyEventRootCause.groupBy({
      by: ['category'],
      where: { event: { projectId, deletedAt: null } },
      _count: true,
    });

    const recent90 = events.filter((e) => e.createdAt >= since90);
    const nearMiss = byType.near_miss ?? 0;
    const injuries = byType.incident_injury ?? 0;
    const projectIncidentScore = Math.max(
      0,
      100 - injuries * 15 - (bySeverity.critical ?? 0) * 20 - nearMiss * 2,
    );

    const [peopleInvolved, equipmentInvolved, sifLinked] = await Promise.all([
      this.prisma.pmSafetyEventPerson.groupBy({
        by: ['role'],
        where: { event: { projectId, deletedAt: null } },
        _count: true,
      }),
      this.prisma.pmSafetyEventEquipment.count({
        where: { event: { projectId, deletedAt: null } },
      }),
      this.prisma.pmSafetyEvent.count({
        where: { projectId, deletedAt: null, sifEventId: { not: null } },
      }),
    ]);

    const hecaTrend: Record<string, number> = {};
    for (const e of events) {
      if (e.hecaCategoryCode) {
        hecaTrend[e.hecaCategoryCode] =
          (hecaTrend[e.hecaCategoryCode] ?? 0) + 1;
      }
    }

    return {
      totalEvents: events.length,
      byType,
      bySeverity,
      rootCauseDistribution: rootCauses,
      nearMissTrend: nearMiss,
      injuryCount: injuries,
      projectIncidentScore,
      complianceLeadingIndicator: projectIncidentScore,
      trends: {
        events90d: recent90.length,
        injuryRate90d:
          recent90.length > 0
            ? Math.round(
                (recent90.filter((e) => e.eventType === 'incident_injury')
                  .length /
                  recent90.length) *
                  100,
              )
            : 0,
      },
      workerInvolvementByRole: peopleInvolved,
      equipmentInvolvementCount: equipmentInvolved,
      sifHecaLinkedCount: sifLinked,
      hecaCategoryTrend: hecaTrend,
      explainability: [
        {
          rule: 'project_incident_score',
          detail: `100 - injuries*15 - critical*20 - nearMiss*2`,
        },
      ],
    };
  }

  async workerRiskProfile(workerId: number, projectId: number) {
    const involved = await this.prisma.pmSafetyEventPerson.count({
      where: { workerId, event: { projectId, deletedAt: null } },
    });
    const injuries = await this.prisma.pmSafetyEventInjury.count({
      where: { workerId, event: { projectId, deletedAt: null } },
    });
    return {
      workerId,
      eventsInvolved: involved,
      injuryRecords: injuries,
      riskScore: Math.min(100, involved * 10 + injuries * 25),
    };
  }
}
