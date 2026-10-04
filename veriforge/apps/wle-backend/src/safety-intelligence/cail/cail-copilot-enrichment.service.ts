import { Injectable, Logger } from '@nestjs/common';
import { CailRiskCategory, CailSeverity, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { VsiCopilotEngineService } from '../ai/copilot/vsi-copilot-engine.service';
import type { CopilotRunResponse } from '../ai/copilot/vsi-copilot.types';
import { scoreToSeverity } from '../ai/copilot/vsi-copilot.mappers';

const CAIL_RISK_CATEGORIES = new Set<string>([
  'behavior',
  'equipment',
  'environment',
  'process',
  'ppe',
  'ergonomic',
  'other',
]);

@Injectable()
export class CailCopilotEnrichmentService {
  private readonly log = new Logger(CailCopilotEnrichmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly copilot: VsiCopilotEngineService,
  ) {}

  buildUpdateFromRun(run: CopilotRunResponse): Prisma.CailEntryUpdateInput {
    const env = run.cailEnvelope;
    const severity = scoreToSeverity(env.severity_score) as CailSeverity;
    const riskCategory = CAIL_RISK_CATEGORIES.has(String(env.risk_category))
      ? (String(env.risk_category) as CailRiskCategory)
      : undefined;

    const summary =
      env.root_cause_explanation ||
      env.lessons_learned ||
      (env.recommended_corrective_actions[0] ?? '');

    return {
      severity,
      ...(riskCategory ? { riskCategory } : {}),
      ...(env.tags.length ? { tags: env.tags as Prisma.InputJsonValue } : {}),
      aiRootCauseSuggestions: env.root_cause_explanation
        ? ([
            {
              category: env.root_cause_category || 'process',
              description: env.root_cause_explanation,
              confidence: 0.85,
            },
          ] as Prisma.InputJsonValue)
        : undefined,
      aiCorrectiveActionSuggestions: [
        ...env.recommended_corrective_actions.map((description) => ({
          title: description.slice(0, 120),
          description,
          actionType: 'corrective',
          priority:
            severity === 'critical' || severity === 'high' ? 'high' : 'medium',
        })),
        ...env.recommended_preventive_actions.map((description) => ({
          title: description.slice(0, 120),
          description,
          actionType: 'preventive',
          priority: 'medium',
        })),
      ] as Prisma.InputJsonValue,
      aiClassification: {
        summary,
        similarPatterns: env.predictive_risk_flags,
        engine: run.engine.join('+'),
        module: run.module,
        generatedAt: run.generatedAt,
        cailEnvelope: env,
        copilotOutput: run.output,
      } as Prisma.InputJsonValue,
    };
  }

  async persistRun(cailId: string, run: CopilotRunResponse) {
    return this.prisma.cailEntry.update({
      where: { id: cailId },
      data: this.buildUpdateFromRun(run),
    });
  }

  /** Best-effort async enrichment — never blocks emit paths. */
  scheduleEnrich(cailId: string, task: () => Promise<CopilotRunResponse>) {
    void task()
      .then((run) => this.persistRun(cailId, run))
      .catch((err) =>
        this.log.warn(
          `Copilot enrich failed for CAIL ${cailId}: ${
            err instanceof Error ? err.message : err
          }`,
        ),
      );
  }

  async enrichBbo(
    bboId: string,
    cailId: string | undefined,
    context: Record<string, unknown>,
  ) {
    const run = await this.copilot.analyzeBbo(context);
    await this.prisma.bboObservation.update({
      where: { id: bboId },
      data: {
        aiAnalysis: {
          copilot: run.output,
          cailEnvelope: run.cailEnvelope,
          engine: run.engine,
          generatedAt: run.generatedAt,
        } as Prisma.InputJsonValue,
      },
    });
    if (cailId) await this.persistRun(cailId, run);
    return run;
  }

  scheduleBboEnrich(
    bboId: string,
    cailId: string | undefined,
    context: Record<string, unknown>,
  ) {
    void this.enrichBbo(bboId, cailId, context).catch((err) =>
      this.log.warn(
        `BBO copilot enrich failed (${bboId}): ${
          err instanceof Error ? err.message : err
        }`,
      ),
    );
  }

  scheduleEquipmentEnrich(cailId: string, context: Record<string, unknown>) {
    this.scheduleEnrich(cailId, () => this.copilot.analyzeEquipment(context));
  }

  scheduleFormHazardEnrich(cailId: string, context: Record<string, unknown>) {
    this.scheduleEnrich(cailId, () => this.copilot.analyzeFormHazard(context));
  }

  scheduleInspectionEnrich(cailId: string, context: Record<string, unknown>) {
    this.scheduleEnrich(cailId, () => this.copilot.inspectPhoto(context));
  }

  scheduleCailAnalyzeEnrich(cailId: string, context: Record<string, unknown>) {
    this.scheduleEnrich(cailId, () => this.copilot.analyzeCail(context));
  }

  persistInspectionRun(cailId: string, run: CopilotRunResponse) {
    this.scheduleEnrich(cailId, async () => run);
  }
}
