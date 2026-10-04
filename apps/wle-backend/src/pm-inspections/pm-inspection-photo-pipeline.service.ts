import {
  Injectable,
  Logger,
  Optional,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  PmDeficiencySeverity,
  PmInspectionFindingCategory,
  PmInspectionResponsibleParty,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VisionService } from '../modules/vision/vision.service';
import {
  LlmSafetyService,
  type LlmInspectionFinding,
} from '../safety-intelligence/ai/llm-safety.service';
import {
  PmInspectionFindingCapaService,
  StructuredFindingInput,
} from './pm-inspection-finding-capa.service';
import { PmInspectionContractorDispatchService } from './pm-inspection-contractor-dispatch.service';
import { PmInspectionSubcontractorResolverService } from './pm-inspection-subcontractor-resolver.service';
import { SmsInspectionIntegrationService } from '../pm-sms-core/sms-inspection-integration.service';
import { INSPECTION_PHOTO_CAPTURED_AUDIT_EVENT } from './pm-inspection-completed-event.types';
import { ConcurrencyPool } from '../common/ttl-cache';
import { replayOrConflict } from '../common/prisma-errors';

type CaptureInput = {
  inspectionId: string;
  actorId: number;
  dataUrl?: string;
  coreFileId?: number;
  fileName?: string;
  mimeType?: string;
  caption?: string;
  clientSyncId?: string;
  offline?: boolean;
  defaultSubcontractorCompanyId?: number;
  checklistItemId?: string;
  locationDescription?: string;
  pictureDescription?: string;
  safetyStatus?: 'safe' | 'at_risk';
  responsibleCompanyId?: number;
  /** When true, block until vision/LLM/CAPA finish (tests / explicit sync). */
  waitForAnalysis?: boolean;
};

export type PhotoMetadataInput = {
  inspectionId: string;
  attachmentId: string;
  actorId: number;
  locationDescription: string;
  pictureDescription: string;
  safetyStatus: 'safe' | 'at_risk';
  responsibleCompanyId?: number;
};

@Injectable()
export class PmInspectionPhotoPipelineService {
  private readonly logger = new Logger(PmInspectionPhotoPipelineService.name);
  private readonly analysisPool = new ConcurrencyPool(
    Math.max(1, Number(process.env.VERA_PHOTO_ANALYSIS_CONCURRENCY ?? 3)),
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly vision: VisionService,
    private readonly findingCapa: PmInspectionFindingCapaService,
    private readonly subcontractorResolver: PmInspectionSubcontractorResolverService,
    @Optional() private readonly llm?: LlmSafetyService,
    @Optional()
    private readonly contractorDispatch?: PmInspectionContractorDispatchService,
    @Optional()
    private readonly smsInspection?: SmsInspectionIntegrationService,
  ) {}

  private preferAsync(input: CaptureInput): boolean {
    if (input.waitForAnalysis === true) return false;
    if (input.waitForAnalysis === false) return true;
    // Default async unless explicitly disabled (keeps HTTP / offline sync responsive).
    return process.env.VERA_PHOTO_ANALYSIS_ASYNC !== 'false';
  }

