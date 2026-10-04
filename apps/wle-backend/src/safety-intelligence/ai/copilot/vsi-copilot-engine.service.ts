import { Injectable, Logger } from '@nestjs/common';
import { VeraAutonomousSafetyEngine } from '@vera/autonomous-safety';
import type { SafetyContextInput } from '@vera/autonomous-safety';
import { LlmSafetyService } from '../llm-safety.service';
import { VsiVisionBridgeService } from '../vsi-vision-bridge.service';
import { buildCopilotMessages } from './vsi-copilot.prompts';
import { severityToScore, toCailEnvelope } from './vsi-copilot.mappers';
import type {
  BboCopilotOutput,
  CopilotRunRequest,
  CopilotRunResponse,
  EquipmentCopilotOutput,
  FormHazardCopilotOutput,
  IncidentCopilotOutput,
  InspectionCopilotOutput,
  LessonsLearnedCopilotOutput,
  PredictiveRiskCopilotOutput,
  PresentationCopilotOutput,
  VsiCopilotModule,
} from './vsi-copilot.types';

@Injectable()
export class VsiCopilotEngineService {
  private readonly logger = new Logger(VsiCopilotEngineService.name);
  private readonly vase = new VeraAutonomousSafetyEngine();

  constructor(
    private readonly llm: LlmSafetyService,
    private readonly vision: VsiVisionBridgeService,
  ) {}

  async run(request: CopilotRunRequest): Promise<CopilotRunResponse> {
    const engines: string[] = [];
    let output: unknown;

    const llmResult = await this.llm.runCopilotModule(
      request.module,
      request.context,
      {
        projectId: request.projectId,
        companyId: request.companyId,
        sourceType: request.sourceType,
        actor: request.actor,
      },
    );
    if (llmResult) {
      engines.push('copilot-llm');
      output = llmResult;
    } else {
      output = await this.heuristicRun(request.module, request.context);
      engines.push('copilot-heuristic', 'vase');
    }

    return {
      module: request.module,
      engine: engines,
      output,
      cailEnvelope: toCailEnvelope(request.module, output),
      generatedAt: new Date().toISOString(),
    };
  }

  async inspectPhoto(context: {
    caption?: string;
    ocrText?: string;
    imageUrl?: string;
    imageBase64?: string;
    imageMimeType?: string;
    projectId?: number;
    companyId?: number;
  }) {
    const engines: string[] = [];
    let visionHints: InspectionCopilotOutput | null = null;

    try {
      const v = await this.vision.analyzeSafetyPhoto(context);
      engines.push('vera-vision');
      visionHints = {
        classification: v.suggestedPolarity,
        hazard_type: v.hazards[0] ?? 'site_condition',
        risk_category: v.riskCategory ?? 'other',
        severity_score: severityToScore(v.suggestedSeverity),
        recommended_corrective_action:
          v.suggestedCaption ?? v.hazards.join('; ') ?? '',
        tags: v.hazards,
        positive_observation:
          v.suggestedPolarity === 'safe'
            ? v.suggestedCaption ?? 'Observed safe work practice'
            : undefined,
      };
    } catch {
      /* optional */
    }

    // Optional VeriAgent LLM photo classify (sole egress path) when tenant known
    if (
      this.llm.isConfigured() &&
      context.companyId != null &&
      context.companyId > 0
    ) {
      try {
        const llmClass = await this.llm.classifySafetyPhoto({
          caption: context.caption,
          ocrText: context.ocrText,
          imageUrl: context.imageUrl,
          imageBase64: context.imageBase64,
          imageMimeType: context.imageMimeType,
          companyId: context.companyId,
          projectId: context.projectId,
        });
        if (llmClass) {
          engines.push('veri-agent-photo');
          visionHints = {
            classification: llmClass.suggestedPolarity,
            hazard_type: llmClass.hazardSummary || visionHints?.hazard_type || 'site_condition',
            risk_category:
              llmClass.riskCategory ?? visionHints?.risk_category ?? 'other',
            severity_score: severityToScore(llmClass.suggestedSeverity),
            recommended_corrective_action:
              llmClass.suggestedCaption ??
              visionHints?.recommended_corrective_action ??
              '',
            tags: visionHints?.tags ?? [],
            positive_observation:
              llmClass.suggestedPolarity === 'safe'
                ? llmClass.suggestedCaption ??
                  visionHints?.positive_observation
                : undefined,
          };
        }
      } catch {
        /* optional enrichment */
      }
    }

    const run = await this.run({
      module: 'inspection',
      context: { ...context, visionHints },
      projectId: context.projectId,
      companyId: context.companyId,
    });

    return {
      ...run,
      engine: [...engines, ...run.engine],
      output: run.output as InspectionCopilotOutput,
    };
  }

