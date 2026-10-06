import { Injectable } from '@nestjs/common';
import { PmSafetyEventType } from '@prisma/client';
import { EventClassificationEngine } from './event-classification.engine';
import { SeverityRiskEngine } from './severity-risk.engine';
import { RcaEngine } from './rca.engine';
import { DEFAULT_ROOT_CAUSES } from './pm-safety-events.constants';
import type {
  IncidentCapaItem,
  IncidentClassification,
  IncidentRootCauseAnalysis,
  IncidentSifEngineInput,
  IncidentSifEngineOutput,
} from './incident-sif-engine.types';

const SIF_KEYWORDS = [
  'fall',
  'height',
  'electrocut',
  'energized',
  'struck-by',
  'struck by',
  'caught-in',
  'caught in',
  'crush',
  'confined space',
  'asphyx',
  'amputation',
  'fatality',
  'fatal',
  'sif',
  'serious injury',
  'line of fire',
  'overturn',
  'rollover',
  'trench collapse',
  'arc flash',
];

const EVENT_TYPE_TO_INPUT: Record<
  PmSafetyEventType,
  IncidentSifEngineInput['incident_type']
> = {
  incident_injury: 'injury',
  near_miss: 'near_miss',
  incident_property: 'property_damage',
  incident_environmental: 'environmental',
  security_event: 'security',
  equipment_failure: 'process_upset',
  incident_equipment: 'property_damage',
  hazard_observation: 'near_miss',
  positive_observation: 'near_miss',
  behavioral_observation: 'near_miss',
  custom: 'process_upset',
};

const INCIDENT_TYPE_MAP: Record<string, PmSafetyEventType> = {
  injury: 'incident_injury',
  near_miss: 'near_miss',
  'near miss': 'near_miss',
  property_damage: 'incident_property',
  'property damage': 'incident_property',
  environmental: 'incident_environmental',
  security: 'security_event',
  process_upset: 'equipment_failure',
};

@Injectable()
export class IncidentSifEngineService {
  constructor(
    private readonly classifier: EventClassificationEngine,
    private readonly risk: SeverityRiskEngine,
    private readonly rca: RcaEngine,
  ) {}