  async captureAndAnalyze(input: CaptureInput) {
    if (input.clientSyncId) {
      const existing = await this.prisma.pmInspectionAttachment.findUnique({
        where: { clientSyncId: input.clientSyncId },
        include: { photoFindings: true },
      });
      if (existing) {
        if (existing.inspectionId !== input.inspectionId) {
          throw new ConflictException(
            'clientSyncId already used on another inspection',
          );
        }
        return {
          attachment: existing,
          findings: existing.photoFindings,
          correctiveActions: [],
          dispatches: [],
          visionSummary: null,
          llmSummary: null,
          analysisEngine: 'idempotent_replay',
          analysisMode: existing.analysisStatus ?? 'complete',
          analysisStatus: existing.analysisStatus ?? 'complete',
          visionCapabilities: this.vision.getCapabilities(
            !!input.caption?.trim(),
          ),
        };
      }
    }

    const inspection = await this.prisma.pmInspection.findUnique({
      where: { id: input.inspectionId },
      include: {
        project: { select: { name: true } },
      },
    });
    if (!inspection) throw new NotFoundException('Inspection not found');

    const photoNumber = await this.nextPhotoNumber(inspection.id);
    const annotation = this.buildAnnotationJson(input, photoNumber);

    let attachment;
    try {
      attachment = await this.prisma.pmInspectionAttachment.create({
        data: {
          inspectionId: inspection.id,
          dataUrl: input.dataUrl,
          coreFileId: input.coreFileId,
          fileName: input.fileName ?? 'inspection-photo.jpg',
          mimeType: input.mimeType ?? 'image/jpeg',
          clientSyncId: input.clientSyncId,
          analysisStatus: 'processing',
          annotationJson: annotation as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      attachment = await replayOrConflict(err, async () => {
        if (!input.clientSyncId) return null;
        return this.prisma.pmInspectionAttachment.findUnique({
          where: { clientSyncId: input.clientSyncId },
          include: { photoFindings: true },
        });
      });
      const findings =
        'photoFindings' in attachment && Array.isArray(attachment.photoFindings)
          ? attachment.photoFindings
          : [];
      return {
        attachment,
        findings,
        correctiveActions: [],
        dispatches: [],
        visionSummary: null,
        llmSummary: null,
        analysisEngine: 'idempotent_replay',
        analysisMode: attachment.analysisStatus ?? 'complete',
        analysisStatus: attachment.analysisStatus ?? 'complete',
        visionCapabilities: this.vision.getCapabilities(
          !!input.caption?.trim(),
        ),
      };
    }

    if (this.preferAsync(input)) {
      void this.analysisPool
        .run(() => this.completeAnalysis(attachment.id, input, inspection))
        .catch((err) =>
          this.logger.warn(`Background photo analysis failed: ${err}`),
        );

      return {
        attachment,
        findings: [],
        correctiveActions: [],
        dispatches: [],
        visionSummary: null,
        llmSummary: null,
        analysisEngine: 'queued',
        analysisMode: 'queued',
        analysisStatus: 'processing' as const,
        visionCapabilities: this.vision.getCapabilities(!!input.caption?.trim()),
      };
    }

    return this.completeAnalysis(attachment.id, input, inspection);
  }

  private async completeAnalysis(
    attachmentId: string,
    input: CaptureInput,
    inspection: {
      id: string;
      companyId: number;
      projectId: number;
    },
  ) {
    const imagePayload = parseDataUrl(input.dataUrl);

    let visionResult: Awaited<
      ReturnType<VisionService['analyzeInspection']>
    > | null = null;
    let llmAnalysis: Awaited<
      ReturnType<LlmSafetyService['analyzeInspectionPhotoFindings']>
    > | null = null;

    try {
      const [vision, llm] = await Promise.all([
        this.vision
          .analyzeInspection({
            ocrText: input.caption ?? 'construction safety inspection photo',
            companyId: inspection.companyId,
            projectId: inspection.projectId,
            offline: input.offline,
            imageHints: {
              hazards: input.caption ? [input.caption] : undefined,
            },
          })
          .catch((err) => {
            this.logger.warn(`Vision analysis failed: ${err}`);
            return null;
          }),
        this.llm?.isConfigured()
          ? this.llm.analyzeInspectionPhotoFindings({
              caption: input.caption,
              ocrText: input.caption,
              imageBase64: imagePayload?.base64,
              imageMimeType: imagePayload?.mimeType ?? input.mimeType,
              companyId: inspection.companyId,
              projectId: inspection.projectId,
            })
          : Promise.resolve(null),
      ]);

      visionResult = vision;
      llmAnalysis = llm;

      if (
        this.llm?.isConfigured() &&
        visionResult &&
        !llmAnalysis?.findings?.length
      ) {
        llmAnalysis = await this.llm.analyzeInspectionPhotoFindings({
          caption: input.caption,
          ocrText: visionResult.ocr?.fullText,
          visionSummary: visionResult.summary?.bullets?.join('. '),
          visionHazards: visionResult.visual?.hazards,
          imageBase64: imagePayload?.base64,
          imageMimeType: imagePayload?.mimeType ?? input.mimeType,
          companyId: inspection.companyId,
          projectId: inspection.projectId,
        });
      }

      await this.prisma.pmInspectionAttachment.update({
        where: { id: attachmentId },
        data: {
          analysisStatus: 'complete',
          analysisJson: {
            vision: visionResult,
            llm: llmAnalysis,
          } as Prisma.InputJsonValue,
          // Drop inline bytes once analyzed when an object-store ref exists.
          ...(input.coreFileId ? { dataUrl: null } : {}),
        },
      });
    } catch (err) {
      this.logger.warn(`Photo analysis failed: ${err}`);
      await this.prisma.pmInspectionAttachment.update({
        where: { id: attachmentId },
        data: { analysisStatus: 'failed' },
      });
    }

    const ruleFindings = this.extractFindingsFromRules(
      visionResult,
      input.caption,
    );
    const llmFindings = this.extractFindingsFromLlm(llmAnalysis);
    const structured = this.mergeFindings(ruleFindings, llmFindings);

    const findings = [];
    const correctiveActions = [];
    const dispatches = [];

    for (const s of structured) {
      if (s.responsibleParty === 'contractor') {
        s.subcontractorCompanyId =
          await this.subcontractorResolver.resolveForFinding(
            inspection.projectId,
            s.category,
            input.defaultSubcontractorCompanyId,
          );
      }

      const findingRow = await this.prisma.pmInspectionPhotoFinding.create({
        data: {
          inspectionId: inspection.id,
          attachmentId,
          category: s.category,
          title: s.title,
          description: s.description,
          severity: s.severity,
          confidence: s.confidence,
          responsibleParty: s.responsibleParty,
          evidenceRequired: EVIDENCE_FOR(s.category),
          analysisJson: {
            source: s.source,
            llm: llmAnalysis?.hazardSummary,
          } as Prisma.InputJsonValue,
          clientSyncId: input.clientSyncId
            ? `${input.clientSyncId}-${s.category}-${s.title.slice(0, 12)}`
            : undefined,
        },
      });

      const capaResult = await this.findingCapa.generateFromFinding({
        inspectionId: inspection.id,
        findingId: findingRow.id,
        actorId: input.actorId,
        structured: s,
        attachmentId,
      });

      if (this.smsInspection) {
        const analysisText = [
          s.title,
          s.description,
          llmAnalysis?.hazardSummary,
          visionResult?.summary?.bullets?.join(' '),
        ]
          .filter(Boolean)
          .join(' ');
        await this.smsInspection.autoTagFromAnalysis(
          findingRow.id,
          inspection.companyId,
          inspection.projectId,
          s.severity,
          analysisText,
        );
      }

      findings.push(findingRow);
      if (capaResult?.correctiveAction) {
        correctiveActions.push(capaResult.correctiveAction);

        if (
          s.responsibleParty === 'contractor' &&
          s.subcontractorCompanyId &&
          this.contractorDispatch
        ) {
          const dispatch =
            await this.contractorDispatch.dispatchForCorrectiveAction(
              capaResult.correctiveAction.id,
              input.actorId,
              input.clientSyncId,
            );
          dispatches.push(dispatch);
        }
      }
    }

    await this.prisma.pmInspectionAuditLog.create({
      data: {
        inspectionId: inspection.id,
        eventType: INSPECTION_PHOTO_CAPTURED_AUDIT_EVENT,
        actorId: input.actorId,
        payload: {
          attachmentId,
          findingCount: findings.length,
          llmFindingCount: llmFindings.length,
          ruleFindingCount: ruleFindings.length,
        } as Prisma.InputJsonValue,
      },
    });

    const analysisMode = llmAnalysis?.findings?.length
      ? 'full'
      : visionResult
        ? 'vision_rules'
        : 'caption_fallback';

    const attachment = await this.prisma.pmInspectionAttachment.findUniqueOrThrow({
      where: { id: attachmentId },
    });

    return {
      attachment,
      findings,
      correctiveActions,
      dispatches,
      visionSummary: visionResult?.summary ?? null,
      llmSummary: llmAnalysis?.hazardSummary ?? null,
      analysisEngine: llmAnalysis?.findings?.length
        ? 'vision+llm'
        : 'vision+rules',
      analysisMode,
      analysisStatus: attachment.analysisStatus,
      visionCapabilities: this.vision.getCapabilities(!!input.caption?.trim()),
    };
  }

  async savePhotoMetadata(input: PhotoMetadataInput) {
    const attachment = await this.prisma.pmInspectionAttachment.findFirst({
      where: { id: input.attachmentId, inspectionId: input.inspectionId },
    });
    if (!attachment) throw new BadRequestException('Attachment not found');

    const inspection = await this.prisma.pmInspection.findUnique({
      where: { id: input.inspectionId },
    });
    if (!inspection) throw new BadRequestException('Inspection not found');

    const existing = (attachment.annotationJson ?? {}) as Record<
      string,
      unknown
    >;
    const photoNumber =
      typeof existing.photoNumber === 'number'
        ? existing.photoNumber
        : await this.nextPhotoNumber(input.inspectionId);

    let responsibleCompanyName: string | null = null;
    if (input.responsibleCompanyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: input.responsibleCompanyId },
        select: { name: true },
      });
      responsibleCompanyName = company?.name ?? null;
    }

    const annotationJson = {
      ...existing,
      photoNumber,
      locationDescription: input.locationDescription.trim(),
      pictureDescription: input.pictureDescription.trim(),
      safetyStatus: input.safetyStatus,
      responsibleCompanyId: input.responsibleCompanyId ?? null,
      responsibleCompanyName,
    };

    await this.prisma.pmInspectionAttachment.update({
      where: { id: attachment.id },
      data: { annotationJson: annotationJson as Prisma.InputJsonValue },
    });

    if (input.safetyStatus === 'at_risk') {
      await this.ensureFindingForAtRiskPhoto({
        inspectionId: input.inspectionId,
        attachmentId: attachment.id,
        actorId: input.actorId,
        title:
          input.pictureDescription.trim() || 'At-risk condition documented',
        description: [
          input.locationDescription.trim(),
          input.pictureDescription.trim(),
        ]
          .filter(Boolean)
          .join(' — '),
        responsibleCompanyId: input.responsibleCompanyId,
        defaultSubcontractorCompanyId: input.responsibleCompanyId,
      });
    }

    return { attachmentId: attachment.id, photoNumber, annotationJson };
  }

