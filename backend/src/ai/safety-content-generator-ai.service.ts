import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JhaFlhaEngineService } from '../jha-flha/jha-flha-engine.service';
import type {
  JhaFlhaEngineControl,
  JhaFlhaEngineHazard,
} from '../jha-flha/jha-flha-engine.types';
import { TrainingCompetencyEngineService } from '../pm-training/training-competency-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import type {
  SafetyContentControl,
  SafetyContentEvidencePlaceholder,
  SafetyContentGenerated,
  SafetyContentGeneratorInput,
  SafetyContentGeneratorResult,
  SafetyContentHazard,
  SafetyContentSection,
  SafetyContentType,
} from './safety-content-generator-ai.types';

const BASE_EVIDENCE: SafetyContentEvidencePlaceholder[] = [
  {
    field: 'prepared_by',
    label: 'Prepared by (name & role)',
    type: 'text',
    required: true,
  },
  {
    field: 'prepared_date',
    label: 'Date prepared',
    type: 'datetime',
    required: true,
  },
  {
    field: 'supervisor_signature',
    label: 'Supervisor signature',
    type: 'signature',
    required: true,
  },
  {
    field: 'crew_acknowledgment',
    label: 'Crew acknowledgment signatures',
    type: 'signature',
    required: true,
  },
  {
    field: 'site_photo',
    label: 'Photo of work area / setup',
    type: 'photo',
    required: false,
  },
  {
    field: 'training_records',
    label: 'Training record references',
    type: 'document',
    required: true,
  },
];

