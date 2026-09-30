import type {
  Prisma,
  PvsElementStatus,
  PvsProgramCategory,
  PvsVerificationStatus,
} from '@prisma/client';
import { prisma } from '../db/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { contractorDirectoryService } from './contractor-directory.service';
import { notificationService } from './notification.service';
import { calculatePvsScore } from '../compliance/contractor-directory-score';
import {
  getProgramCategoryDef,
  PVS_CATEGORIES,
  PVS_SAFETY_MATRIX,
  requiredProgramCategories,
} from '../pvs/safety-matrix';

const pvsInclude = {
  elements: { orderBy: { sortOrder: 'asc' as const } },
};

function matrixSnapshot(
  elements: { elementKey: string; elementLabel: string; required: boolean; status: string; notes?: string | null }[],
) {
  return elements.map((e) => ({
    key: e.elementKey,
    label: e.elementLabel,
    required: e.required,
    status: e.status,
    notes: e.notes ?? null,
  }));
}

/**
 * Program Verification System — written programs, matrix, exemptions.
 */
export class ProgramVerificationService {
  listMatrixDefinitions() {
    return PVS_CATEGORIES.map((c) => PVS_SAFETY_MATRIX[c]);
  }

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

  async list(contractorId: string, opts?: {
    status?: PvsVerificationStatus;
  }) {
    await this.assertProfile(contractorId);
    const items = await prisma.programVerification.findMany({
      where: {
        contractorId,
        verificationStatus: opts?.status,
      },
      include: pvsInclude,
      orderBy: { programCategory: 'asc' },
    });
    return {
      items,
      matrixDefinitions: this.listMatrixDefinitions(),
      requiredCategories: requiredProgramCategories(),
    };
  }

  async get(pvsId: string, contractorId?: string) {
    const row = await prisma.programVerification.findUnique({
      where: { id: pvsId },
      include: pvsInclude,
    });
    if (!row) throw new NotFoundError('PVS program not found');
    if (contractorId && row.contractorId !== contractorId) {
      throw new ForbiddenError('Program belongs to another contractor');
    }
    return row;
  }

  async dashboard(contractorId: string) {
    await this.assertProfile(contractorId);
    const { items } = await this.list(contractorId);
    const required = requiredProgramCategories();
    const byCat = new Map(items.map((i) => [i.programCategory, i]));

    const coverage = required.map((category) => {
      const def = getProgramCategoryDef(category);
      const row = byCat.get(category);
      const satisfied =
        !!row &&
        (row.exemptionFlag ||
          row.verificationStatus === 'verified' ||
          row.verificationStatus === 'exempt');
      return {
        category,
        label: def.label,
        required: true,
        present: !!row,
        satisfied,
        status: row?.verificationStatus ?? 'missing',
        exemptionFlag: row?.exemptionFlag ?? false,
        pvsId: row?.id ?? null,
      };
    });

    const pvsScore = calculatePvsScore(
      items.map((i) => ({
        programCategory: i.programCategory,
        verificationStatus: i.verificationStatus,
        exemptionFlag: i.exemptionFlag,
      })),
    );

    return {
      contractorId,
      pvsScore,
      totals: {
        programs: items.length,
        verified: items.filter((i) => i.verificationStatus === 'verified').length,
        exempt: items.filter((i) => i.exemptionFlag).length,
        pendingExemption: items.filter(
          (i) => i.exemptionApprovalStatus === 'pending',
        ).length,
        inReview: items.filter((i) =>
          ['submitted', 'in_review'].includes(i.verificationStatus),
        ).length,
      },
      coverage,
      missingRequired: coverage.filter((c) => !c.satisfied).map((c) => c.category),
      indicators: {
        hasMissingRequired: coverage.some((c) => !c.satisfied),
        hasPendingExemption: items.some(
          (i) => i.exemptionApprovalStatus === 'pending',
        ),
        ready: coverage.every((c) => c.satisfied),
      },
    };
  }