  inputFromEvent(event: {
    companyId: number;
    projectId: number;
    eventType: PmSafetyEventType;
    severity: string;
    description?: string | null;
    title: string;
    occurredAt: Date;
    locationNote?: string | null;
    sifEventId?: string | null;
    sclPotentialSeverity?: string | null;
    injuries?: Array<{ workerId?: number | null }>;
    people?: Array<{
      name?: string | null;
      role: string;
      workerId?: number | null;
    }>;
    attachments?: Array<{ fileName?: string | null }>;
    investigation?: {
      immediateActions?: string | null;
      narrative?: string | null;
    } | null;
    rootCauses?: Array<{ description: string }>;
  }): IncidentSifEngineInput {
    const sifPotential =
      event.sifEventId ||
      event.sclPotentialSeverity === 'critical' ||
      event.sclPotentialSeverity === 'high'
        ? 'yes'
        : 'unknown';

    return {
      incident_type: EVENT_TYPE_TO_INPUT[event.eventType] ?? 'process_upset',
      severity: event.severity === 'low' ? 'potential' : 'actual',
      SIF_potential: sifPotential,
      date_time: event.occurredAt.toISOString(),
      location: event.locationNote ?? undefined,
      people_involved: [
        ...(event.people?.map((p) => ({
          name: p.name ?? undefined,
          role: p.role,
          worker_id: p.workerId ?? undefined,
        })) ?? []),
        ...(event.injuries?.map((i) => ({
          role: 'injured',
          worker_id: i.workerId ?? undefined,
        })) ?? []),
      ],
      description_free_text: event.description ?? event.title,
      immediate_actions_taken: event.investigation?.immediateActions
        ? event.investigation.immediateActions
            .split(/\n|;/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      photos_and_evidence_summaries:
        event.attachments
          ?.map((a) => a.fileName ?? 'Attachment')
          .filter(Boolean) ?? [],
      similar_past_incidents:
        event.rootCauses?.map((rc) => ({ summary: rc.description })) ?? [],
      companyId: event.companyId,
      projectId: event.projectId,
    };
  }

  generate(input: IncidentSifEngineInput): IncidentSifEngineOutput {
    const text = this.fullText(input);
    const eventType = this.resolveEventType(input);
    const classified = this.classifier.classifyType(text, eventType);
    const risk = this.risk.score({
      eventType: classified.eventType,
      description: input.description_free_text,
      hasInjury: input.incident_type === 'injury' || /injur/i.test(text),
      medicalAid: /hospital|medical aid|stitches/i.test(text),
      lostTime: /lost time|lti|days away/i.test(text),
      equipmentFailure: /equipment|failure|breakdown/i.test(text),
    });

    const sif = this.assessSif(input, text, risk.severity);
    const classification = this.buildClassification(
      input,
      classified,
      risk,
      sif,
    );
    const root_cause_analysis = this.buildRca(
      input,
      text,
      classified.eventType,
    );
    const capa_list = this.buildCapa(input, root_cause_analysis, sif);
    const learning_summary = this.buildLearning(
      input,
      classification,
      capa_list,
    );
    const client_report_summary = this.buildClientReport(input, classification);

    return {
      classification,
      root_cause_analysis,
      capa_list,
      learning_summary,
      client_report_summary,
    };
  }

  private fullText(input: IncidentSifEngineInput): string {
    return [
      input.description_free_text,
      input.location,
      ...(input.immediate_actions_taken ?? []),
      ...(input.photos_and_evidence_summaries ?? []),
      ...(input.procedures_or_rules_relevant ?? []),
      ...(input.similar_past_incidents?.map((i) => i.summary ?? i.title) ?? []),
    ]
      .filter(Boolean)
      .join(' ');
  }

  private resolveEventType(input: IncidentSifEngineInput): PmSafetyEventType {
    const key = input.incident_type.toLowerCase().replace(/\s+/g, '_');
    return (
      INCIDENT_TYPE_MAP[key] ??
      INCIDENT_TYPE_MAP[input.incident_type.toLowerCase()] ??
      'hazard_observation'
    );
  }

  private assessSif(
    input: IncidentSifEngineInput,
    text: string,
    severity: string,
  ): { value: 'yes' | 'no' | 'unknown'; reasoning: string } {
    if (input.SIF_potential === 'yes') {
      return { value: 'yes', reasoning: 'Declared SIF potential in intake.' };
    }
    if (input.SIF_potential === 'no') {
      return { value: 'no', reasoning: 'Declared no SIF potential in intake.' };
    }
    const hits = SIF_KEYWORDS.filter((k) => text.toLowerCase().includes(k));
    if (hits.length >= 2 || (hits.length >= 1 && severity === 'critical')) {
      return {
        value: 'yes',
        reasoning: `Life-critical indicators: ${hits.join(
          ', ',
        )}; severity ${severity}.`,
      };
    }
    if (input.incident_type === 'near_miss' && hits.length) {
      return {
        value: 'yes',
        reasoning: `Near miss with SIF precursors: ${hits.join(', ')}.`,
      };
    }
    if (hits.length === 1) {
      return {
        value: 'unknown',
        reasoning: `Possible SIF precursor (${hits[0]}) — verify with investigation lead.`,
      };
    }
    return {
      value: 'no',
      reasoning:
        'No strong SIF precursors identified from narrative; continue standard investigation.',
    };
  }

  private buildClassification(
    input: IncidentSifEngineInput,
    classified: ReturnType<EventClassificationEngine['classifyType']>,
    risk: ReturnType<SeverityRiskEngine['score']>,
    sif: { value: 'yes' | 'no' | 'unknown'; reasoning: string },
  ): IncidentClassification {
    const normalizedType = input.incident_type.replace(/\s/g, '_');
    const people =
      ['injury', 'near_miss'].includes(normalizedType) ||
      (input.people_involved?.length ?? 0) > 0;
    const narrative = this.buildNarrative(input);

    return {
      narrative,
      event_types: [classified.eventType, input.incident_type],
      sif_potential: sif.value,
      sif_reasoning: sif.reasoning,
      impact: {
        people: Boolean(people) || input.incident_type === 'injury',
        environment:
          input.incident_type === 'environmental' ||
          /spill|release/i.test(input.description_free_text),
        asset:
          input.incident_type === 'property_damage' ||
          /damage|equipment/i.test(input.description_free_text),
        reputation: /client|public|media|regulator/i.test(
          input.description_free_text,
        ),
        production: /shutdown|delay|outage/i.test(input.description_free_text),
      },
      severity_assessment: `${risk.severity} (risk score ${risk.riskScore})`,
      requires_regulatory_attention:
        sif.value === 'yes' ||
        risk.severity === 'critical' ||
        (input.constraints ?? []).some((c) =>
          /legal|regulator|report/i.test(c),
        ),
    };
  }

  private buildNarrative(input: IncidentSifEngineInput): string {
    const when = input.date_time
      ? new Date(input.date_time).toLocaleString()
      : 'Date/time not recorded';
    const who = input.people_involved?.length
      ? input.people_involved
          .map((p) => p.name ?? p.role ?? 'person')
          .join(', ')
      : 'Personnel not listed';
    const immediate = input.immediate_actions_taken?.length
      ? ` Immediate actions: ${input.immediate_actions_taken.join('; ')}.`
      : '';
    return `On ${when} at ${
      input.location ?? 'the worksite'
    }, involving ${who}: ${input.description_free_text.trim()}.${immediate}`;
  }

  private buildRca(
    input: IncidentSifEngineInput,
    text: string,
    eventType: PmSafetyEventType,
  ): IncidentRootCauseAnalysis {
    const method = input.org_root_cause_method ?? '5-Why';
    const factors = this.rca.suggestContributingFactors({
      eventType,
      description: text,
    });
    const suggestions = this.rca.suggestRootCauses({
      description: text,
      eventType,
      contributingFactors: factors.map((f) => f.label),
      guidedAnswers: {},
      library: DEFAULT_ROOT_CAUSES.map((r) => ({
        code: r.code,
        label: r.label,
        category: r.category,
      })),
      historicalCodes: input.similar_past_incidents
        ?.map((i) => i.title ?? '')
        .filter(Boolean),
    });

    const topRoot =
      suggestions[0]?.label ?? 'Inadequate hazard identification or control';
    const five_whys = this.rca.buildFiveWhyChain(
      input.description_free_text.slice(0, 200),
      topRoot,
    );

    const immediate_causes = factors.slice(0, 3).map((f) => ({
      category: mapPathwayToCategory(f.pathway),
      description: f.label,
    }));

    if (!immediate_causes.length) {
      immediate_causes.push({
        category: 'People',
        description: 'Unsafe act or condition at point of incident',
      });
    }

    const underlying_causes = suggestions.slice(0, 3).map((s) => ({
      category: mapPathwayToCategory(s.pathway ?? s.category ?? 'process'),
      description: s.label,
    }));

    const system_causes: IncidentRootCauseAnalysis['system_causes'] = [];
    if (/procedure|permit|jha/i.test(text)) {
      system_causes.push({
        category: 'Procedures',
        description: 'Work planning or procedure gap allowed exposure',
      });
    }
    if (/training|competency|orientation/i.test(text)) {
      system_causes.push({
        category: 'People',
        description: 'Training or competency verification gap',
      });
    }
    if (
      /supervision|management|oversight/i.test(text) ||
      input.procedures_or_rules_relevant?.length
    ) {
      system_causes.push({
        category: 'Management',
        description: 'Oversight or management system weakness',
      });
    }
    if (!system_causes.length) {
      system_causes.push({
        category: 'Management',
        description:
          'SMS element requiring review — planning, resources, or verification',
      });
    }

    const fishbone: Record<string, string[]> = {
      People: [],
      Equipment: [],
      Environment: [],
      Procedures: [],
      Management: [],
      Culture: [],
    };
    for (const f of factors) {
      const cat = mapPathwayToCategory(f.pathway);
      fishbone[cat]?.push(f.label);
    }
    for (const s of suggestions.slice(0, 6)) {
      const cat = mapPathwayToCategory(s.pathway ?? s.category ?? 'process');
      fishbone[cat]?.push(s.label);
    }
    for (const proc of input.procedures_or_rules_relevant ?? []) {
      fishbone.Procedures.push(proc);
    }

    return {
      method,
      five_whys,
      immediate_causes,
      underlying_causes,
      system_causes,
      fishbone,
    };
  }

  private buildCapa(
    input: IncidentSifEngineInput,
    rca: IncidentRootCauseAnalysis,
    sif: { value: string },
  ): IncidentCapaItem[] {
    const capa: IncidentCapaItem[] = [];

    for (const action of input.immediate_actions_taken ?? []) {
      capa.push({
        type: 'containment',
        action: `Verify completion and effectiveness: ${action}`,
        owner_role: 'Site supervisor',
        priority: 'high',
        linked_cause: 'Immediate stabilization',
        effectiveness_expectation: 'Stops further harm or exposure at scene',
      });
    }

    if (!input.immediate_actions_taken?.length) {
      capa.push({
        type: 'containment',
        action:
          'Secure area, preserve evidence, and brief crew on stop-work if needed',
        owner_role: 'Site supervisor',
        priority: 'high',
        linked_cause: 'Scene control',
        effectiveness_expectation:
          'Prevents secondary incidents during investigation',
      });
    }

    for (const cause of rca.underlying_causes.slice(0, 3)) {
      capa.push({
        type: 'corrective',
        action: `Address root cause: ${cause.description}`,
        owner_role: ownerForCategory(cause.category),
        priority: sif.value === 'yes' ? 'high' : 'medium',
        linked_cause: cause.description,
        effectiveness_expectation: `Reduces recurrence of ${cause.category.toLowerCase()} failure mode`,
      });
    }

    for (const sys of rca.system_causes.slice(0, 2)) {
      capa.push({
        type: 'preventive',
        action: `SMS improvement: ${sys.description}`,
        owner_role: 'HSE manager',
        priority: 'medium',
        linked_cause: sys.description,
        effectiveness_expectation:
          'Strengthens system controls across similar work',
      });
    }

    if (input.similar_past_incidents?.length) {
      capa.push({
        type: 'preventive',
        action:
          'Review trend with similar past incidents and validate prior CAPA closure',
        owner_role: 'HSE manager',
        priority: 'high',
        linked_cause: 'Recurring pattern',
        effectiveness_expectation: 'Breaks repeat incident chain',
      });
    }

    if (sif.value === 'yes') {
      capa.push({
        type: 'preventive',
        action:
          'Conduct SIF learning review with leadership and share across projects',
        owner_role: 'Project director',
        priority: 'high',
        linked_cause: 'SIF potential',
        effectiveness_expectation:
          'Elevates organizational learning for life-critical risk',
      });
    }

    return capa.slice(0, 12);
  }

  private buildLearning(
    input: IncidentSifEngineInput,
    classification: IncidentClassification,
    capa: IncidentCapaItem[],
  ): string[] {
    const bullets = [
      `${classification.event_types[1] ?? 'Event'} at ${
        input.location ?? 'site'
      } — ${classification.severity_assessment}.`,
      `SIF potential: ${classification.sif_potential.toUpperCase()} — ${
        classification.sif_reasoning
      }`,
      ...capa
        .filter((c) => c.type === 'corrective' || c.type === 'preventive')
        .slice(0, 2)
        .map((c) => `Action: ${c.action}`),
      input.procedures_or_rules_relevant?.length
        ? `Relevant rules: ${input.procedures_or_rules_relevant
            .slice(0, 2)
            .join('; ')}`
        : 'Review JHA/permits for this task type before restart.',
    ];
    return bullets.filter(Boolean).slice(0, 5);
  }

  private buildClientReport(
    input: IncidentSifEngineInput,
    classification: IncidentClassification,
  ): string {
    const when = input.date_time
      ? new Date(input.date_time).toISOString().slice(0, 10)
      : 'the reported date';
    return [
      `On ${when}, an ${input.incident_type.replace(/_/g, ' ')} occurred at ${
        input.location ?? 'the project site'
      }.`,
      classification.narrative,
      `Immediate actions were taken to secure the area and support affected personnel.`,
      `An investigation is underway. Corrective measures will be implemented in accordance with the project safety management system.`,
      classification.requires_regulatory_attention
        ? `Regulatory reporting requirements are being evaluated per contract and legal obligations.`
        : `No external reporting determination has been made pending investigation completion.`,
    ].join(' ');
  }
}

function mapPathwayToCategory(pathway: string): string {
  const p = pathway.toLowerCase();
  if (p.includes('human') || p.includes('people') || p.includes('training'))
    return 'People';
  if (p.includes('equip')) return 'Equipment';
  if (p.includes('env')) return 'Environment';
  if (p.includes('proc') || p.includes('procedure')) return 'Procedures';
  if (p.includes('manage') || p.includes('culture')) return 'Management';
  return 'Procedures';
}

function ownerForCategory(category: string): string {
  switch (category) {
    case 'Equipment':
      return 'Maintenance supervisor';
    case 'Environment':
      return 'Site superintendent';
    case 'Procedures':
      return 'HSE coordinator';
    case 'Management':
      return 'Project manager';
    default:
      return 'Supervisor';
  }
}