@Injectable()
export class SafetyContentGeneratorAiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jhaEngine: JhaFlhaEngineService,
    private readonly trainingEngine: TrainingCompetencyEngineService,
  ) {}

  async generate(
    input: SafetyContentGeneratorInput,
  ): Promise<SafetyContentGeneratorResult> {
    if (!input.task?.trim()) throw new BadRequestException('task is required');
    if (!input.companyId)
      throw new BadRequestException('companyId is required');
    if (!input.contentType)
      throw new BadRequestException('contentType is required');

    const context = await this.resolveContext(input);
    const engineOutput = this.jhaEngine.generate({
      task_description: input.task,
      kind: this.engineKind(input.contentType),
      environment: input.environment,
      equipment_and_tools: input.equipment,
      known_critical_risks: input.knownCriticalRisks,
      companyId: input.companyId,
      projectId: input.projectId,
    });

    const hazards = this.collectHazards(
      engineOutput.jha_steps.flatMap((s) => s.hazards),
    );
    const controls = this.collectControls(
      engineOutput.jha_steps.flatMap((s) => s.controls),
      hazards,
    );
    const required_training = this.collectTraining(input, hazards);

    const content = this.buildContent(
      input,
      context,
      hazards,
      controls,
      required_training,
      engineOutput.field_summary,
      engineOutput.verification_questions,
    );

    return {
      content,
      human_readable: this.toHumanReadable(content),
      generation_id: randomUUID(),
      source: 'rule_engine',
      model: null,
    };
  }

  private engineKind(type: SafetyContentType): 'JHA' | 'FLHA' {
    return type === 'flha_template' ? 'FLHA' : 'JHA';
  }

  private async resolveContext(input: SafetyContentGeneratorInput) {
    let industry = input.industry;
    let projectName: string | undefined;

    const company = await this.prisma.company.findUnique({
      where: { id: input.companyId },
      select: { name: true, industry: true },
    });

    if (!industry && company?.industry) industry = company.industry;

    if (input.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: input.projectId },
        select: { name: true },
      });
      projectName = project?.name;
    }

    return { industry, companyName: company?.name, projectName };
  }

  private collectHazards(raw: JhaFlhaEngineHazard[]): SafetyContentHazard[] {
    const seen = new Set<string>();
    const out: SafetyContentHazard[] = [];
    for (const h of raw) {
      const key = h.description.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        category: h.category,
        description: h.description,
        sif_potential: Boolean(h.sif_potential),
      });
    }
    return out.slice(0, 20);
  }

  private collectControls(
    raw: JhaFlhaEngineControl[],
    hazards: SafetyContentHazard[],
  ): SafetyContentControl[] {
    const seen = new Set<string>();
    const defaultHazard = hazards[0]?.description ?? 'General task hazards';
    const out: SafetyContentControl[] = [];

    for (const c of raw) {
      const key = c.description.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        hierarchy: c.hierarchy,
        description: c.description,
        linked_hazard: defaultHazard,
      });
    }
    return out.slice(0, 24);
  }

  private collectTraining(
    input: SafetyContentGeneratorInput,
    hazards: SafetyContentHazard[],
  ): string[] {
    const output = this.trainingEngine.generate({
      worker_profile: {
        role: input.trade ?? 'field_worker',
        trade: input.trade,
      },
      project_scope: {
        tasks: [input.task],
        equipment: input.equipment ?? [],
        critical_risks: hazards
          .filter((h) => h.sif_potential)
          .map((h) => h.description),
      },
      companyId: input.companyId,
      projectId: input.projectId,
    });

    const courses = new Set<string>();
    for (const gap of output.gaps) courses.add(gap.course);
    for (const item of output.prioritized_training_plan
      .immediate_required_training) {
      courses.add(item.course);
    }

    if (!courses.size) {
      courses.add('Site orientation');
      courses.add('WHMIS / Hazard communication');
    }

    return [...courses].slice(0, 12);
  }

  private buildContent(
    input: SafetyContentGeneratorInput,
    context: { industry?: string; companyName?: string; projectName?: string },
    hazards: SafetyContentHazard[],
    controls: SafetyContentControl[],
    required_training: string[],
    fieldSummary: string,
    verificationQuestions: string[],
  ): SafetyContentGenerated {
    const metadata = {
      task: input.task,
      trade: input.trade,
      industry: context.industry,
      company_id: input.companyId,
      project_id: input.projectId,
    };

    const evidence = this.evidenceForType(input.contentType);

    switch (input.contentType) {
      case 'jha_template':
        return this.buildJha(
          input,
          context,
          hazards,
          controls,
          required_training,
          evidence,
          fieldSummary,
          verificationQuestions,
          metadata,
        );
      case 'flha_template':
        return this.buildFlha(
          input,
          context,
          hazards,
          controls,
          required_training,
          evidence,
          fieldSummary,
          metadata,
        );
      case 'sif_heca_template':
        return this.buildSifHeca(
          input,
          context,
          hazards,
          controls,
          required_training,
          evidence,
          verificationQuestions,
          metadata,
        );
      case 'toolbox_talk':
        return this.buildToolboxTalk(
          input,
          context,
          hazards,
          controls,
          required_training,
          evidence,
          metadata,
        );
      case 'site_orientation':
        return this.buildSiteOrientation(
          input,
          context,
          hazards,
          controls,
          required_training,
          evidence,
          metadata,
        );
      case 'sop':
        return this.buildSop(
          input,
          context,
          hazards,
          controls,
          required_training,
          evidence,
          metadata,
        );
      case 'emergency_response_plan':
        return this.buildEmergencyPlan(
          input,
          context,
          hazards,
          controls,
          required_training,
          evidence,
          metadata,
        );
      default:
        throw new BadRequestException(
          `Unsupported contentType: ${input.contentType}`,
        );
    }
  }

  private buildJha(
    input: SafetyContentGeneratorInput,
    context: { companyName?: string; projectName?: string },
    hazards: SafetyContentHazard[],
    controls: SafetyContentControl[],
    training: string[],
    evidence: SafetyContentEvidencePlaceholder[],
    summary: string,
    questions: string[],
    metadata: SafetyContentGenerated['metadata'],
  ): SafetyContentGenerated {
    const sections: SafetyContentSection[] = [
      {
        id: 'scope',
        title: 'Job scope & applicability',
        body: [
          `Task: ${input.task}`,
          context.projectName ? `Project: ${context.projectName}` : null,
          context.companyName ? `Company: ${context.companyName}` : null,
          input.locationNote ? `Location: ${input.locationNote}` : null,
          summary,
        ]
          .filter(Boolean)
          .join('\n'),
        evidence_placeholders: evidence.filter((e) =>
          ['prepared_by', 'prepared_date', 'supervisor_signature'].includes(
            e.field,
          ),
        ),
      },
      {
        id: 'job_steps',
        title: 'Job steps',
        body: this.defaultJobSteps(input.task),
      },
      {
        id: 'hazards',
        title: 'Hazard identification',
        body: 'Identify hazards for each job step using energy types and task-specific exposures.',
        hazards,
        evidence_placeholders: [
          {
            field: 'hazard_review_photo',
            label: 'Photo of hazard area',
            type: 'photo',
            required: false,
          },
        ],
      },
      {
        id: 'controls',
        title: 'Controls (hierarchy of controls)',
        body: 'Apply elimination → substitution → engineering → administrative → PPE. Verify SIF-potential hazards have critical controls.',
        controls,
        evidence_placeholders: [
          {
            field: 'control_verification',
            label: 'Control verification checklist',
            type: 'checklist',
            required: true,
          },
        ],
      },
      {
        id: 'training',
        title: 'Required training & competency',
        body: 'Workers must hold current verified training before performing this task.',
        required_training: training,
        evidence_placeholders: [
          {
            field: 'training_records',
            label: 'Training wallet / certificate refs',
            type: 'document',
            required: true,
          },
        ],
      },
      {
        id: 'verification',
        title: 'Supervisor verification',
        body: questions.length
          ? questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
          : '1. Are controls adequate for today’s conditions?\n2. Is crew trained and briefed?\n3. Are permits in place if required?',
        evidence_placeholders: [
          {
            field: 'supervisor_signature',
            label: 'Supervisor sign-off',
            type: 'signature',
            required: true,
          },
        ],
      },
    ];

    return {
      content_type: 'jha_template',
      title: `JHA — ${input.task.slice(0, 80)}`,
      summary: `Job Hazard Analysis template for ${input.task}`,
      sections,
      hazards,
      controls,
      required_training: training,
      evidence_placeholders: evidence,
      metadata,
    };
  }

  private buildFlha(
    input: SafetyContentGeneratorInput,
    context: { projectName?: string },
    hazards: SafetyContentHazard[],
    controls: SafetyContentControl[],
    training: string[],
    evidence: SafetyContentEvidencePlaceholder[],
    summary: string,
    metadata: SafetyContentGenerated['metadata'],
  ): SafetyContentGenerated {
    const sections: SafetyContentSection[] = [
      {
        id: 'today_work',
        title: "Today's work",
        body: `${input.task}\n${summary}`,
        evidence_placeholders: [
          {
            field: 'datetime_start',
            label: 'Work start date/time',
            type: 'datetime',
            required: true,
          },
        ],
      },
      {
        id: 'site_check',
        title: 'Site readiness check',
        body: [
          'Weather and visibility acceptable',
          'Muster point and first aid known',
          'Permits and isolations verified',
          'Conditions changed since planning? Document changes.',
          context.projectName ? `Project: ${context.projectName}` : null,
        ]
          .filter(Boolean)
          .join('\n'),
        evidence_placeholders: [
          {
            field: 'conditions_changed',
            label: 'Conditions changed notes',
            type: 'text',
            required: false,
          },
          {
            field: 'reference_jha',
            label: 'Reference JHA ID',
            type: 'document',
            required: true,
          },
        ],
      },
      {
        id: 'hazards',
        title: 'Hazards for today',
        body: 'Point-of-work hazards — include anything different from the approved JHA.',
        hazards,
      },
      {
        id: 'controls',
        title: 'Controls in place',
        body: 'Confirm controls before starting. Stop work if inadequate.',
        controls,
        evidence_placeholders: [
          {
            field: 'crew_acknowledgment',
            label: 'Crew FLHA signatures',
            type: 'signature',
            required: true,
          },
        ],
      },
      {
        id: 'training',
        title: 'Training check',
        required_training: training,
        body: 'Verify crew holds required training for today’s task.',
      },
    ];

    return {
      content_type: 'flha_template',
      title: `FLHA — ${input.task.slice(0, 80)}`,
      summary: `Field Level Hazard Assessment for today's work: ${input.task}`,
      sections,
      hazards,
      controls,
      required_training: training,
      evidence_placeholders: evidence,
      metadata,
    };
  }

  private buildSifHeca(
    input: SafetyContentGeneratorInput,
    _context: { projectName?: string },
    hazards: SafetyContentHazard[],
    controls: SafetyContentControl[],
    training: string[],
    evidence: SafetyContentEvidencePlaceholder[],
    questions: string[],
    metadata: SafetyContentGenerated['metadata'],
  ): SafetyContentGenerated {
    const sifHazards = hazards.filter((h) => h.sif_potential);
    const sections: SafetyContentSection[] = [
      {
        id: 'critical_activity',
        title: 'Critical activity / high-energy work',
        body: `Task under SIF/HECA review: ${input.task}\nFocus on fatal and serious injury prevention.`,
        evidence_placeholders: [
          {
            field: 'activity_classification',
            label: 'SIF/HECA classification',
            type: 'text',
            required: true,
          },
        ],
      },
      {
        id: 'energy_wheel',
        title: 'Energy sources & failure modes',
        body: 'Map mechanical, electrical, gravity, pressure, chemical, and thermal energies present.',
        hazards: sifHazards.length ? sifHazards : hazards.slice(0, 6),
      },
      {
        id: 'critical_controls',
        title: 'Critical controls & verification',
        body: 'Each SIF-potential hazard requires verified critical control — not PPE-only.',
        controls: controls
          .filter((c) => c.hierarchy !== 'ppe')
          .concat(controls.filter((c) => c.hierarchy === 'ppe').slice(0, 3)),
        evidence_placeholders: [
          {
            field: 'critical_control_verification',
            label: 'Critical control verification sign-off',
            type: 'checklist',
            required: true,
          },
          {
            field: 'independent_verifier',
            label: 'Independent verifier signature',
            type: 'signature',
            required: true,
          },
        ],
      },
      {
        id: 'verification_questions',
        title: 'Leadership verification questions',
        body: (questions.length
          ? questions
          : [
              'Can work proceed without breaching critical controls?',
              'Is rescue capability in place for fall/confined space?',
              'Are workers qualified and briefed on stop-work authority?',
            ]
        )
          .map((q, i) => `${i + 1}. ${q}`)
          .join('\n'),
      },
      {
        id: 'training',
        title: 'SIF competency requirements',
        required_training: training,
        body: 'SIF-tier training and orientation required before work authorization.',
      },
    ];

    return {
      content_type: 'sif_heca_template',
      title: `SIF/HECA Review — ${input.task.slice(0, 60)}`,
      summary: `Serious injury and fatality prevention template for ${input.task}`,
      sections,
      hazards,
      controls,
      required_training: training,
      evidence_placeholders: [
        ...evidence,
        {
          field: 'heca_checklist',
          label: 'HECA checklist completion',
          type: 'checklist',
          required: true,
        },
      ],
      metadata,
    };
  }

  private buildToolboxTalk(
    input: SafetyContentGeneratorInput,
    context: { projectName?: string },
    hazards: SafetyContentHazard[],
    controls: SafetyContentControl[],
    training: string[],
    evidence: SafetyContentEvidencePlaceholder[],
    metadata: SafetyContentGenerated['metadata'],
  ): SafetyContentGenerated {
    const topic = hazards[0]?.description ?? input.task;
    const sections: SafetyContentSection[] = [
      {
        id: 'opening',
        title: 'Opening & relevance',
        body: `Today's toolbox talk: ${topic}\nLink to task: ${input.task}${
          context.projectName ? `\nProject: ${context.projectName}` : ''
        }`,
      },
      {
        id: 'key_messages',
        title: 'Key safety messages (5–10 min)',
        body: [
          `Hazard focus: ${topic}`,
          ...hazards
            .slice(0, 3)
            .map((h) => `• ${h.description}${h.sif_potential ? ' [SIF]' : ''}`),
          '',
          'Discussion prompts:',
          '• What could go wrong today?',
          '• What controls must we maintain?',
          '• Who has stop-work authority?',
        ].join('\n'),
        hazards: hazards.slice(0, 5),
        controls: controls.slice(0, 5),
      },
      {
        id: 'training',
        title: 'Related training',
        required_training: training.slice(0, 4),
        body: 'Confirm attendees hold required training or schedule refreshers.',
      },
      {
        id: 'closeout',
        title: 'Questions & close-out',
        body: 'Document questions raised and actions assigned.',
        evidence_placeholders: [
          {
            field: 'attendee_signatures',
            label: 'Attendee signatures',
            type: 'signature',
            required: true,
          },
          {
            field: 'facilitator',
            label: 'Facilitator name',
            type: 'text',
            required: true,
          },
          {
            field: 'discussion_notes',
            label: 'Discussion notes',
            type: 'text',
            required: false,
          },
        ],
      },
    ];

    return {
      content_type: 'toolbox_talk',
      title: `Toolbox Talk — ${topic.slice(0, 60)}`,
      summary: `5–10 minute crew briefing on ${topic}`,
      sections,
      hazards: hazards.slice(0, 8),
      controls: controls.slice(0, 8),
      required_training: training.slice(0, 6),
      evidence_placeholders: evidence
        .filter((e) =>
          ['prepared_date', 'crew_acknowledgment'].includes(e.field),
        )
        .concat([
          {
            field: 'attendee_signatures',
            label: 'Attendee signatures',
            type: 'signature',
            required: true,
          },
        ]),
      metadata,
    };
  }

  private buildSiteOrientation(
    input: SafetyContentGeneratorInput,
    context: { companyName?: string; projectName?: string },
    hazards: SafetyContentHazard[],
    controls: SafetyContentControl[],
    training: string[],
    evidence: SafetyContentEvidencePlaceholder[],
    metadata: SafetyContentGenerated['metadata'],
  ): SafetyContentGenerated {
    const sections: SafetyContentSection[] = [
      {
        id: 'welcome',
        title: 'Welcome & site overview',
        body: [
          context.companyName ? `Employer: ${context.companyName}` : null,
          context.projectName ? `Project: ${context.projectName}` : null,
          `Scope: ${input.task}`,
          input.locationNote ? `Site: ${input.locationNote}` : null,
        ]
          .filter(Boolean)
          .join('\n'),
      },
      {
        id: 'emergency',
        title: 'Emergency procedures',
        body: 'Muster points, alarm signals, first aid locations, and emergency contacts.',
        evidence_placeholders: [
          {
            field: 'muster_map',
            label: 'Muster point map / photo',
            type: 'photo',
            required: true,
          },
          {
            field: 'emergency_contacts',
            label: 'Emergency contact list',
            type: 'document',
            required: true,
          },
        ],
      },
      {
        id: 'hazards',
        title: 'Site-specific hazards',
        body: 'Key hazards all workers must understand before site access.',
        hazards: hazards.slice(0, 10),
        controls: controls.slice(0, 8),
      },
      {
        id: 'rules',
        title: 'Site rules & PPE',
        body: 'PPE minimums, speed limits, exclusion zones, reporting requirements, and substance policies.',
        evidence_placeholders: [
          {
            field: 'ppe_acknowledgment',
            label: 'PPE policy acknowledgment',
            type: 'checklist',
            required: true,
          },
        ],
      },
      {
        id: 'training',
        title: 'Required orientation training',
        required_training: ['Site orientation', ...training.slice(0, 5)],
        body: 'Complete orientation package before unsupervised site work.',
        evidence_placeholders: [
          {
            field: 'orientation_quiz',
            label: 'Orientation quiz / acknowledgment',
            type: 'checklist',
            required: true,
          },
          {
            field: 'worker_signature',
            label: 'Worker signature',
            type: 'signature',
            required: true,
          },
        ],
      },
    ];

    return {
      content_type: 'site_orientation',
      title: `Site Orientation — ${
        context.projectName ?? input.task.slice(0, 50)
      }`,
      summary: 'New worker / visitor site orientation package',
      sections,
      hazards: hazards.slice(0, 10),
      controls: controls.slice(0, 8),
      required_training: ['Site orientation', ...training.slice(0, 6)],
      evidence_placeholders: evidence,
      metadata,
    };
  }

  private buildSop(
    input: SafetyContentGeneratorInput,
    _context: { companyName?: string },
    hazards: SafetyContentHazard[],
    controls: SafetyContentControl[],
    training: string[],
    evidence: SafetyContentEvidencePlaceholder[],
    metadata: SafetyContentGenerated['metadata'],
  ): SafetyContentGenerated {
    const sections: SafetyContentSection[] = [
      {
        id: 'purpose',
        title: 'Purpose & scope',
        body: `This SOP describes safe work practices for: ${input.task}`,
      },
      {
        id: 'prerequisites',
        title: 'Prerequisites',
        body: 'Training, permits, PPE, and equipment requirements before starting.',
        required_training: training,
        evidence_placeholders: [
          {
            field: 'competency_verification',
            label: 'Competency verification record',
            type: 'document',
            required: true,
          },
        ],
      },
      {
        id: 'procedure',
        title: 'Step-by-step procedure',
        body: this.defaultJobSteps(input.task),
      },
      {
        id: 'hazards_controls',
        title: 'Hazards & controls',
        body: 'Apply controls at each step per hierarchy of controls.',
        hazards,
        controls,
      },
      {
        id: 'deviations',
        title: 'Deviations & stop work',
        body: 'Stop work when conditions change, controls fail, or competency is in doubt. Notify supervisor immediately.',
        evidence_placeholders: [
          {
            field: 'deviation_log',
            label: 'Deviation / stop-work log entry',
            type: 'text',
            required: false,
          },
        ],
      },
    ];

    return {
      content_type: 'sop',
      title: `SOP — ${input.task.slice(0, 80)}`,
      summary: `Standard operating procedure for ${input.task}`,
      sections,
      hazards,
      controls,
      required_training: training,
      evidence_placeholders: evidence,
      metadata,
    };
  }

  private buildEmergencyPlan(
    input: SafetyContentGeneratorInput,
    context: { projectName?: string },
    hazards: SafetyContentHazard[],
    _controls: SafetyContentControl[],
    training: string[],
    evidence: SafetyContentEvidencePlaceholder[],
    metadata: SafetyContentGenerated['metadata'],
  ): SafetyContentGenerated {
    const sections: SafetyContentSection[] = [
      {
        id: 'activation',
        title: 'Emergency activation',
        body: 'When to activate, who declares, and communication chain.',
        evidence_placeholders: [
          {
            field: 'activation_drill_log',
            label: 'Drill / activation log',
            type: 'datetime',
            required: false,
          },
        ],
      },
      {
        id: 'scenarios',
        title: 'Site-specific scenarios',
        body: [
          `Primary work: ${input.task}`,
          context.projectName ? `Site: ${context.projectName}` : null,
          '',
          'Plan for:',
          ...hazards
            .slice(0, 5)
            .map((h) => `• ${h.description} — response actions`),
          '• Medical emergency / serious injury',
          '• Fire / evacuation',
          '• Severe weather',
        ]
          .filter(Boolean)
          .join('\n'),
        hazards: hazards.slice(0, 8),
      },
      {
        id: 'roles',
        title: 'Emergency roles & contacts',
        body: 'Incident commander, first aid attendants, fire watch, and external emergency services.',
        evidence_placeholders: [
          {
            field: 'emergency_org_chart',
            label: 'Emergency org chart',
            type: 'document',
            required: true,
          },
          {
            field: 'contact_list',
            label: 'Emergency contact list',
            type: 'document',
            required: true,
          },
        ],
      },
      {
        id: 'training',
        title: 'Emergency training',
        required_training: [
          'Emergency response orientation',
          'First Aid',
          ...training.slice(0, 3),
        ],
        body: 'Workers must know muster points and their role in an emergency.',
      },
      {
        id: 'recovery',
        title: 'Recovery & stand-down',
        body: 'Site re-entry criteria, investigation triggers, and lessons learned capture.',
        evidence_placeholders: [
          {
            field: 'stand_down_briefing',
            label: 'Stand-down briefing record',
            type: 'signature',
            required: false,
          },
        ],
      },
    ];

    return {
      content_type: 'emergency_response_plan',
      title: `Emergency Response Plan — ${
        context.projectName ?? input.task.slice(0, 50)
      }`,
      summary: `Emergency response plan aligned to ${input.task}`,
      sections,
      hazards: hazards.slice(0, 10),
      controls: [],
      required_training: [
        'Emergency response orientation',
        'First Aid',
        ...training.slice(0, 4),
      ],
      evidence_placeholders: evidence.concat([
        {
          field: 'erp_review_date',
          label: 'ERP review / approval date',
          type: 'datetime',
          required: true,
        },
      ]),
      metadata,
    };
  }

  private evidenceForType(
    type: SafetyContentType,
  ): SafetyContentEvidencePlaceholder[] {
    if (type === 'toolbox_talk') {
      return BASE_EVIDENCE.filter((e) =>
        ['prepared_date', 'crew_acknowledgment'].includes(e.field),
      );
    }
    if (type === 'site_orientation') {
      return BASE_EVIDENCE.filter((e) =>
        [
          'prepared_by',
          'prepared_date',
          'training_records',
          'crew_acknowledgment',
        ].includes(e.field),
      );
    }
    if (type === 'emergency_response_plan') {
      return BASE_EVIDENCE.filter((e) =>
        ['prepared_by', 'prepared_date', 'supervisor_signature'].includes(
          e.field,
        ),
      );
    }
    return [...BASE_EVIDENCE];
  }

  private defaultJobSteps(task: string): string {
    return [
      '1. Plan — review scope, permits, and training',
      '2. Set up — barricades, signage, isolations',
      `3. Execute — ${task}`,
      '4. Monitor — conditions, atmosphere, traffic interfaces',
      '5. Close out — housekeeping, tool accountability, debrief',
    ].join('\n');
  }

  private toHumanReadable(content: SafetyContentGenerated): string {
    const lines: string[] = [
      `# ${content.title}`,
      '',
      content.summary,
      '',
      `**Type:** ${content.content_type.replace(/_/g, ' ')}`,
      '',
    ];

    if (content.required_training.length) {
      lines.push(
        '## Required training',
        ...content.required_training.map((t) => `- ${t}`),
        '',
      );
    }

    for (const section of content.sections) {
      lines.push(`## ${section.title}`, '', section.body, '');
      if (section.hazards?.length) {
        lines.push('**Hazards:**');
        for (const h of section.hazards) {
          lines.push(`- ${h.description}${h.sif_potential ? ' [SIF]' : ''}`);
        }
        lines.push('');
      }
      if (section.controls?.length) {
        lines.push('**Controls:**');
        for (const c of section.controls) {
          lines.push(`- [${c.hierarchy}] ${c.description}`);
        }
        lines.push('');
      }
      if (section.evidence_placeholders?.length) {
        lines.push('**Evidence to capture:**');
        for (const e of section.evidence_placeholders) {
          lines.push(`- ${e.label}${e.required ? ' (required)' : ''}`);
        }
        lines.push('');
      }
    }

    if (content.evidence_placeholders.length) {
      lines.push('## Global evidence placeholders');
      for (const e of content.evidence_placeholders) {
        lines.push(
          `- ${e.label} [${e.type}]${e.required ? ' *required*' : ''}`,
        );
      }
    }

    return lines.join('\n').trim();
  }
}
