import { Injectable } from '@nestjs/common';
import {
  SmsAiModelTier,
  SmsAiSource,
  SmsAiTone,
  SmsJhaStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsAuditService } from '../common/sms-audit.service';
import { SmsException } from '../common/sms-errors';
import { SMS_BEHAVIORS } from '../constants';
import { SmsDataIngestionPipeline } from '../engines/data-ingestion.pipeline';
import { clamp, qualityBand } from '../types';
import type { SmsRequestScope } from '../types';
import { AiInsightsCacheService } from './ai-insights-cache.service';

const TEMPLATES: Record<
  string,
  { title: string; workType: string; hazards: string[]; controls: string[] }
> = {
  'hot-work': {
    title: 'Hot work',
    workType: 'hot_work',
    hazards: ['fire', 'fumes', 'burns'],
    controls: ['permit', 'fire_watch', 'ventilation', 'ppe'],
  },
  'confined-space': {
    title: 'Confined space entry',
    workType: 'confined_space',
    hazards: ['atmosphere', 'engulfment', 'entrapment'],
    controls: ['permit', 'gas_test', 'attendant', 'rescue'],
  },
  'work-at-height': {
    title: 'Work at height',
    workType: 'height',
    hazards: ['fall', 'dropped_objects'],
    controls: ['harness', 'anchor', 'exclusion_zone', 'tool_tethers'],
  },
  excavation: {
    title: 'Excavation / trench',
    workType: 'excavation',
    hazards: ['cave_in', 'utilities', 'water'],
    controls: ['locate', 'shoring', 'egress', 'spotter'],
  },
};

/**
 * JHA template service (AI-04 / AI-05).
 * Never auto-publish — drafts only until human accept/approve.
 * Audited · enqueues metrics · SmsJhaRecord SoR projection.
 */
@Injectable()
export class JhaTemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiCache: AiInsightsCacheService,
    private readonly audit: SmsAuditService,
    private readonly ingestion: SmsDataIngestionPipeline,
  ) {}

  listTemplates() {
    return Object.entries(TEMPLATES).map(([templateId, t]) => ({
      templateId,
      title: t.title,
      workType: t.workType,
      hazardCount: t.hazards.length,
      controlCount: t.controls.length,
    }));
  }

  getTemplate(templateId: string) {
    const t = TEMPLATES[templateId];
    if (!t) throw new SmsException('NOT_FOUND', 'Template not found');
    return { templateId, ...t };
  }

  async suggest(
    scope: SmsRequestScope,
    body: { workType?: string; templateId?: string; title?: string },
  ) {
    const templateId =
      body.templateId ??
      (body.workType === 'height'
        ? 'work-at-height'
        : body.workType === 'hot_work'
          ? 'hot-work'
          : 'excavation');
    const template = this.getTemplate(
      TEMPLATES[templateId] ? templateId : 'excavation',
    );

    const result = await this.aiCache.getOrCompute(
      scope,
      SMS_BEHAVIORS.JHA_BUILDER,
      { templateId: template.templateId, projectId: scope.projectId },
      async () => ({
        behaviorId: SMS_BEHAVIORS.JHA_BUILDER,
        headline: `JHA draft from ${template.title}`,
        body: 'Library hazards/controls suggested. Review and approve — never auto-published.',
        confidence: 0.78,
        tone: SmsAiTone.neutral,
        modelTier: SmsAiModelTier.D0,
        source: SmsAiSource.rules,
        pageContext: 'jha',
        payloadJson: { template, title: body.title ?? template.title },
      }),
      'jha',
    );

    await this.audit.log({
      scope,
      action: 'ai.inference',
      entityType: 'jha_templates',
      entityId: template.templateId,
      payload: { behaviorId: SMS_BEHAVIORS.JHA_BUILDER },
    });

    return result;
  }

  async riskRank(scope: SmsRequestScope, jhaId: string) {
    const jha = await this.prisma.smsJhaRecord.findFirst({
      where: { id: jhaId, companyId: scope.companyId, deletedAt: null },
    });
    if (!jha) throw new SmsException('NOT_FOUND', 'JHA not found');

    const residual = clamp(
      jha.hazardsCount * 12 + (jha.sifPotential ? 25 : 0),
      0,
      100,
    );
    const rank = residual >= 80 ? 1 : residual >= 60 ? 2 : residual >= 40 ? 3 : 4;
    const requiresErp = residual >= 80 || jha.sifPotential;

    const updated = await this.prisma.smsJhaRecord.update({
      where: { id: jha.id },
      data: {
        residualRiskMax: residual,
        riskRankJson: { rank },
        qualityScore: clamp(100 - residual * 0.4, 0, 100),
        qualityBand: qualityBand(clamp(100 - residual * 0.4, 0, 100)),
        sifPotential: requiresErp || jha.sifPotential,
        rowVersion: { increment: 1 },
      },
    });

    await this.audit.log({
      scope,
      action: 'record.update',
      entityType: 'jha_records',
      entityId: jha.id,
      after: { residual, rank, requiresErp },
    });

    await this.ingestion.enqueue(
      scope.companyId,
      'jha.changed',
      { jhaId: jha.id, residual, rank },
      jha.projectId,
    );

    const insight = await this.aiCache.getOrCompute(
      scope,
      SMS_BEHAVIORS.JHA_RISK,
      { jhaId, residual, rank },
      async () => ({
        behaviorId: SMS_BEHAVIORS.JHA_RISK,
        headline: `Residual risk rank ${rank}`,
        body: requiresErp
          ? 'High residual / SIF — link ERP before approve.'
          : 'Risk ranked from hazard/control density.',
        confidence: 0.82,
        tone: requiresErp ? SmsAiTone.caution : SmsAiTone.neutral,
        modelTier: SmsAiModelTier.D1,
        source: SmsAiSource.scorer,
        pageContext: 'jha',
        evidenceRefsJson: { residual, hazardsCount: jha.hazardsCount },
      }),
      'jha',
    );

    return { jha: updated, requiresErp, insight };
  }

  async createFromTemplate(
    scope: SmsRequestScope,
    templateId: string,
    sorJhaFlhaId: string,
    projectId: number,
  ) {
    const template = this.getTemplate(templateId);
    const record = await this.prisma.smsJhaRecord.create({
      data: {
        sorJhaFlhaId,
        companyId: scope.companyId,
        projectId,
        accessPlane: scope.plane,
        title: template.title,
        templateKey: templateId,
        workType: template.workType,
        status: SmsJhaStatus.draft,
        hazardsCount: template.hazards.length,
        tasksCount: 1,
        createdByUserId: scope.userId,
      },
    });

    await this.audit.log({
      scope,
      action: 'record.create',
      entityType: 'jha_records',
      entityId: record.id,
      after: { templateId, status: 'draft' },
    });

    await this.ingestion.enqueue(
      scope.companyId,
      'jha.changed',
      { jhaId: record.id, templateId },
      projectId,
    );

    return record;
  }
}
