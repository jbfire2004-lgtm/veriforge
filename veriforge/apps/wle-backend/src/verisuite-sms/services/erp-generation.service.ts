import { Injectable } from '@nestjs/common';
import {
  SmsAiModelTier,
  SmsAiSource,
  SmsAiTone,
  SmsErpScenario,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SMS_BEHAVIORS } from '../constants';
import { qualityBand, clamp } from '../types';
import type { SmsRequestScope } from '../types';
import { AiInsightsCacheService } from './ai-insights-cache.service';
import {
  appendixStepsFor,
  type DangerousOccurrenceCode,
} from './erp-ohs-utility.catalog';
import {
  assessmentToOhsRows,
  evaluateDangerousOccurrences,
  normalizeRegion,
} from './dangerous-occurrence.engine';

const SCENARIO_PACKS: Record<
  SmsErpScenario,
  { hazards: string[]; steps: string[]; muster: string; detail: string[] }
> = {
  electrical: {
    hazards: ['arc_flash', 'contact_energized'],
    steps: ['isolate', 'verify_zero_energy', 'rescue_path', 'ems_notify'],
    muster: 'primary_muster',
    detail: [
      'Stop work and clear non-essential personnel',
      'Isolate energy / verify zero energy where safe',
      'Establish rescue path; do not touch victims in contact with energized sources',
      'Call EMS using verified contacts; notify utility if power infrastructure involved',
    ],
  },
  fall: {
    hazards: ['fall_from_height', 'swing_fall'],
    steps: ['stop_work', 'secure_area', 'rescue_plan', 'ems_notify'],
    muster: 'primary_muster',
    detail: [
      'Stop work; secure leading edges and tools',
      'Initiate fall-rescue plan with trained responders',
      'Account crew at muster; call EMS for injuries',
    ],
  },
  trench: {
    hazards: ['cave_in', 'engulfment'],
    steps: ['evacuate_trench', 'shoring_check', 'account_personnel', 'ems_notify'],
    muster: 'trench_muster',
    detail: [
      'Evacuate trench immediately',
      'Do not re-enter without competent person / rescue plan',
      'Account personnel; call EMS for engulfment / injury',
    ],
  },
  chemical: {
    hazards: ['exposure', 'spill'],
    steps: ['evacuate_upwind', 'sds_consult', 'containment', 'ems_notify'],
    muster: 'upwind_muster',
    detail: [
      'Evacuate upwind; consult SDS',
      'Contain only if trained and safe',
      'Notify EMS / fire hazmat as required',
    ],
  },
  rollover: {
    hazards: ['equipment_rollover'],
    steps: ['secure_scene', 'account_operator', 'ems_notify'],
    muster: 'equipment_zone',
    detail: [
      'Secure scene and exclusion zone',
      'Account operator / spotters',
      'Call EMS; do not attempt recovery until cleared',
    ],
  },
  general: {
    hazards: ['general_emergency'],
    steps: ['alarm', 'evacuate', 'account', 'ems_notify'],
    muster: 'primary_muster',
    detail: [
      'Sound alarm / radio emergency',
      'Evacuate to muster point',
      'Account all personnel',
      'Call EMS using verified contacts',
    ],
  },
};

export type ErpGeneratorUserInputs = {
  musterPoints?: Array<{ id?: string; name: string; description?: string }>;
  equipment?: Array<{ name: string; location?: string; qty?: number }>;
  roles?: Array<{ role: string; primaryName?: string; backupName?: string }>;
  communication?: {
    radioChannel?: string;
    phoneTree?: string;
    assemblySignal?: string;
    allClearSignal?: string;
  };
  additionalHazards?: string[];
  siteAddress?: string;
};

export type ErpDocumentSection = {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
};

