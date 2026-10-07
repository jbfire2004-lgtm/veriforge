import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PmSafetyEventType } from '@prisma/client';
import { IncidentSifEngineService } from '../pm-safety-events/incident-sif-engine.service';
import type { IncidentSifEngineInput } from '../pm-safety-events/incident-sif-engine.types';
import { PmSafetyEventsIntelligenceService } from '../pm-safety-events/pm-safety-events-intelligence.service';
import { TrainingCompetencyEngineService } from '../pm-training/training-competency-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import type {
  IncidentIntelligenceAiInput,
  IncidentIntelligenceAiResult,
  IncidentIntelligenceJson,
  IncidentRecurrenceRisk,
  LinkedTrainingGap,
} from './incident-intelligence-ai.types';

const EVENT_TYPE_LABELS: Record<PmSafetyEventType, string> = {
  incident_injury: 'Injury',
  incident_property: 'Property damage',
  incident_environmental: 'Environmental',
  incident_equipment: 'Equipment incident',
  near_miss: 'Near miss',
  hazard_observation: 'Hazard observation',
  positive_observation: 'Positive observation',
  behavioral_observation: 'Behavioral observation',
  equipment_failure: 'Equipment failure',
  security_event: 'Security event',
  custom: 'Custom event',
};

const TASK_KEYWORDS: Array<{ pattern: RegExp; tasks: string[] }> = [
  { pattern: /height|fall|scaffold|roof/i, tasks: ['height', 'scaffold'] },
  { pattern: /confined space/i, tasks: ['confined space'] },
  { pattern: /excavat|trench/i, tasks: ['excavation'] },
  { pattern: /crane|lift|rigging/i, tasks: ['lifting', 'rigging'] },
  {
    pattern: /electr|energized|arc flash/i,
    tasks: ['energized', 'electrical'],
  },
  { pattern: /hot work|weld|torch/i, tasks: ['hot_work', 'welding'] },
  { pattern: /hazmat|whmis|chemical|spill/i, tasks: ['hazmat'] },
  { pattern: /line of fire|struck/i, tasks: ['line of fire'] },
];

