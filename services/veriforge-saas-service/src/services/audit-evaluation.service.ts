import type {
  AuditEvaluationStatus,
  AuditFindingSeverity,
  AuditFindingStatus,
  CorrectiveActionStatus,
  Prisma,
} from '@prisma/client';
import { prisma } from '../db/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { contractorDirectoryService } from './contractor-directory.service';
import { documentCenterService } from './document-center.service';
import { notificationService } from './notification.service';
import {
  resultFromScore,
  scoreAudit,
  type ScoreAnswer,
  type ScoreSection,
} from '../audit-evaluation/scoring-engine';
import {
  defaultSafetyTemplate,
  validateTemplateBuilder,
  type TemplateBuilderInput,
} from '../audit-evaluation/template-builder';

const templateInclude = {
  sections: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      questions: { orderBy: { sortOrder: 'asc' as const } },
    },
  },
};

const auditInclude = {
  template: { include: templateInclude },
  responses: true,
  findings: {
    include: { correctiveActions: true },
    orderBy: { createdAt: 'desc' as const },
  },
  correctiveActions: { orderBy: { dueDate: 'asc' as const } },
};

/**
 * Audit & Evaluation — templates, reviewer workflow, scoring, CAs.
 */
export class AuditEvaluationService {
  async assertProfile(contractorId: string) {
    const profile = await prisma.contractorProfile.findUnique({
      where: { contractorId },
    });
    if (!profile) {
      throw new NotFoundError(
        'Contractor directory profile required — create profile first',
      );
    }
    return profile;
  }

  assertOwner(orgId: string | undefined, contractorId: string) {
    if (!orgId || orgId !== contractorId) {
      throw new ForbiddenError('Contractor org access required');
    }
  }

  // ── Templates ────────────────────────────────────────────────────────────

  async ensureDefaultTemplate() {
    const existing = await prisma.auditTemplate.findFirst({
      where: { orgId: null, name: 'Safety prequalification', isActive: true },
      include: templateInclude,
    });
    if (existing) return existing;
    return this.createTemplate(null, defaultSafetyTemplate());
  }

  async listTemplates(opts?: { orgId?: string; includeInactive?: boolean }) {
    await this.ensureDefaultTemplate();
    const where: Prisma.AuditTemplateWhereInput = {
      OR: [{ orgId: null }, ...(opts?.orgId ? [{ orgId: opts.orgId }] : [])],
      ...(opts?.includeInactive ? {} : { isActive: true }),
    };
    return prisma.auditTemplate.findMany({
      where,
      include: templateInclude,
      orderBy: [{ orgId: 'asc' }, { name: 'asc' }],
    });
  }

  async getTemplate(templateId: string) {
    const t = await prisma.auditTemplate.findUnique({
      where: { id: templateId },
      include: templateInclude,
    });
    if (!t) throw new NotFoundError('Template not found');
    return t;
  }

  async createTemplate(orgId: string | null, input: TemplateBuilderInput) {
    const errors = validateTemplateBuilder(input);
    if (errors.length) throw new BadRequestError(errors.join('; '));

    return prisma.auditTemplate.create({
      data: {
        orgId: orgId || null,
        name: input.name.trim(),
        description: input.description,
        category: input.category || 'safety',
        sections: {
          create: input.sections.map((s, i) => ({
            title: s.title.trim(),
            description: s.description,
            weight: s.weight,
            sortOrder: s.sortOrder ?? i,
            questions: {
              create: s.questions.map((q, j) => ({
                prompt: q.prompt.trim(),
                helpText: q.helpText,
                questionType: q.questionType || 'score',
                weight: q.weight ?? 1,
                maxScore: q.maxScore ?? 100,
                required: q.required ?? true,
                sortOrder: q.sortOrder ?? j,
                documentCategoryHint: q.documentCategoryHint,
              })),
            },
          })),
        },
      },
      include: templateInclude,
    });
  }

  async updateTemplate(
    templateId: string,
    orgId: string | undefined,
    input: TemplateBuilderInput & { isActive?: boolean },
  ) {
    const existing = await this.getTemplate(templateId);
    if (existing.orgId && existing.orgId !== orgId) {
      throw new ForbiddenError('Cannot edit another org template');
    }
    if (!existing.orgId && orgId) {
      // Platform templates: orgs clone instead of mutate
      throw new ForbiddenError('Clone the platform template to customize');
    }
    const errors = validateTemplateBuilder(input);
    if (errors.length) throw new BadRequestError(errors.join('; '));

    await prisma.$transaction(async (tx) => {
      await tx.auditTemplateQuestion.deleteMany({
        where: { section: { templateId } },
      });
      await tx.auditTemplateSection.deleteMany({ where: { templateId } });
      await tx.auditTemplate.update({
        where: { id: templateId },
        data: {
          name: input.name.trim(),
          description: input.description,
          category: input.category || existing.category,
          isActive: input.isActive ?? existing.isActive,
          version: existing.version + 1,
          sections: {
            create: input.sections.map((s, i) => ({
              title: s.title.trim(),
              description: s.description,
              weight: s.weight,
              sortOrder: s.sortOrder ?? i,
              questions: {
                create: s.questions.map((q, j) => ({
                  prompt: q.prompt.trim(),
                  helpText: q.helpText,
                  questionType: q.questionType || 'score',
                  weight: q.weight ?? 1,
                  maxScore: q.maxScore ?? 100,
                  required: q.required ?? true,
                  sortOrder: q.sortOrder ?? j,
                  documentCategoryHint: q.documentCategoryHint,
                })),
              },
            })),
          },
        },
      });
    });

    return this.getTemplate(templateId);
  }