export type ErpFullDocument = {
  documentType: 'ERP';
  title: string;
  generatedAt: string;
  revision: string;
  summary: {
    scenario: string;
    regionCode: string;
    projectName: string;
    qualityScore: number;
    dangerousOccurrences: DangerousOccurrenceCode[];
    utilityContactCount: number;
    readinessScore: number | null;
    supervisorReviewRequired: boolean;
    ohsFramework?: string;
    mustReportDangerousOccurrence?: boolean;
  };
  project: {
    id: number;
    name: string;
    code: string | null;
    client: string | null;
    companyName: string | null;
    siteName: string | null;
    siteAddress: string | null;
    regionCode: string;
  };
  hazards: string[];
  readiness: {
    score: number | null;
    notes: string[];
    openHighEnergyCount: number;
  };
  ohs: Array<{
    code: string;
    label: string;
    guidance: string;
    mustReport?: boolean;
    urgency?: string;
    authority?: string;
    frameworkLabel?: string;
    preserveScene?: boolean;
    requiredActions?: string[];
  }>;
  dangerousOccurrenceAssessment?: {
    flagged: boolean;
    mustReportAny: boolean;
    narrative: string;
    disclaimer: string;
  };
  /** Hazard-specific dial routing (gas→SaskEnergy, electrical→SaskPower/ATCO, release→OHS+fire) */
  contactRouting?: {
    hazards: string[];
    summary: string[];
    contacts: Array<{
      id: string;
      hazard: string;
      role: string;
      priority: number;
      name: string;
      phone: string | null;
      dialHint: string;
      reason: string;
      verified: boolean;
    }>;
  };
  utilityContacts: Array<{
    id: string;
    agency: string;
    name: string;
    phone: string;
    notes: string;
  }>;
  emsContacts: Array<{
    id: string;
    agency?: string;
    name?: string;
    phone?: string;
  }>;
  userInputs: {
    musterPoints: Array<{ name: string; description?: string }>;
    equipment: Array<{ name: string; location?: string; qty?: number }>;
    roles: Array<{ role: string; primaryName?: string; backupName?: string }>;
    communication: {
      radioChannel: string;
      phoneTree: string;
      assemblySignal: string;
      allClearSignal: string;
    };
  };
  responseSteps: Array<{ order: number; title: string; detail: string }>;
  sections: ErpDocumentSection[];
};

/**
 * ERP generation service (AI-06 / AI-07) + full document generator.
 * EMS / utility phones from verified catalog only — never invent numbers.
 */