  async analyzeBbo(context: Record<string, unknown>) {
    return this.run({ module: 'bbo', context });
  }

  async investigateIncident(context: Record<string, unknown>) {
    return this.run({ module: 'incident', context });
  }

  async analyzeEquipment(context: Record<string, unknown>) {
    return this.run({ module: 'equipment', context });
  }

  async analyzeFormHazard(context: Record<string, unknown>) {
    return this.run({ module: 'form_hazard', context });
  }

  async analyzeSifHecaScope(context: Record<string, unknown>) {
    return this.run({
      module: 'sif_heca_assessment',
      context,
      projectId: context.projectId as number | undefined,
      companyId: context.companyId as number | undefined,
      sourceType: 'sif',
    });
  }

  async generateLesson(context: Record<string, unknown>) {
    return this.run({ module: 'lessons_learned', context });
  }

  async generatePresentation(context: Record<string, unknown>) {
    return this.run({ module: 'presentation', context });
  }

  async predictRisk(context: Record<string, unknown>) {
    return this.run({ module: 'predictive_risk', context });
  }

  async analyzeCail(context: Record<string, unknown>) {
    return this.run({ module: 'cail_analyze', context });
  }

  private vaseContext(
    context: Record<string, unknown>,
    projectId?: number,
    companyId?: number,
  ): SafetyContextInput {
    const caption = [
      context.title,
      context.description,
      context.narrative,
      context.behaviorDescription,
      context.caption,
    ]
      .filter(Boolean)
      .join(' ')
      .slice(0, 2000);

    return {
      companyId: companyId ? String(companyId) : undefined,
      projectId: projectId ? String(projectId) : undefined,
      trainingGaps: Number(context.trainingGaps ?? 0),
      inspectionFailures: Number(context.inspectionFailures ?? 0),
      visionHazards: caption ? [caption] : undefined,
    };
  }