  async cloneTemplate(templateId: string, orgId: string, name?: string) {
    const src = await this.getTemplate(templateId);
    return this.createTemplate(orgId, {
      name: name || `${src.name} (copy)`,
      description: src.description || undefined,
      category: src.category,
      sections: src.sections.map((s) => ({
        title: s.title,
        description: s.description || undefined,
        weight: s.weight,
        sortOrder: s.sortOrder,
        questions: s.questions.map((q) => ({
          prompt: q.prompt,
          helpText: q.helpText || undefined,
          questionType: q.questionType,
          weight: q.weight,
          maxScore: q.maxScore,
          required: q.required,
          sortOrder: q.sortOrder,
          documentCategoryHint: q.documentCategoryHint || undefined,
        })),
      })),
    });
  }

  // ── Audits ───────────────────────────────────────────────────────────────

  async listAudits(opts: {
    contractorId?: string;
    reviewerId?: string;
    status?: AuditEvaluationStatus;
    hiringClientId?: string;
    skip?: number;
    take?: number;
  }) {
    const skip = opts.skip ?? 0;
    const take = Math.min(opts.take ?? 50, 100);
    const where: Prisma.EvaluationAuditWhereInput = {
      contractorId: opts.contractorId,
      reviewerId: opts.reviewerId,
      status: opts.status,
      hiringClientId: opts.hiringClientId,
    };
    const [items, total] = await Promise.all([
      prisma.evaluationAudit.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
        include: {
          template: { select: { id: true, name: true, category: true } },
          findings: { select: { id: true, status: true, severity: true } },
          correctiveActions: { select: { id: true, status: true } },
        },
      }),
      prisma.evaluationAudit.count({ where }),
    ]);
    return { items, total, skip, take };
  }

  async getAudit(auditId: string) {
    const audit = await prisma.evaluationAudit.findUnique({
      where: { id: auditId },
      include: auditInclude,
    });
    if (!audit) throw new NotFoundError('Audit not found');
    return audit;
  }

  async createAudit(input: {
    contractorId: string;
    templateId: string;
    title?: string;
    createdById?: string;
    hiringClientId?: string;
    dueDate?: string | Date | null;
    reviewerId?: string;
    reviewerName?: string;
  }) {
    await this.assertProfile(input.contractorId);
    const template = await this.getTemplate(input.templateId);
    if (!template.isActive) throw new BadRequestError('Template inactive');

    let documentSnapshot: Prisma.InputJsonValue | undefined;
    try {
      documentSnapshot = (await documentCenterService.dashboard(
        input.contractorId,
      )) as unknown as Prisma.InputJsonValue;
    } catch {
      documentSnapshot = undefined;
    }

    const status: AuditEvaluationStatus = input.reviewerId
      ? 'assigned'
      : 'draft';

    const audit = await prisma.evaluationAudit.create({
      data: {
        contractorId: input.contractorId,
        templateId: input.templateId,
        title: input.title?.trim() || `${template.name} — ${new Date().toISOString().slice(0, 10)}`,
        status,
        createdById: input.createdById,
        hiringClientId: input.hiringClientId,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        reviewerId: input.reviewerId,
        reviewerName: input.reviewerName,
        assignedAt: input.reviewerId ? new Date() : null,
        documentSnapshot,
      },
      include: auditInclude,
    });

    if (input.reviewerId) {
      await notificationService.createNotification({
        orgId: input.contractorId,
        userId: input.reviewerId,
        type: 'system_alert',
        title: 'Audit assigned',
        message: `You were assigned to review: ${audit.title}`,
        dedupeKey: `audit-assign-${audit.id}-${input.reviewerId}`,
        meta: { auditId: audit.id },
      });
    }

    return audit;
  }

  async assignReviewer(
    auditId: string,
    input: {
      reviewerId: string;
      reviewerName?: string;
      dueDate?: string | Date | null;
    },
  ) {
    const existing = await this.getAudit(auditId);
    if (existing.status === 'closed' || existing.status === 'cancelled') {
      throw new BadRequestError('Cannot assign closed/cancelled audit');
    }
    if (!input.reviewerId) throw new BadRequestError('reviewerId required');

    const audit = await prisma.evaluationAudit.update({
      where: { id: auditId },
      data: {
        reviewerId: input.reviewerId,
        reviewerName: input.reviewerName || existing.reviewerName,
        assignedAt: new Date(),
        dueDate: input.dueDate ? new Date(input.dueDate) : existing.dueDate,
        status:
          existing.status === 'draft' || existing.status === 'assigned'
            ? 'assigned'
            : existing.status,
      },
      include: auditInclude,
    });

    await notificationService.createNotification({
      orgId: audit.contractorId,
      userId: input.reviewerId,
      type: 'system_alert',
      title: 'Audit assigned',
      message: `You were assigned to review: ${audit.title}`,
      dedupeKey: `audit-assign-${audit.id}-${input.reviewerId}-${Date.now()}`,
      meta: { auditId: audit.id },
    });

    return audit;
  }

  async startReview(auditId: string, reviewerId?: string) {
    const existing = await this.getAudit(auditId);
    if (
      reviewerId &&
      existing.reviewerId &&
      existing.reviewerId !== reviewerId
    ) {
      throw new ForbiddenError('Only assigned reviewer can start');
    }
    if (existing.status === 'scored' || existing.status === 'closed') {
      throw new BadRequestError('Audit already completed');
    }
    return prisma.evaluationAudit.update({
      where: { id: auditId },
      data: {
        status: 'in_review',
        startedAt: existing.startedAt || new Date(),
      },
      include: auditInclude,
    });
  }

  async saveResponses(
    auditId: string,
    answers: ScoreAnswer[],
    opts?: { finalize?: boolean; reviewerId?: string },
  ) {
    const audit = await this.getAudit(auditId);
    if (audit.status === 'closed' || audit.status === 'cancelled') {
      throw new BadRequestError('Audit is locked');
    }
    if (
      opts?.reviewerId &&
      audit.reviewerId &&
      audit.reviewerId !== opts.reviewerId
    ) {
      throw new ForbiddenError('Only assigned reviewer can score');
    }

    for (const a of answers) {
      await prisma.auditResponse.upsert({
        where: {
          auditId_questionId: {
            auditId,
            questionId: a.questionId,
          },
        },
        create: {
          auditId,
          questionId: a.questionId,
          scoreValue: a.scoreValue ?? null,
          answerText: a.answerText ?? null,
          isNa: a.isNa ?? false,
        },
        update: {
          scoreValue: a.scoreValue ?? null,
          answerText: a.answerText ?? null,
          isNa: a.isNa ?? false,
        },
      });
    }

    const sections: ScoreSection[] = audit.template.sections.map((s) => ({
      id: s.id,
      weight: s.weight,
      questions: s.questions.map((q) => ({
        id: q.id,
        weight: q.weight,
        maxScore: q.maxScore,
        questionType: q.questionType,
        required: q.required,
      })),
    }));

    const allAnswers = await prisma.auditResponse.findMany({
      where: { auditId },
    });
    const scored = scoreAudit(
      sections,
      allAnswers.map((r) => ({
        questionId: r.questionId,
        scoreValue: r.scoreValue,
        answerText: r.answerText,
        isNa: r.isNa,
      })),
    );

    if (opts?.finalize) {
      if (!scored.complete) {
        throw new BadRequestError(
          `Missing answers: ${scored.missingQuestionIds.length} required question(s)`,
        );
      }
      return this.finalizeScore(auditId, scored);
    }

    return prisma.evaluationAudit.update({
      where: { id: auditId },
      data: {
        score: scored.overallScore,
        sectionScores: scored.sectionScores as unknown as Prisma.InputJsonValue,
        status:
          audit.status === 'draft' || audit.status === 'assigned'
            ? 'in_review'
            : audit.status,
        startedAt: audit.startedAt || new Date(),
      },
      include: auditInclude,
    });
  }

  private async finalizeScore(
    auditId: string,
    scored: ReturnType<typeof scoreAudit>,
  ) {
    const audit = await this.getAudit(auditId);
    const result = resultFromScore(scored.overallScore);
    const scoreInt =
      scored.overallScore != null ? Math.round(scored.overallScore) : null;

    const updated = await prisma.$transaction(async (tx) => {
      let directoryAuditId = audit.directoryAuditId;
      if (directoryAuditId) {
        await tx.contractorAudit.update({
          where: { id: directoryAuditId },
          data: {
            title: audit.title,
            auditor: audit.reviewerName || undefined,
            auditedAt: new Date(),
            result,
            score: scoreInt,
            findings: {
              overallScore: scored.overallScore,
              sections: scored.sectionScores,
              evaluationAuditId: auditId,
            },
          },
        });
      } else {
        const row = await tx.contractorAudit.create({
          data: {
            contractorId: audit.contractorId,
            title: audit.title,
            auditor: audit.reviewerName || undefined,
            auditedAt: new Date(),
            result,
            score: scoreInt,
            findings: {
              overallScore: scored.overallScore,
              sections: scored.sectionScores,
              evaluationAuditId: auditId,
            },
          },
        });
        directoryAuditId = row.id;
      }

      return tx.evaluationAudit.update({
        where: { id: auditId },
        data: {
          score: scored.overallScore,
          sectionScores: scored.sectionScores as unknown as Prisma.InputJsonValue,
          status: 'scored',
          completedAt: new Date(),
          directoryAuditId,
        },
        include: auditInclude,
      });
    });

    await contractorDirectoryService.recalculateCompliance(audit.contractorId);

    await notificationService.createNotification({
      orgId: audit.contractorId,
      type: 'scorecard_update',
      title: 'Audit scored',
      message: `${audit.title} scored ${scoreInt ?? '—'}/100 (${result}).`,
      dedupeKey: `audit-scored-${auditId}`,
      meta: { auditId, score: scoreInt, result },
    });

    return updated;
  }

  async closeAudit(auditId: string) {
    const audit = await this.getAudit(auditId);
    if (audit.status !== 'scored' && audit.status !== 'in_review') {
      throw new BadRequestError('Score audit before closing (or cancel)');
    }
    const updated = await prisma.evaluationAudit.update({
      where: { id: auditId },
      data: { status: 'closed' },
      include: auditInclude,
    });
    await contractorDirectoryService.recalculateCompliance(audit.contractorId);
    return updated;
  }

  // ── Findings & corrective actions ────────────────────────────────────────

  async addFinding(
    auditId: string,
    input: {
      title: string;
      description?: string;
      severity?: AuditFindingSeverity;
      questionId?: string;
    },
  ) {
    await this.getAudit(auditId);
    if (!input.title?.trim()) throw new BadRequestError('title required');
    return prisma.auditFinding.create({
      data: {
        auditId,
        title: input.title.trim(),
        description: input.description,
        severity: input.severity || 'minor',
        questionId: input.questionId,
      },
      include: { correctiveActions: true },
    });
  }

  async updateFinding(
    findingId: string,
    input: {
      title?: string;
      description?: string;
      severity?: AuditFindingSeverity;
      status?: AuditFindingStatus;
    },
  ) {
    const finding = await prisma.auditFinding.findUnique({
      where: { id: findingId },
    });
    if (!finding) throw new NotFoundError('Finding not found');
    return prisma.auditFinding.update({
      where: { id: findingId },
      data: {
        title: input.title?.trim(),
        description: input.description,
        severity: input.severity,
        status: input.status,
      },
      include: { correctiveActions: true },
    });
  }

  async addCorrectiveAction(
    auditId: string,
    input: {
      title: string;
      description?: string;
      findingId?: string;
      ownerName?: string;
      ownerId?: string;
      dueDate?: string | Date | null;
    },
  ) {
    await this.getAudit(auditId);
    if (!input.title?.trim()) throw new BadRequestError('title required');
    return prisma.correctiveAction.create({
      data: {
        auditId,
        findingId: input.findingId,
        title: input.title.trim(),
        description: input.description,
        ownerName: input.ownerName,
        ownerId: input.ownerId,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      },
    });
  }

  async updateCorrectiveAction(
    actionId: string,
    input: {
      title?: string;
      description?: string;
      ownerName?: string;
      status?: CorrectiveActionStatus;
      dueDate?: string | Date | null;
      evidenceUrl?: string;
    },
  ) {
    const action = await prisma.correctiveAction.findUnique({
      where: { id: actionId },
    });
    if (!action) throw new NotFoundError('Corrective action not found');

    const status = input.status ?? action.status;
    return prisma.correctiveAction.update({
      where: { id: actionId },
      data: {
        title: input.title?.trim(),
        description: input.description,
        ownerName: input.ownerName,
        status,
        dueDate:
          input.dueDate !== undefined
            ? input.dueDate
              ? new Date(input.dueDate)
              : null
            : undefined,
        evidenceUrl: input.evidenceUrl,
        completedAt:
          status === 'completed' ? action.completedAt || new Date() : null,
      },
    });
  }

  async listCorrectiveActions(contractorId: string, opts?: {
    status?: CorrectiveActionStatus;
  }) {
    await this.assertProfile(contractorId);
    return prisma.correctiveAction.findMany({
      where: {
        audit: { contractorId },
        status: opts?.status,
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        finding: true,
        audit: { select: { id: true, title: true, status: true } },
      },
    });
  }
}

export const auditEvaluationService = new AuditEvaluationService();