@Injectable()
export class IncidentIntelligenceAiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly incidentSifEngine: IncidentSifEngineService,
    private readonly eventsIntelligence: PmSafetyEventsIntelligenceService,
    private readonly trainingEngine: TrainingCompetencyEngineService,
  ) {}

  async analyze(
    input: IncidentIntelligenceAiInput,
  ): Promise<IncidentIntelligenceAiResult> {
    const engineInput = await this.resolveInput(input);
    const engineOutput = this.incidentSifEngine.generate(engineInput);

    const prediction = input.eventId
      ? await this.eventsIntelligence
          .predictFromEvent(input.eventId)
          .catch(() => null)
      : null;

    const similarCount = await this.countSimilarIncidents(
      engineInput,
      input.eventId,
    );
    const training_gaps = await this.linkTrainingGaps(
      engineInput,
      engineOutput.classification.sif_potential,
    );

    const incident_type = this.formatIncidentType(
      engineOutput.classification.event_types,
      engineInput.incident_type,
    );
    const sif_potential = engineOutput.classification.sif_potential;
    const root_causes = this.collectRootCauses(
      engineOutput.root_cause_analysis,
    );
    const recommended_actions = this.buildRecommendedActions(
      engineOutput.capa_list,
      training_gaps,
      sif_potential,
    );
    const recurrence_risk = this.predictRecurrenceRisk(
      prediction?.predictive_recurrence_likelihood,
      similarCount,
      sif_potential,
      engineOutput.classification.severity_assessment,
    );

    const core: IncidentIntelligenceJson = {
      incident_type,
      sif_potential,
      root_causes,
      recommended_actions,
      recurrence_risk,
    };

    return {
      ...core,
      intelligence_id: randomUUID(),
      source: 'rule_engine',
      model: null,
      training_gaps,
      similar_incidents_count: similarCount,
      severity_assessment: engineOutput.classification.severity_assessment,
      field_summary: this.buildFieldSummary(core, training_gaps, similarCount),
      sif_reasoning: engineOutput.classification.sif_reasoning,
    };
  }

  private async resolveInput(
    input: IncidentIntelligenceAiInput,
  ): Promise<IncidentSifEngineInput> {
    if (input.eventId) {
      return this.loadInputFromEvent(input.eventId);
    }
    if (input.engineInput?.description_free_text) {
      return input.engineInput;
    }
    throw new BadRequestException(
      'eventId or engineInput.description_free_text is required',
    );
  }

  private async loadInputFromEvent(
    eventId: string,
  ): Promise<IncidentSifEngineInput> {
    const event = await this.prisma.pmSafetyEvent.findFirst({
      where: { id: eventId, deletedAt: null },
      include: {
        injuries: true,
        people: true,
        attachments: true,
        investigation: true,
        rootCauses: true,
        contributingFactors: true,
      },
    });
    if (!event) throw new NotFoundException('Safety event not found');

    const similar = await this.prisma.pmSafetyEvent.findMany({
      where: {
        projectId: event.projectId,
        eventType: event.eventType,
        id: { not: eventId },
        deletedAt: null,
      },
      orderBy: { occurredAt: 'desc' },
      take: 5,
      select: { title: true, occurredAt: true, description: true },
    });

    const base = this.incidentSifEngine.inputFromEvent(event);
    base.similar_past_incidents = similar.map((s) => ({
      title: s.title,
      date: s.occurredAt.toISOString(),
      summary: s.description ?? s.title,
    }));
    return base;
  }

  private formatIncidentType(eventTypes: string[], fallback: string): string {
    for (const t of eventTypes) {
      if (t in EVENT_TYPE_LABELS) {
        return EVENT_TYPE_LABELS[t as PmSafetyEventType];
      }
    }
    return fallback.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private collectRootCauses(rca: {
    immediate_causes: Array<{ description: string }>;
    underlying_causes: Array<{ description: string }>;
    system_causes: Array<{ description: string }>;
    five_whys: string[];
  }): string[] {
    const causes = new Set<string>();
    for (const c of [
      ...rca.immediate_causes,
      ...rca.underlying_causes,
      ...rca.system_causes,
    ]) {
      causes.add(c.description);
    }
    if (!causes.size && rca.five_whys.length) {
      causes.add(rca.five_whys[rca.five_whys.length - 1]);
    }
    return [...causes].slice(0, 8);
  }

  private buildRecommendedActions(
    capa: Array<{ action: string; priority: string }>,
    trainingGaps: LinkedTrainingGap[],
    sifPotential: string,
  ): string[] {
    const actions = new Set<string>();

    for (const item of capa) {
      actions.add(`[${item.priority}] ${item.action}`);
    }

    for (const gap of trainingGaps
      .filter((g) => g.priority === 'high')
      .slice(0, 4)) {
      const who =
        gap.worker_name ??
        (gap.worker_id ? `Worker #${gap.worker_id}` : 'Crew');
      actions.add(`Schedule ${gap.training_name} for ${who} (${gap.status})`);
    }

    if (sifPotential === 'yes') {
      actions.add(
        'Escalate to SIF review board and verify critical controls before work resumes',
      );
    }

    return [...actions].slice(0, 12);
  }

  private predictRecurrenceRisk(
    predictiveLikelihood: number | undefined,
    similarCount: number,
    sifPotential: string,
    severityAssessment: string,
  ): IncidentRecurrenceRisk {
    let score = predictiveLikelihood ?? 30;
    score += similarCount * 12;
    if (sifPotential === 'yes') score += 18;
    if (/critical/i.test(severityAssessment)) score += 15;
    if (/high/i.test(severityAssessment)) score += 8;

    if (score >= 76) return 'critical';
    if (score >= 51) return 'high';
    if (score >= 26) return 'medium';
    return 'low';
  }

  private async countSimilarIncidents(
    input: IncidentSifEngineInput,
    excludeEventId?: string,
  ): Promise<number> {
    if (!input.projectId) {
      return input.similar_past_incidents?.length ?? 0;
    }

    const eventType = this.inferEventType(input.incident_type);
    return this.prisma.pmSafetyEvent.count({
      where: {
        projectId: input.projectId,
        eventType,
        deletedAt: null,
        ...(excludeEventId ? { id: { not: excludeEventId } } : {}),
        occurredAt: {
          gte: new Date(Date.now() - 365 * 86_400_000),
        },
      },
    });
  }

  private inferEventType(incidentType: string): PmSafetyEventType {
    const key = incidentType.toLowerCase().replace(/\s+/g, '_');
    const map: Record<string, PmSafetyEventType> = {
      injury: 'incident_injury',
      near_miss: 'near_miss',
      property_damage: 'incident_property',
      environmental: 'incident_environmental',
      security: 'security_event',
      process_upset: 'equipment_failure',
    };
    return map[key] ?? 'hazard_observation';
  }

  private async linkTrainingGaps(
    input: IncidentSifEngineInput,
    sifPotential: string,
  ): Promise<LinkedTrainingGap[]> {
    const workerIds = [
      ...new Set(
        (input.people_involved ?? [])
          .map((p) => p.worker_id)
          .filter((id): id is number => id != null),
      ),
    ];

    if (!workerIds.length || !input.projectId) {
      return this.inferTrainingGapsFromNarrative(
        input.description_free_text,
        sifPotential,
      );
    }

    const tasks = this.inferTasks(input.description_free_text);
    const gaps: LinkedTrainingGap[] = [];

    for (const workerId of workerIds.slice(0, 8)) {
      const worker = await this.prisma.worker.findUnique({
        where: { id: workerId },
        select: { firstName: true, lastName: true },
      });
      const workerName = worker
        ? `${worker.firstName} ${worker.lastName}`.trim()
        : undefined;

      const trainingInput = await this.trainingEngine.buildInputFromWorker(
        workerId,
        input.projectId,
        {
          tasks,
          critical_risks: sifPotential === 'yes' ? ['SIF exposure'] : [],
        },
      );
      const result = this.trainingEngine.generate(trainingInput);

      for (const gap of result.gaps.slice(0, 6)) {
        gaps.push({
          worker_id: workerId,
          worker_name: workerName,
          training_code: gap.course.toLowerCase().replace(/\s+/g, '_'),
          training_name: gap.course,
          status: gap.status,
          priority:
            gap.priority_tier === 'immediate'
              ? 'high'
              : gap.priority_tier === 'short_term'
              ? 'medium'
              : 'low',
          reason: gap.remediation,
        });
      }
    }

    return gaps.slice(0, 12);
  }

  private inferTasks(text: string): string[] {
    const tasks = new Set<string>();
    for (const rule of TASK_KEYWORDS) {
      if (rule.pattern.test(text)) {
        for (const t of rule.tasks) tasks.add(t);
      }
    }
    return [...tasks];
  }

  private inferTrainingGapsFromNarrative(
    text: string,
    sifPotential: string,
  ): LinkedTrainingGap[] {
    const gaps: LinkedTrainingGap[] = [];
    const tasks = this.inferTasks(text);

    const courseMap: Record<string, string> = {
      height: 'Fall Protection',
      scaffold: 'Scaffold User',
      'confined space': 'Confined Space Entry',
      excavation: 'Excavation Safety',
      lifting: 'Rigging and Hoisting',
      rigging: 'Rigging and Hoisting',
      energized: 'LOTO / Electrical Safety',
      electrical: 'Electrical Safety',
      hot_work: 'Hot Work / Fire Watch',
      welding: 'Hot Work',
      hazmat: 'WHMIS',
      'line of fire': 'Line of Fire Awareness',
    };

    for (const task of tasks) {
      const course = courseMap[task];
      if (course) {
        gaps.push({
          training_code: task,
          training_name: course,
          status: 'recommended',
          priority: sifPotential === 'yes' ? 'high' : 'medium',
          reason: `Incident narrative indicates ${task} exposure`,
        });
      }
    }

    return gaps;
  }

  private buildFieldSummary(
    core: IncidentIntelligenceJson,
    trainingGaps: LinkedTrainingGap[],
    similarCount: number,
  ): string {
    return [
      `${
        core.incident_type
      } classified with SIF potential ${core.sif_potential.toUpperCase()}.`,
      `${core.root_causes.length} root cause(s) identified; recurrence risk ${core.recurrence_risk}.`,
      trainingGaps.length
        ? `${trainingGaps.length} training gap(s) linked to involved workers.`
        : 'No worker-specific training gaps resolved — review narrative-based recommendations.',
      similarCount
        ? `${similarCount} similar incident(s) on project in the past 12 months.`
        : 'No similar incident pattern on project in the past 12 months.',
    ].join(' ');
  }
}