  private async heuristicRun(
    module: VsiCopilotModule,
    context: Record<string, unknown>,
  ): Promise<unknown> {
    const report = this.vase.analyze(
      this.vaseContext(
        context,
        context.projectId as number | undefined,
        context.companyId as number | undefined,
      ),
    );
    const topCause = report.rootCause.likelyCauses[0]?.cause ?? 'Undetermined';
    const capa =
      report.rootCause.correctiveActions[0] ?? 'Implement controls and verify';

    switch (module) {
      case 'inspection': {
        const visionHints = context.visionHints as
          | InspectionCopilotOutput
          | undefined;
        if (visionHints) return visionHints;
        const text = [context.caption, context.ocrText]
          .filter(Boolean)
          .join(' ');
        const atRisk = /unsafe|hazard|risk|violation|damage/i.test(
          String(text),
        );
        return {
          classification: atRisk ? 'at_risk' : 'safe',
          hazard_type: atRisk ? 'site_hazard' : 'none',
          risk_category: 'environment',
          severity_score: atRisk ? 3 : 1,
          recommended_corrective_action: atRisk ? capa : '',
          positive_observation: atRisk ? undefined : 'Safe condition observed',
          tags: report.hazards.precursors.slice(0, 5),
        } satisfies InspectionCopilotOutput;
      }
      case 'bbo': {
        const desc = String(
          context.behaviorDescription ?? context.description ?? '',
        );
        const atRisk = /unsafe|bypass|hazard|at.risk/i.test(desc);
        return {
          behavior_type: atRisk ? 'at_risk_behavior' : 'safe_behavior',
          classification: atRisk ? 'at_risk' : 'safe',
          root_cause_category: atRisk ? 'behavior' : '',
          root_cause_explanation: atRisk ? topCause : '',
          recommended_actions: atRisk
            ? report.rootCause.correctiveActions.slice(0, 3)
            : [],
          positive_reinforcement: atRisk
            ? undefined
            : 'Positive safety behavior observed',
          tags: report.hazards.precursors.slice(0, 3),
        } satisfies BboCopilotOutput;
      }
      case 'incident':
        return {
          root_cause_primary: topCause,
          root_cause_secondary: report.rootCause.likelyCauses[1]?.cause ?? '',
          five_whys: [
            'Why did it happen? ' + topCause,
            'Why was the control absent? See contributing factors',
            'Why was it not caught earlier? Inspection or supervision gap',
            'Why did systems allow it? Process or training gap',
            'Why does it matter? Prevent recurrence across site',
          ],
          fishbone: {
            people: report.rootCause.contributingFactors.filter((f) =>
              /train|supervis|worker|crew/i.test(f),
            ),
            equipment: report.rootCause.contributingFactors.filter((f) =>
              /equip|tool|machine/i.test(f),
            ),
            environment: report.rootCause.contributingFactors.filter((f) =>
              /weather|site|house|env/i.test(f),
            ),
            process: report.rootCause.contributingFactors.filter((f) =>
              /procedure|process|plan/i.test(f),
            ),
            materials: [],
          },
          corrective_actions: report.rootCause.correctiveActions.slice(0, 5),
          preventive_actions: report.interventions
            .map((i) => i.title)
            .slice(0, 3),
          sif_potential:
            report.sif.riskScore.level === 'critical'
              ? 'critical'
              : report.sif.riskScore.level === 'high'
              ? 'high'
              : 'medium',
          lessons_learned: report.sif.patterns[0] ?? '',
          predictive_risk_flags: report.hazards.precursors,
        } satisfies IncidentCopilotOutput;
      case 'equipment':
        return {
          failure_mode: String(
            context.failureMode ?? context.title ?? 'equipment_defect',
          ),
          severity_score: severityToScore(String(context.severity ?? 'medium')),
          risk_category: 'equipment',
          recommended_corrective_actions: [capa],
          recommended_preventive_actions: ['Increase inspection frequency'],
          tags: ['equipment', 'inspection_fail'],
        } satisfies EquipmentCopilotOutput;
      case 'form_hazard':
        return {
          hazard_type: String(
            context.hazardDescription ?? context.title ?? 'form_hazard',
          ),
          missing_controls: String(context.missingControls ?? '')
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean),
          severity_score: severityToScore(String(context.severity ?? 'medium')),
          root_cause_category: 'process',
          recommended_corrective_actions:
            report.rootCause.correctiveActions.slice(0, 3),
          recommended_preventive_actions: report.interventions
            .map((i) => i.title)
            .slice(0, 2),
          tags: ['form', 'hazard'],
        } satisfies FormHazardCopilotOutput;
      case 'sif_heca_assessment': {
        const text = [
          context.title,
          context.jobDescription,
          context.workScope,
          context.locationNote,
        ]
          .filter(Boolean)
          .join(' ');
        const highEnergy =
          /fall|height|electrical|pressure|crane|rigging|confined/i.test(text);
        return {
          job_steps: [String(context.title ?? 'Work activity')],
          inferred_hazards: report.hazards.precursors.slice(0, 5).map((p) => ({
            description: p,
            category: 'Field',
            severity: highEnergy ? 4 : 3,
            likelihood: 3,
            energy_types: highEnergy ? ['gravity'] : [],
            reason: 'Inferred from VASE safety analysis',
          })),
          inferred_controls: report.rootCause.correctiveActions
            .slice(0, 4)
            .map((c) => ({
              description: c,
              control_type: 'administrative',
              linked_hazard: report.hazards.precursors[0] ?? 'General',
              reason: 'Recommended from safety engine',
            })),
          energy_types: highEnergy ? ['gravity'] : [],
          heca_assessment: {
            primary_category: 'line_of_fire',
            primary_label: 'Line of fire',
            secondary_categories: [],
            high_energy: highEnergy,
            narrative: report.sif.patterns[0] ?? 'Review high-energy exposures',
          },
          sif_protocol: {
            applies:
              report.sif.riskScore.level === 'high' ||
              report.sif.riskScore.level === 'critical',
            category:
              report.sif.riskScore.level === 'critical'
                ? 'critical'
                : report.sif.riskScore.level === 'high'
                ? 'high'
                : 'medium',
            indicators: report.hazards.precursors.slice(0, 3),
            narrative: report.sif.patterns[0] ?? '',
            requires_supervisor_review: highEnergy,
          },
          scope_fit_summary:
            report.interventions[0]?.title ??
            'Review scope against SIF/HECA criteria',
          warnings: report.hazards.precursors.slice(0, 3),
        };
      }
      case 'lessons_learned':
        return {
          summary: `Lesson: ${context.title ?? 'verified corrective action'}`,
          what_went_wrong: String(context.rootCauseNotes ?? topCause),
          what_fixed_it: String(context.correctiveAction ?? capa),
          how_to_prevent_recurrence: report.interventions[0]?.title ?? capa,
          applicable_to: ['field_crews', 'supervisors'],
          recommended_training_topics: report.interventions
            .filter((i) => i.type === 'require_training')
            .map((i) => i.title),
          recommended_toolbox_talk:
            report.sif.patterns[0] ?? 'Review hazard controls',
        } satisfies LessonsLearnedCopilotOutput;
      case 'presentation':
        return {
          executive_summary: `Project safety snapshot — ${report.sif.riskScore.level} risk level`,
          key_trends: report.hazards.precursors,
          top_risks: report.rootCause.systemicFailures,
          positive_observations: [
            'BBO and inspections provide leading indicators',
          ],
          company_performance_summary:
            'See open CAIL closure rates and overdue items',
          recommended_focus_areas: report.interventions.map((i) => i.title),
          recommended_training: report.interventions
            .filter((i) => i.type === 'require_training')
            .map((i) => i.title),
          recommended_actions_next_30_days:
            report.rootCause.correctiveActions.slice(0, 5),
        } satisfies PresentationCopilotOutput;
      case 'predictive_risk':
        return {
          emerging_risks: report.hazards.precursors,
          high_risk_companies: (context.companyHotspots as string[]) ?? [],
          high_risk_tasks: report.rootCause.systemicFailures,
          high_risk_equipment: [],
          recommended_preventive_actions: report.interventions.map(
            (i) => i.title,
          ),
          early_warning_flags: report.sif.patterns,
        } satisfies PredictiveRiskCopilotOutput;
      case 'cail_analyze':
        return toCailEnvelope('incident', {
          root_cause_primary: topCause,
          corrective_actions: report.rootCause.correctiveActions,
          preventive_actions: report.interventions.map((i) => i.title),
          sif_potential: report.sif.riskScore.level,
          lessons_learned: report.sif.patterns[0],
          predictive_risk_flags: report.hazards.precursors,
        } as IncidentCopilotOutput);
      default:
        return {};
    }
  }
}