  async create(input: {
    contractorId: string;
    programCategory: PvsProgramCategory;
    title?: string;
    programBody?: string;
    fileUrl?: string;
  }) {
    await this.assertProfile(input.contractorId);
    const def = getProgramCategoryDef(input.programCategory);

    const existing = await prisma.programVerification.findUnique({
      where: {
        contractorId_programCategory: {
          contractorId: input.contractorId,
          programCategory: input.programCategory,
        },
      },
    });
    if (existing) {
      throw new BadRequestError(
        `Program already exists for ${def.label} — update or verify instead`,
      );
    }

    const row = await prisma.programVerification.create({
      data: {
        contractorId: input.contractorId,
        programCategory: input.programCategory,
        title: input.title?.trim() || def.label,
        programBody: input.programBody,
        fileUrl: input.fileUrl,
        verificationStatus: 'draft',
        elements: {
          create: def.elements.map((e, i) => ({
            elementKey: e.key,
            elementLabel: e.label,
            required: e.required,
            status: 'pending',
            sortOrder: i,
          })),
        },
      },
      include: pvsInclude,
    });

    const updated = await this.syncMatrixJson(row.id);
    await contractorDirectoryService.recalculateCompliance(input.contractorId);
    return updated;
  }

  /** Ensure all required categories exist as draft/missing shells. */
  async ensureRequiredPrograms(contractorId: string) {
    await this.assertProfile(contractorId);
    const created: string[] = [];
    for (const category of requiredProgramCategories()) {
      const exists = await prisma.programVerification.findUnique({
        where: {
          contractorId_programCategory: { contractorId, programCategory: category },
        },
      });
      if (!exists) {
        const row = await this.create({ contractorId, programCategory: category });
        created.push(row.id);
      }
    }
    return { created };
  }

  async updateProgram(
    pvsId: string,
    input: {
      contractorId: string;
      title?: string;
      programBody?: string;
      fileUrl?: string;
    },
  ) {
    await this.get(pvsId, input.contractorId);
    const row = await prisma.programVerification.update({
      where: { id: pvsId },
      data: {
        title: input.title?.trim(),
        programBody: input.programBody,
        fileUrl: input.fileUrl,
        version: { increment: 1 },
      },
      include: pvsInclude,
    });
    return row;
  }

  async submitForReview(pvsId: string, contractorId: string) {
    const existing = await this.get(pvsId, contractorId);
    if (existing.exemptionFlag && existing.exemptionApprovalStatus === 'approved') {
      throw new BadRequestError('Program is exempt — clear exemption first');
    }
    const row = await prisma.programVerification.update({
      where: { id: pvsId },
      data: { verificationStatus: 'submitted' },
      include: pvsInclude,
    });
    await contractorDirectoryService.recalculateCompliance(contractorId);
    return row;
  }

  async assignReviewer(
    pvsId: string,
    input: { contractorId: string; reviewerId: string; reviewerName?: string },
  ) {
    await this.get(pvsId, input.contractorId);
    const row = await prisma.programVerification.update({
      where: { id: pvsId },
      data: {
        reviewerId: input.reviewerId,
        reviewerName: input.reviewerName,
        verificationStatus: 'in_review',
      },
      include: pvsInclude,
    });
    await notificationService.createNotification({
      orgId: input.contractorId,
      userId: input.reviewerId,
      type: 'system_alert',
      title: 'PVS review assigned',
      message: `Review written program: ${row.title}`,
      dedupeKey: `pvs-assign-${pvsId}-${input.reviewerId}`,
      meta: { pvsId },
    });
    await contractorDirectoryService.recalculateCompliance(input.contractorId);
    return row;
  }

  async updateMatrixElements(
    pvsId: string,
    contractorId: string,
    elements: { elementKey: string; status: PvsElementStatus; notes?: string }[],
  ) {
    await this.get(pvsId, contractorId);
    for (const el of elements) {
      await prisma.pvsMatrixElement.updateMany({
        where: { pvsId, elementKey: el.elementKey },
        data: {
          status: el.status,
          notes: el.notes,
        },
      });
    }
    return this.syncMatrixJson(pvsId);
  }