@Injectable()
export class ErpGenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: SmsAuditService,
    private readonly aiCache: AiInsightsCacheService,
  ) {}

  async list(scope: SmsRequestScope) {
    return this.prisma.smsErpRecord.findMany({
      where: {
        companyId: scope.companyId,
        deletedAt: null,
        ...(scope.projectId != null ? { projectId: scope.projectId } : {}),
        ...(scope.subcontractorCompanyId
          ? { subcontractorCompanyId: scope.subcontractorCompanyId }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }

  async generate(
    scope: SmsRequestScope,
    body: {
      title: string;
      scenario?: SmsErpScenario;
      projectId?: number;
      workType?: string;
      regionCode?: string;
      emsProviderIds?: string[];
      projectScope?: string;
      hazards?: string[];
      userInputs?: ErpGeneratorUserInputs;
    },
  ) {
    const scenario = body.scenario ?? SmsErpScenario.general;
    const pack = SCENARIO_PACKS[scenario];
    const emsProviderIds = body.emsProviderIds ?? [];
    const document = await this.buildDocument(scope, {
      title: body.title,
      scenario,
      projectId: body.projectId ?? scope.projectId,
      workType: body.workType,
      regionCode: body.regionCode ?? 'CA-AB',
      projectScope: body.projectScope,
      hazards: body.hazards,
      emsProviderIds,
      userInputs: body.userInputs,
    });

    const quality = document.summary.qualityScore;

    const draft = await this.aiCache.getOrCompute(
      scope,
      SMS_BEHAVIORS.ERP_DRAFT,
      {
        scenario,
        projectId: body.projectId ?? scope.projectId,
        title: body.title,
      },
      async () => ({
        behaviorId: SMS_BEHAVIORS.ERP_DRAFT,
        headline: `ERP draft: ${scenario}`,
        body: 'Scenario pack + provincial OHS / utility routing ready. Accept to persist. Contacts are catalog IDs/phones only.',
        confidence: 0.85,
        tone: SmsAiTone.neutral,
        modelTier: SmsAiModelTier.D0,
        source: SmsAiSource.rules,
        pageContext: 'emergency',
        payloadJson: {
          pack,
          emsProviderIds,
          qualityScore: quality,
          title: body.title,
          scenario,
          workType: body.workType,
          regionCode: body.regionCode,
          projectId: body.projectId ?? scope.projectId,
          dangerousOccurrences: document.summary.dangerousOccurrences,
        },
      }),
      'erp',
    );

    const suggestionId = draft.insights[0]?.id;
    await this.audit.log({
      scope,
      action: 'erp.generate',
      entityType: 'erp_draft',
      entityId: suggestionId,
      after: {
        scenario,
        emsProviderIds,
        persisted: false,
        verifiedAt: new Date().toISOString(),
        dangerousOccurrences: document.summary.dangerousOccurrences,
      },
    });

    return {
      draft: {
        title: body.title,
        steps: pack.steps,
        musterPoint:
          document.userInputs.musterPoints[0]?.name ?? pack.muster,
        emsContacts: emsProviderIds.map((id) => ({ id })),
        emsCallScript: this.buildEmsCallScript(document),
        hazards: document.hazards,
        scenario,
        workType: body.workType,
        regionCode: document.project.regionCode,
        projectId: document.project.id,
      },
      document,
      qualityScore: quality,
      qualityBand: qualityBand(quality),
      notes: [
        'Draft not persisted — accept suggestion or POST /erp to write SoR',
        emsProviderIds.length
          ? 'EMS provider IDs attached (verified catalog)'
          : 'No EMS IDs — add provider contacts before go-live',
        document.utilityContacts.length
          ? `Utility routing attached (${document.utilityContacts
              .map((u) => u.name)
              .join(', ')})`
          : 'No utility contacts matched for region/occurrence',
      ],
      suggestionId,
      suggestion: draft,
      modelId: 'sms-d0-erp-2.0',
    };
  }

  /** Build printable ERP document with project auto-fill, OHS, utilities, user inputs. */
  async buildDocument(
    scope: SmsRequestScope,
    body: {
      title: string;
      scenario: SmsErpScenario;
      projectId?: number | null;
      workType?: string;
      regionCode: string;
      projectScope?: string;
      hazards?: string[];
      emsProviderIds?: string[];
      userInputs?: ErpGeneratorUserInputs;
    },
  ): Promise<ErpFullDocument> {
    const projectId = body.projectId ?? scope.projectId ?? 0;
    const project = projectId
      ? await this.prisma.project.findFirst({
          where: { id: projectId, companyId: scope.companyId },
          include: {
            company: { select: { name: true, province: true, city: true } },
            site: {
              select: {
                name: true,
                region: true,
              },
            },
          },
        })
      : null;

    const regionCode = normalizeRegion(
      body.regionCode ||
        project?.site?.region ||
        project?.company?.province ||
        'CA-AB',
    );

    const pack = SCENARIO_PACKS[body.scenario];
    const scopeText = [
      body.title,
      body.workType,
      body.projectScope,
      ...(body.hazards ?? []),
      ...(body.userInputs?.additionalHazards ?? []),
      pack.hazards.join(' '),
    ]
      .filter(Boolean)
      .join(' ');

    const assessment = evaluateDangerousOccurrences(scopeText, regionCode);
    const occurrences = assessment.codes as DangerousOccurrenceCode[];
    const utilities = assessment.utilityContacts;
    const ohs = assessmentToOhsRows(assessment);
    const appendix = appendixStepsFor(occurrences);

    const jhaOpen = projectId
      ? await this.prisma.jhaFlha
          .count({
            where: {
              projectId,
              companyId: scope.companyId,
              deletedAt: null,
            },
          })
          .catch(() => 0)
      : 0;
    const highEnergy = projectId
      ? await this.prisma.sifHecaEvent
          .count({
            where: {
              projectId,
              companyId: scope.companyId,
              deletedAt: null,
              hecaScore: { highEnergyFlag: true },
            },
          })
          .catch(() => 0)
      : 0;

    const readinessScore = clamp(
      100 - Math.min(40, jhaOpen * 2) - Math.min(30, highEnergy * 6),
      40,
      100,
    );
    const readinessNotes: string[] = [];
    if (jhaOpen > 0) {
      readinessNotes.push(
        `${jhaOpen} JHA/FLHA record(s) on project — confirm hazards align with this ERP scenario`,
      );
    }
    if (highEnergy > 0) {
      readinessNotes.push(
        `${highEnergy} high-energy SIF/HECA signal(s) — verify Direct controls before high-risk work`,
      );
    }
    if (!readinessNotes.length) {
      readinessNotes.push(
        'No open high-energy signals found for this project — re-check field readiness before mobilization',
      );
    }

    const hazards = [
      ...new Set([
        ...pack.hazards,
        ...(body.hazards ?? []),
        ...(body.userInputs?.additionalHazards ?? []),
      ]),
    ];

    const musterPoints = body.userInputs?.musterPoints?.length
      ? body.userInputs.musterPoints.map((m) => ({
          name: m.name,
          description: m.description,
        }))
      : [
          {
            name: pack.muster.replace(/_/g, ' '),
            description:
              'Default muster from scenario pack — confirm on site',
          },
        ];

    const equipment = body.userInputs?.equipment?.length
      ? body.userInputs.equipment
      : [
          { name: 'First-aid kit', location: 'Site trailer', qty: 1 },
          {
            name: 'Fire extinguisher',
            location: 'Hot-work / fuel area',
            qty: 2,
          },
          { name: 'Spill kit', location: 'Chemical / fuel storage', qty: 1 },
        ];

    const roles = body.userInputs?.roles?.length
      ? body.userInputs.roles
      : [
          {
            role: 'Site emergency coordinator',
            primaryName: '',
            backupName: '',
          },
          { role: 'Muster warden', primaryName: '', backupName: '' },
          { role: 'First aider', primaryName: '', backupName: '' },
          { role: 'Communications lead', primaryName: '', backupName: '' },
        ];

    const communication = {
      radioChannel:
        body.userInputs?.communication?.radioChannel || 'Ch 1 — Emergency',
      phoneTree:
        body.userInputs?.communication?.phoneTree ||
        'Coordinator → Supervisor → Company HSE → Client',
      assemblySignal:
        body.userInputs?.communication?.assemblySignal ||
        'Continuous air horn / radio “EMERGENCY MUSTER”',
      allClearSignal:
        body.userInputs?.communication?.allClearSignal ||
        'Radio “ALL CLEAR” from coordinator only',
    };

    const responseSteps = [
      ...pack.detail.map((detail, i) => ({
        order: i + 1,
        title: pack.steps[i] ?? `Step ${i + 1}`,
        detail,
      })),
      ...appendix.map((detail, i) => ({
        order: pack.detail.length + i + 1,
        title: `occurrence_${i + 1}`,
        detail,
      })),
    ];

    const quality = clamp(
      50 +
        responseSteps.length * 4 +
        (body.emsProviderIds?.length ? 12 : 0) +
        (utilities.length ? 10 : 0) +
        (musterPoints.length ? 5 : 0) +
        (roles.some((r) => r.primaryName) ? 5 : 0) +
        Math.round(readinessScore / 20),
      0,
      100,
    );

    const siteAddress =
      body.userInputs?.siteAddress ||
      [project?.site?.name, project?.site?.region, project?.company?.city]
        .filter(Boolean)
        .join(', ') ||
      null;

    return {
      documentType: 'ERP',
      title: body.title,
      generatedAt: new Date().toISOString(),
      revision: `ERP-${Date.now().toString(36).toUpperCase()}`,
      summary: {
        scenario: body.scenario,
        regionCode,
        projectName: project?.name ?? `Project #${projectId}`,
        qualityScore: quality,
        dangerousOccurrences: occurrences,
        utilityContactCount: utilities.length,
        readinessScore,
        supervisorReviewRequired:
          assessment.supervisorReviewRequired || highEnergy > 0,
        ohsFramework: assessment.framework.frameworkLabel,
        mustReportDangerousOccurrence: assessment.mustReportAny,
      },
      project: {
        id: projectId,
        name: project?.name ?? `Project #${projectId}`,
        code: project?.code ?? null,
        client: project?.client ?? null,
        companyName: project?.company?.name ?? null,
        siteName: project?.site?.name ?? null,
        siteAddress,
        regionCode,
      },
      hazards,
      readiness: {
        score: readinessScore,
        notes: readinessNotes,
        openHighEnergyCount: highEnergy,
      },
      ohs,
      dangerousOccurrenceAssessment: {
        flagged: assessment.flagged,
        mustReportAny: assessment.mustReportAny,
        narrative: assessment.narrative,
        disclaimer: assessment.disclaimer,
      },
      contactRouting: assessment.contactRouting,
      utilityContacts: utilities.map((u) => ({
        id: u.id,
        agency: u.agency,
        name: u.name,
        phone: u.phone,
        notes: u.notes,
      })),
      emsContacts: (body.emsProviderIds ?? []).map((id) => ({ id })),
      userInputs: {
        musterPoints,
        equipment,
        roles,
        communication,
      },
      responseSteps,
      sections: this.buildSections({
        title: body.title,
        workType: body.workType,
        projectScope: body.projectScope,
        projectName: project?.name ?? `Project #${projectId}`,
        siteAddress,
        regionCode,
        hazards,
        musterPoints,
        equipment,
        roles,
        communication,
        responseSteps,
        ohs,
        utilities: utilities.map((u) => `${u.name}: ${u.phone} — ${u.notes}`),
        contactRoutingSummary: assessment.contactRouting.summary,
        contactRoutingLines: assessment.contactRouting.contacts.map(
          (c) =>
            `${c.reason}${c.phone ? ` — ${c.phone}` : ` — ${c.dialHint}`}`,
        ),
        readinessNotes,
      }),
    };
  }

  private buildSections(input: {
    title: string;
    workType?: string;
    projectScope?: string;
    projectName: string;
    siteAddress: string | null;
    regionCode: string;
    hazards: string[];
    musterPoints: Array<{ name: string; description?: string }>;
    equipment: Array<{ name: string; location?: string; qty?: number }>;
    roles: Array<{ role: string; primaryName?: string; backupName?: string }>;
    communication: {
      radioChannel: string;
      phoneTree: string;
      assemblySignal: string;
      allClearSignal: string;
    };
    responseSteps: Array<{ order: number; title: string; detail: string }>;
    ohs: Array<{
      code: string;
      label: string;
      guidance: string;
      mustReport?: boolean;
      urgency?: string;
    }>;
    utilities: string[];
    contactRoutingSummary?: string[];
    contactRoutingLines?: string[];
    readinessNotes: string[];
  }): ErpDocumentSection[] {
    return [
      {
        id: 'scope',
        title: '1. Project & scope',
        body: [
          `Project: ${input.projectName}`,
          input.siteAddress ? `Site: ${input.siteAddress}` : null,
          `Region: ${input.regionCode}`,
          input.workType ? `Work type: ${input.workType}` : null,
          input.projectScope ? `Scope: ${input.projectScope}` : null,
          `Plan: ${input.title}`,
        ]
          .filter(Boolean)
          .join('\n'),
      },
      {
        id: 'hazards',
        title: '2. Hazards & readiness',
        body: 'Hazards integrated from scenario pack, user inputs, and project readiness signals.',
        bullets: [
          ...input.hazards.map((h) => `Hazard: ${h}`),
          ...input.readinessNotes,
        ],
      },
      {
        id: 'ohs',
        title: '3. Provincial OHS — dangerous occurrence',
        body: input.ohs.length
          ? 'Auto-flagged provincial reporting guidance for detected dangerous occurrences (not legal advice).'
          : 'No dangerous-occurrence phrases detected — still follow company incident reporting.',
        bullets: input.ohs.map((o) => {
          const flag = o.mustReport ? 'REQUIRED REPORT' : 'Review';
          const urgency = o.urgency ? ` [${o.urgency}]` : '';
          return `${flag}${urgency} — ${o.label}: ${o.guidance}`;
        }),
      },
      {
        id: 'utilities',
        title: '4. Hazard-specific contact routing',
        body:
          (input.contactRoutingSummary?.length
            ? 'Auto-routed by hazard type (catalog phones only). '
            : '') +
          (input.utilities.length
            ? 'Verified utility emergency contacts for this region / occurrence.'
            : 'Confirm regional utility emergency numbers before work.'),
        bullets: [
          ...(input.contactRoutingSummary ?? []).map((s) => `Route: ${s}`),
          ...(input.contactRoutingLines ?? []),
          ...input.utilities.map((u) => `Catalog: ${u}`),
        ],
      },
      {
        id: 'muster',
        title: '5. Muster points',
        body: 'Primary and alternate assembly locations.',
        bullets: input.musterPoints.map(
          (m) => `${m.name}${m.description ? ` — ${m.description}` : ''}`,
        ),
      },
      {
        id: 'equipment',
        title: '6. Emergency equipment',
        body: 'On-site emergency equipment inventory.',
        bullets: input.equipment.map(
          (e) =>
            `${e.name}${e.qty != null ? ` (×${e.qty})` : ''}${
              e.location ? ` @ ${e.location}` : ''
            }`,
        ),
      },
      {
        id: 'roles',
        title: '7. Roles & accountability',
        body: 'Emergency roles — complete names before authorization.',
        bullets: input.roles.map(
          (r) =>
            `${r.role}: primary ${r.primaryName || 'TBD'} / backup ${
              r.backupName || 'TBD'
            }`,
        ),
      },
      {
        id: 'comms',
        title: '8. Communications',
        body: 'Radio, phone tree, and signals.',
        bullets: [
          `Radio: ${input.communication.radioChannel}`,
          `Phone tree: ${input.communication.phoneTree}`,
          `Assembly signal: ${input.communication.assemblySignal}`,
          `All-clear: ${input.communication.allClearSignal}`,
        ],
      },
      {
        id: 'response',
        title: '9. Response sequence',
        body: 'Ordered emergency response actions.',
        bullets: input.responseSteps.map(
          (s) => `${s.order}. ${s.title}: ${s.detail}`,
        ),
      },
      {
        id: 'authorization',
        title: '10. Authorization',
        body: 'Confirm contacts, muster, roles, and readiness before work authorization.',
        bullets: [
          'Site emergency coordinator: ________________  Date: __________',
          'Supervisor: ______________________________  Date: __________',
          'Client / HSE (if required): ________________  Date: __________',
        ],
      },
    ];
  }

  private buildEmsCallScript(doc: ErpFullDocument): string {
    const utilLine = doc.utilityContacts.length
      ? ` Then call utility: ${doc.utilityContacts
          .map((u) => `${u.name} ${u.phone}`)
          .join('; ')}.`
      : '';
    return `Call 911 / verified EMS for injuries or uncontrolled emergency.${utilLine} Do not invent phone numbers.`;
  }

  async simulate(scope: SmsRequestScope, erpId: string) {
    const erp = await this.prisma.smsErpRecord.findFirst({
      where: { id: erpId, companyId: scope.companyId, deletedAt: null },
    });
    if (!erp) return null;

    const gates = ['alarm', 'evacuate', 'account', 'ems_notify'];
    const emsIds = Array.isArray(erp.emsContactsJson)
      ? (erp.emsContactsJson as unknown[])
      : [];
    const steps = Array.isArray(erp.stepsJson)
      ? (erp.stepsJson as unknown[])
      : [];
    const failed: string[] = [];
    if (emsIds.length === 0) failed.push('ems_notify');
    if (steps.length < 3) failed.push('evacuate');
    const score = clamp(100 - failed.length * 20, 0, 100);

    const updated = await this.prisma.smsErpRecord.update({
      where: { id: erp.id },
      data: {
        simulationLastScore: score,
        drillReadinessPct: score,
        rowVersion: { increment: 1 },
      },
    });

    const insight = await this.aiCache.getOrCompute(
      scope,
      SMS_BEHAVIORS.ERP_SIM,
      { erpId, gates },
      async () => ({
        behaviorId: SMS_BEHAVIORS.ERP_SIM,
        headline: 'ERP simulation complete (training only)',
        body: 'No dispatch initiated. Review failed gates and schedule a drill.',
        confidence: 0.9,
        tone: score >= 80 ? SmsAiTone.positive : SmsAiTone.caution,
        modelTier: SmsAiModelTier.D0,
        source: SmsAiSource.rules,
        pageContext: 'emergency',
        payloadJson: { gates, failed, score },
      }),
      'erp',
    );

    await this.audit.log({
      scope,
      action: 'erp.simulate',
      entityType: 'erp_records',
      entityId: erp.id,
      payload: { score, trainingOnly: true },
    });

    return { record: updated, gates, failed, score, insight };
  }

  async startDrill(scope: SmsRequestScope, erpId: string) {
    const erp = await this.prisma.smsErpRecord.findFirst({
      where: { id: erpId, companyId: scope.companyId, deletedAt: null },
    });
    if (!erp) return null;

    const emsIds = Array.isArray(erp.emsContactsJson)
      ? (erp.emsContactsJson as unknown[])
      : [];
    const gates = ['alarm', 'evacuate', 'account', 'ems_notify'];
    const failed = emsIds.length === 0 ? ['ems_notify'] : [];

    const session = await this.prisma.smsErpDrillSession.create({
      data: {
        erpRecordId: erp.id,
        startedAt: new Date(),
        status: 'in_progress',
      },
    });
    await this.audit.log({
      scope,
      action: 'erp.drill',
      entityType: 'erp_drill_sessions',
      entityId: session.id,
      payload: { erpId: erp.id, gates, failed },
    });
    return { session, gates, failed, erpId: erp.id };
  }
}