  /** Validates photo-first inspections before submit. */
  async assertReadyForPhotoFirstSubmit(inspectionId: string) {
    const inspection = await this.prisma.pmInspection.findUnique({
      where: { id: inspectionId },
      include: {
        template: true,
        attachments: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!inspection) throw new BadRequestException('Inspection not found');

    const imageAttachments = inspection.attachments.filter(
      (a) => a.dataUrl || a.mimeType?.startsWith('image/'),
    );
    if (!imageAttachments.length) {
      throw new BadRequestException(
        'Add at least one field photo before generating the report.',
      );
    }

    const companies = await this.subcontractorResolver.listWithNames(
      inspection.projectId,
    );

    for (const att of imageAttachments) {
      const ann = att.annotationJson as {
        safetyStatus?: string;
        locationDescription?: string;
        pictureDescription?: string;
        responsibleCompanyId?: number | null;
        photoNumber?: number;
      } | null;

      if (!ann?.safetyStatus) {
        const num = ann?.photoNumber ?? '?';
        throw new BadRequestException(
          `Photo #${num} needs a safety status (Safe or At risk) before submit.`,
        );
      }

      if (
        ann.safetyStatus === 'at_risk' &&
        companies.length > 0 &&
        !ann.responsibleCompanyId
      ) {
        const num = ann.photoNumber ?? '?';
        throw new BadRequestException(
          `Photo #${num} is at risk — select the responsible company before submit.`,
        );
      }
    }
  }

  /** Assign contractor dispatches for at-risk photos marked on submit. */
  async ensureAtRiskAssignmentsOnSubmit(inspectionId: string, actorId: number) {
    const attachments = await this.prisma.pmInspectionAttachment.findMany({
      where: { inspectionId },
      orderBy: { createdAt: 'asc' },
    });

    for (const att of attachments) {
      const ann = att.annotationJson as {
        safetyStatus?: string;
        responsibleCompanyId?: number;
        pictureDescription?: string;
        locationDescription?: string;
      } | null;
      if (ann?.safetyStatus !== 'at_risk') continue;

      await this.ensureFindingForAtRiskPhoto({
        inspectionId,
        attachmentId: att.id,
        actorId,
        title: ann.pictureDescription?.trim() || 'At-risk condition documented',
        description: [ann.locationDescription, ann.pictureDescription]
          .filter(Boolean)
          .join(' — '),
        responsibleCompanyId: ann.responsibleCompanyId,
        defaultSubcontractorCompanyId: ann.responsibleCompanyId,
      });
    }
  }

  private async ensureFindingForAtRiskPhoto(input: {
    inspectionId: string;
    attachmentId: string;
    actorId: number;
    title: string;
    description: string;
    responsibleCompanyId?: number;
    defaultSubcontractorCompanyId?: number;
  }) {
    const existing = await this.prisma.pmInspectionPhotoFinding.findFirst({
      where: {
        inspectionId: input.inspectionId,
        attachmentId: input.attachmentId,
      },
      include: { correctiveAction: true },
    });
    if (existing?.correctiveActionId && this.contractorDispatch) {
      const dispatch =
        await this.prisma.pmInspectionContractorDispatch.findFirst({
          where: { correctiveActionId: existing.correctiveActionId },
        });
      if (dispatch) return existing;
    }

    const inspection = await this.prisma.pmInspection.findUnique({
      where: { id: input.inspectionId },
    });
    if (!inspection) return null;

    let subcontractorCompanyId = input.responsibleCompanyId;
    if (!subcontractorCompanyId) {
      subcontractorCompanyId =
        await this.subcontractorResolver.resolveForFinding(
          inspection.projectId,
          'unsafe_condition',
          input.defaultSubcontractorCompanyId,
        );
    }

    const structured: StructuredFindingInput = {
      category: 'unsafe_condition',
      title: input.title,
      description: input.description,
      severity: 'high',
      confidence: 0.9,
      responsibleParty: subcontractorCompanyId ? 'contractor' : 'supervisor',
      subcontractorCompanyId,
      source: 'rules',
    };

    if (existing) {
      await this.prisma.pmInspectionPhotoFinding.update({
        where: { id: existing.id },
        data: {
          title: structured.title,
          description: structured.description,
          responsibleParty: structured.responsibleParty,
        },
      });
      if (
        existing.correctiveActionId &&
        structured.responsibleParty === 'contractor' &&
        subcontractorCompanyId &&
        this.contractorDispatch
      ) {
        const hasDispatch =
          await this.prisma.pmInspectionContractorDispatch.findFirst({
            where: { correctiveActionId: existing.correctiveActionId },
          });
        if (!hasDispatch) {
          await this.contractorDispatch.dispatchForCorrectiveAction(
            existing.correctiveActionId,
            input.actorId,
          );
        }
      }
      return existing;
    }

    const findingRow = await this.prisma.pmInspectionPhotoFinding.create({
      data: {
        inspectionId: input.inspectionId,
        attachmentId: input.attachmentId,
        category: structured.category,
        title: structured.title,
        description: structured.description,
        severity: structured.severity,
        confidence: structured.confidence,
        responsibleParty: structured.responsibleParty,
        evidenceRequired: EVIDENCE_FOR(structured.category),
        analysisJson: { source: 'manual_at_risk' } as Prisma.InputJsonValue,
      },
    });

    const capaResult = await this.findingCapa.generateFromFinding({
      inspectionId: input.inspectionId,
      findingId: findingRow.id,
      actorId: input.actorId,
      structured,
      attachmentId: input.attachmentId,
    });

    if (
      structured.responsibleParty === 'contractor' &&
      subcontractorCompanyId &&
      capaResult?.correctiveAction &&
      this.contractorDispatch
    ) {
      await this.contractorDispatch.dispatchForCorrectiveAction(
        capaResult.correctiveAction.id,
        input.actorId,
      );
    }

    return findingRow;
  }

  private async nextPhotoNumber(inspectionId: string): Promise<number> {
    const attachments = await this.prisma.pmInspectionAttachment.findMany({
      where: { inspectionId },
      select: { annotationJson: true },
    });
    let max = 0;
    for (const att of attachments) {
      const n = (att.annotationJson as { photoNumber?: number } | null)
        ?.photoNumber;
      if (typeof n === 'number' && n > max) max = n;
    }
    return max + 1;
  }

  private buildAnnotationJson(input: CaptureInput, photoNumber: number) {
    const base: Record<string, unknown> = {};
    if (input.checklistItemId) base.checklistItemId = input.checklistItemId;
    base.photoNumber = photoNumber;
    if (input.locationDescription)
      base.locationDescription = input.locationDescription;
    if (input.pictureDescription)
      base.pictureDescription = input.pictureDescription;
    if (input.safetyStatus) base.safetyStatus = input.safetyStatus;
    if (input.responsibleCompanyId)
      base.responsibleCompanyId = input.responsibleCompanyId;
    return Object.keys(base).length ? base : { photoNumber };
  }

  private extractFindingsFromRules(
    vision: Awaited<ReturnType<VisionService['analyzeInspection']>> | null,
    caption?: string,
  ): StructuredFindingInput[] {
    const results: StructuredFindingInput[] = [];
    const text = [
      caption,
      vision?.ocr?.fullText,
      ...(vision?.visual?.hazards ?? []),
      ...(vision?.classification?.tags ?? []),
    ]
      .filter(Boolean)
      .join('\n')
      .toLowerCase();

    const rules: Array<{
      test: RegExp;
      category: PmInspectionFindingCategory;
      title: string;
      severity: PmDeficiencySeverity;
      party: PmInspectionResponsibleParty;
    }> = [
      {
        test: /no hard hat|missing ppe|without harness|no safety glasses|ppe/i,
        category: 'missing_ppe',
        title: 'Missing or inadequate PPE',
        severity: 'high',
        party: 'worker',
      },
      {
        test: /crack|damage|broken|defect|leak|guard missing|equipment/i,
        category: 'equipment_defect',
        title: 'Equipment defect observed',
        severity: 'high',
        party: 'contractor',
      },
      {
        test: /clutter|housekeeping|trip hazard|slip|debris/i,
        category: 'housekeeping',
        title: 'Housekeeping deficiency',
        severity: 'medium',
        party: 'contractor',
      },
      {
        test: /unsafe|hazard|violation|fall risk|electrical|excavat/i,
        category: 'unsafe_condition',
        title: 'Unsafe condition identified',
        severity: vision?.reviewRequired ? 'critical' : 'high',
        party: 'supervisor',
      },
      {
        test: /spill|chemical|environment|dust|noise/i,
        category: 'environmental',
        title: 'Environmental concern',
        severity: 'medium',
        party: 'company',
      },
    ];

    for (const rule of rules) {
      if (rule.test.test(text)) {
        results.push({
          category: rule.category,
          title: rule.title,
          description: vision?.summary?.bullets?.[0] ?? caption,
          severity: rule.severity,
          confidence: vision?.classification?.confidence ?? 0.72,
          responsibleParty: rule.party,
          source: 'rules',
        });
      }
    }

    if (
      !results.length &&
      (vision?.reviewRequired || vision?.visual?.hazards?.length)
    ) {
      results.push({
        category: 'other',
        title: vision?.summary?.bullets?.[0] ?? 'Condition requires review',
        description: caption,
        severity: 'medium',
        confidence: 0.55,
        responsibleParty: 'supervisor',
        source: 'rules',
      });
    }

    return results;
  }

  private extractFindingsFromLlm(
    analysis: Awaited<
      ReturnType<LlmSafetyService['analyzeInspectionPhotoFindings']>
    > | null,
  ): StructuredFindingInput[] {
    if (!analysis?.findings?.length) return [];

    return analysis.findings.map((f: LlmInspectionFinding) => ({
      category: f.category as PmInspectionFindingCategory,
      title: f.title,
      description: f.description ?? analysis.hazardSummary,
      severity: mapLlmSeverity(f.severity),
      confidence: f.confidence ?? 0.85,
      responsibleParty: f.responsibleParty as PmInspectionResponsibleParty,
      source: 'llm' as const,
    }));
  }

  private mergeFindings(
    rules: StructuredFindingInput[],
    llm: StructuredFindingInput[],
  ): StructuredFindingInput[] {
    const merged = [...llm];
    for (const r of rules) {
      const dup = merged.some(
        (m) => m.category === r.category && similarity(m.title, r.title) > 0.6,
      );
      if (!dup) merged.push(r);
    }
    return merged;
  }
}

function mapLlmSeverity(s: string): PmDeficiencySeverity {
  if (s === 'critical') return 'critical';
  if (s === 'high') return 'high';
  if (s === 'low') return 'low';
  return 'medium';
}

function similarity(a: string, b: string): number {
  const ta = new Set(a.toLowerCase().split(/\s+/));
  const tb = new Set(b.toLowerCase().split(/\s+/));
  let inter = 0;
  for (const w of ta) if (tb.has(w)) inter++;
  return inter / Math.max(ta.size, tb.size, 1);
}

function parseDataUrl(
  dataUrl?: string,
): { base64: string; mimeType: string } | null {
  if (!dataUrl?.startsWith('data:')) return null;
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) return null;
  return { mimeType: match[1]!, base64: match[2]! };
}

function EVIDENCE_FOR(category: PmInspectionFindingCategory): string[] {
  const map: Record<PmInspectionFindingCategory, string[]> = {
    unsafe_condition: ['photo_after', 'supervisor_signoff'],
    missing_ppe: ['photo_compliance'],
    equipment_defect: ['photo_repair'],
    housekeeping: ['photo_cleared'],
    environmental: ['photo_mitigation'],
    other: ['photo_evidence'],
  };
  return map[category];
}