  async verify(
    pvsId: string,
    input: {
      contractorId: string;
      decision: 'verified' | 'rejected';
      notes?: string;
      reviewerId?: string;
      reviewerName?: string;
      elements?: { elementKey: string; status: PvsElementStatus; notes?: string }[];
    },
  ) {
    const existing = await this.get(pvsId, input.contractorId);
    if (existing.exemptionFlag && existing.exemptionApprovalStatus === 'approved') {
      throw new BadRequestError('Clear approved exemption before verifying');
    }

    if (input.elements?.length) {
      await this.updateMatrixElements(pvsId, input.contractorId, input.elements);
    }

    if (input.decision === 'verified') {
      const els = await prisma.pvsMatrixElement.findMany({ where: { pvsId } });
      const missingRequired = els.filter(
        (e) =>
          e.required &&
          e.status !== 'verified' &&
          e.status !== 'exempt' &&
          e.status !== 'na',
      );
      if (missingRequired.length) {
        throw new BadRequestError(
          `Required matrix elements not verified: ${missingRequired.map((e) => e.elementKey).join(', ')}`,
        );
      }
    }

    const row = await prisma.programVerification.update({
      where: { id: pvsId },
      data: {
        verificationStatus: input.decision,
        verificationNotes: input.notes,
        reviewerId: input.reviewerId ?? existing.reviewerId,
        reviewerName: input.reviewerName ?? existing.reviewerName,
        verifiedAt: input.decision === 'verified' ? new Date() : null,
      },
      include: pvsInclude,
    });

    await this.syncMatrixJson(pvsId);
    await contractorDirectoryService.recalculateCompliance(input.contractorId);

    await notificationService.createNotification({
      orgId: input.contractorId,
      type: 'compliance_expiry',
      title:
        input.decision === 'verified'
          ? 'Program verified'
          : 'Program verification rejected',
      message: `${row.title}: ${input.decision}`,
      dedupeKey: `pvs-verify-${pvsId}-${input.decision}`,
      meta: { pvsId, decision: input.decision },
    });

    return this.get(pvsId);
  }

  async requestExemption(
    pvsId: string,
    input: { contractorId: string; reason: string },
  ) {
    await this.get(pvsId, input.contractorId);
    if (!input.reason?.trim()) throw new BadRequestError('reason required');
    const row = await prisma.programVerification.update({
      where: { id: pvsId },
      data: {
        exemptionFlag: true,
        exemptionReason: input.reason.trim(),
        exemptionApprovalStatus: 'pending',
        exemptionReviewedAt: null,
        exemptionReviewedBy: null,
      },
      include: pvsInclude,
    });
    await contractorDirectoryService.recalculateCompliance(input.contractorId);
    return row;
  }

  async decideExemption(
    pvsId: string,
    input: {
      contractorId: string;
      decision: 'approved' | 'rejected';
      reviewedBy?: string;
    },
  ) {
    const existing = await this.get(pvsId, input.contractorId);
    if (existing.exemptionApprovalStatus !== 'pending') {
      throw new BadRequestError('No pending exemption request');
    }
    const approved = input.decision === 'approved';
    const row = await prisma.programVerification.update({
      where: { id: pvsId },
      data: {
        exemptionFlag: approved,
        exemptionApprovalStatus: input.decision,
        exemptionReviewedAt: new Date(),
        exemptionReviewedBy: input.reviewedBy,
        verificationStatus: approved ? 'exempt' : existing.verificationStatus === 'exempt'
          ? 'draft'
          : existing.verificationStatus,
      },
      include: pvsInclude,
    });
    await contractorDirectoryService.recalculateCompliance(input.contractorId);
    return row;
  }

  async clearExemption(pvsId: string, contractorId: string) {
    await this.get(pvsId, contractorId);
    const row = await prisma.programVerification.update({
      where: { id: pvsId },
      data: {
        exemptionFlag: false,
        exemptionReason: null,
        exemptionApprovalStatus: 'none',
        exemptionReviewedAt: null,
        exemptionReviewedBy: null,
        verificationStatus: 'draft',
      },
      include: pvsInclude,
    });
    await contractorDirectoryService.recalculateCompliance(contractorId);
    return row;
  }

  /** Analytics aggregate for dashboards. */
  async analytics(contractorId: string) {
    const dash = await this.dashboard(contractorId);
    const items = await prisma.programVerification.findMany({
      where: { contractorId },
      include: pvsInclude,
    });

    const elementStats = { total: 0, verified: 0, pending: 0, missing: 0 };
    for (const p of items) {
      for (const e of p.elements) {
        elementStats.total += 1;
        if (e.status === 'verified' || e.status === 'exempt' || e.status === 'na') {
          elementStats.verified += 1;
        } else if (e.status === 'missing') elementStats.missing += 1;
        else elementStats.pending += 1;
      }
    }

    return {
      ...dash,
      elementStats,
      byStatus: {
        draft: items.filter((i) => i.verificationStatus === 'draft').length,
        submitted: items.filter((i) => i.verificationStatus === 'submitted').length,
        in_review: items.filter((i) => i.verificationStatus === 'in_review').length,
        verified: items.filter((i) => i.verificationStatus === 'verified').length,
        rejected: items.filter((i) => i.verificationStatus === 'rejected').length,
        exempt: items.filter((i) => i.verificationStatus === 'exempt').length,
      },
    };
  }

  /** QuickCheck — compact pass/fail style signals. */
  async quickCheck(contractorId: string) {
    const dash = await this.dashboard(contractorId);
    const checks = dash.coverage.map((c) => ({
      id: `pvs:${c.category}`,
      label: c.label,
      ok: c.satisfied,
      detail: c.status,
    }));

    const openFindings = await prisma.auditFinding.count({
      where: {
        audit: { contractorId },
        status: 'open',
      },
    }).catch(() => 0);

    const docDash = await prisma.documentCenterDocument
      .groupBy({
        by: ['status'],
        where: { contractorId },
        _count: true,
      })
      .catch(() => [] as { status: string; _count: number }[]);

    const expiredDocs =
      docDash.find((d) => d.status === 'expired')?._count ?? 0;
    const expiringDocs =
      docDash.find((d) => d.status === 'expiring')?._count ?? 0;

    checks.push({
      id: 'docs:expired',
      label: 'No expired documents',
      ok: expiredDocs === 0,
      detail: expiredDocs ? `${expiredDocs} expired` : 'ok',
    });
    checks.push({
      id: 'docs:expiring',
      label: 'No documents expiring soon',
      ok: expiringDocs === 0,
      detail: expiringDocs ? `${expiringDocs} expiring` : 'ok',
    });
    checks.push({
      id: 'audits:open_findings',
      label: 'No open audit findings',
      ok: openFindings === 0,
      detail: openFindings ? `${openFindings} open` : 'ok',
    });

    const pass = checks.filter((c) => c.ok).length;
    return {
      contractorId,
      pvsScore: dash.pvsScore,
      passed: pass,
      total: checks.length,
      ready: checks.every((c) => c.ok),
      checks,
      generatedAt: new Date().toISOString(),
    };
  }

  private async syncMatrixJson(pvsId: string) {
    const row = await prisma.programVerification.findUnique({
      where: { id: pvsId },
      include: pvsInclude,
    });
    if (!row) throw new NotFoundError('PVS program not found');
    return prisma.programVerification.update({
      where: { id: pvsId },
      data: {
        safetyMatrix: matrixSnapshot(row.elements) as unknown as Prisma.InputJsonValue,
      },
      include: pvsInclude,
    });
  }
}

export const programVerificationService = new ProgramVerificationService();
