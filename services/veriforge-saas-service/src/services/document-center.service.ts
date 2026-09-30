import type {
  DocumentCategory,
  DocumentCenterStatus,
  Prisma,
} from '@prisma/client';
import { prisma } from '../db/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { documentStorageService } from './document-storage.service';
import { contractorDirectoryService } from './contractor-directory.service';
import { notificationService } from './notification.service';
import {
  DOCUMENT_CATEGORY_RULES,
  DOCUMENT_CATEGORIES,
  deriveStatusFromExpiry,
  getCategoryRule,
  isMimeAllowed,
  toDirectoryDocStatus,
} from '../document-center/category-rules';

export type UploadDocumentInput = {
  contractorId: string;
  category: DocumentCategory;
  title: string;
  expiryDate?: string | Date | null;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  uploadedById?: string;
  changeNote?: string;
  /** Or pass an already-hosted URL (skip binary storage) */
  fileUrl?: string;
};

/**
 * Document Center workflows: upload, replace, expire, exempt + dashboard.
 */
export class DocumentCenterService {
  listCategoryRules() {
    return DOCUMENT_CATEGORIES.map((c) => DOCUMENT_CATEGORY_RULES[c]);
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
    category?: DocumentCategory;
    status?: DocumentCenterStatus;
    skip?: number;
    take?: number;
  }) {
    await this.assertProfile(contractorId);
    const skip = opts?.skip ?? 0;
    const take = Math.min(opts?.take ?? 50, 100);
    const where: Prisma.DocumentCenterDocumentWhereInput = {
      contractorId,
      category: opts?.category,
      status: opts?.status,
    };
    const [items, total] = await Promise.all([
      prisma.documentCenterDocument.findMany({
        where,
        orderBy: [{ category: 'asc' }, { updatedAt: 'desc' }],
        skip,
        take,
        include: {
          versions: {
            orderBy: { version: 'desc' },
            take: 5,
          },
        },
      }),
      prisma.documentCenterDocument.count({ where }),
    ]);
    return { items, total, skip, take, rules: this.listCategoryRules() };
  }

  async get(documentId: string, contractorId?: string) {
    const doc = await prisma.documentCenterDocument.findUnique({
      where: { id: documentId },
      include: {
        versions: { orderBy: { version: 'desc' } },
      },
    });
    if (!doc) throw new NotFoundError('Document not found');
    if (contractorId && doc.contractorId !== contractorId) {
      throw new ForbiddenError('Document belongs to another contractor');
    }
    return doc;
  }

  async dashboard(contractorId: string) {
    await this.assertProfile(contractorId);
    const docs = await prisma.documentCenterDocument.findMany({
      where: { contractorId },
    });
    const byCategory = DOCUMENT_CATEGORIES.map((category) => {
      const rule = getCategoryRule(category);
      const items = docs.filter((d) => d.category === category);
      const hasValid = items.some(
        (d) =>
          d.exemptionFlag ||
          d.status === 'valid' ||
          d.status === 'expiring' ||
          d.status === 'exempt',
      );
      return {
        category,
        label: rule.label,
        required: rule.required,
        count: items.length,
        satisfied: hasValid || (!rule.required && items.length === 0),
        expiring: items.filter((d) => d.status === 'expiring').length,
        expired: items.filter((d) => d.status === 'expired').length,
        exempt: items.filter((d) => d.exemptionFlag).length,
      };
    });

    return {
      contractorId,
      totals: {
        documents: docs.length,
        expiring: docs.filter((d) => d.status === 'expiring').length,
        expired: docs.filter((d) => d.status === 'expired').length,
        exempt: docs.filter((d) => d.exemptionFlag).length,
        pending: docs.filter((d) => d.status === 'pending_review').length,
      },
      byCategory,
      indicators: {
        hasExpiring: byCategory.some((c) => c.expiring > 0),
        hasExpired: byCategory.some((c) => c.expired > 0),
        missingRequired: byCategory.filter((c) => c.required && !c.satisfied)
          .map((c) => c.category),
      },
    };
  }

  async upload(input: UploadDocumentInput) {
    await this.assertProfile(input.contractorId);
    const rule = getCategoryRule(input.category);

    if (input.buffer.length > rule.maxBytes) {
      throw new BadRequestError(
        `File exceeds max size for ${rule.label} (${rule.maxBytes} bytes)`,
      );
    }
    if (input.buffer.length > 0 && !isMimeAllowed(input.category, input.mimeType)) {
      throw new BadRequestError(
        `MIME ${input.mimeType} not allowed for ${rule.label}`,
      );
    }

    let stored = {
      fileUrl: input.fileUrl || '',
      storageKey: undefined as string | undefined,
      storageProvider: undefined as string | undefined,
      mimeType: input.mimeType,
      sizeBytes: input.buffer.length,
      fileName: input.fileName,
    };

    if (!input.fileUrl) {
      if (!input.buffer.length) {
        throw new BadRequestError('file or fileUrl required');
      }
      const obj = await documentStorageService.store({
        contractorId: input.contractorId,
        category: input.category,
        fileName: input.fileName,
        mimeType: input.mimeType,
        buffer: input.buffer,
      });
      stored = { ...obj };
    }

    const expiryDate = input.expiryDate ? new Date(input.expiryDate) : null;
    const derived =
      deriveStatusFromExpiry(expiryDate, rule.expiryWarningDays) ??
      'pending_review';

    const doc = await prisma.documentCenterDocument.create({
      data: {
        contractorId: input.contractorId,
        category: input.category,
        title: input.title,
        expiryDate,
        status: derived,
        currentVersion: 1,
        fileUrl: stored.fileUrl,
        storageKey: stored.storageKey,
        storageProvider: stored.storageProvider,
        versions: {
          create: {
            version: 1,
            fileUrl: stored.fileUrl,
            storageKey: stored.storageKey,
            fileName: stored.fileName,
            mimeType: stored.mimeType,
            sizeBytes: stored.sizeBytes,
            uploadedById: input.uploadedById,
            changeNote: input.changeNote || 'Initial upload',
          },
        },
      },
      include: { versions: true },
    });

    await this.syncDirectoryDocument(doc);
    await contractorDirectoryService.recalculateCompliance(input.contractorId);
    return doc;
  }

  async replace(
    documentId: string,
    input: {
      contractorId: string;
      fileName: string;
      mimeType: string;
      buffer: Buffer;
      uploadedById?: string;
      changeNote?: string;
      expiryDate?: string | Date | null;
      fileUrl?: string;
      title?: string;
    },
  ) {
    const existing = await this.get(documentId, input.contractorId);
    const rule = getCategoryRule(existing.category);

    if (input.buffer.length > 0 && input.buffer.length > rule.maxBytes) {
      throw new BadRequestError(`File exceeds max size (${rule.maxBytes})`);
    }
    if (input.buffer.length > 0 && !isMimeAllowed(existing.category, input.mimeType)) {
      throw new BadRequestError(`MIME not allowed for ${rule.label}`);
    }

    let fileUrl = input.fileUrl || '';
    let storageKey: string | undefined;
    let storageProvider: string | undefined;
    let sizeBytes = input.buffer.length;

    if (!fileUrl) {
      const obj = await documentStorageService.store({
        contractorId: input.contractorId,
        category: existing.category,
        fileName: input.fileName,
        mimeType: input.mimeType,
        buffer: input.buffer,
      });
      fileUrl = obj.fileUrl;
      storageKey = obj.storageKey;
      storageProvider = obj.storageProvider;
      sizeBytes = obj.sizeBytes ?? sizeBytes;
    }

    const nextVersion = existing.currentVersion + 1;
    const expiryDate =
      input.expiryDate !== undefined
        ? input.expiryDate
          ? new Date(input.expiryDate)
          : null
        : existing.expiryDate;

    const status =
      existing.exemptionFlag
        ? 'exempt'
        : deriveStatusFromExpiry(expiryDate, rule.expiryWarningDays) ??
          'pending_review';

    const doc = await prisma.$transaction(async (tx) => {
      await tx.documentVersion.create({
        data: {
          documentId,
          version: nextVersion,
          fileUrl,
          storageKey,
          fileName: input.fileName,
          mimeType: input.mimeType,
          sizeBytes,
          uploadedById: input.uploadedById,
          changeNote: input.changeNote || `Replace v${nextVersion}`,
        },
      });
      return tx.documentCenterDocument.update({
        where: { id: documentId },
        data: {
          title: input.title ?? existing.title,
          expiryDate,
          status,
          currentVersion: nextVersion,
          fileUrl,
          storageKey: storageKey ?? existing.storageKey,
          storageProvider: storageProvider ?? existing.storageProvider,
          exemptionFlag: false,
          exemptionReason: null,
          exemptionExpiresAt: null,
        },
        include: { versions: { orderBy: { version: 'desc' } } },
      });
    });

    await this.syncDirectoryDocument(doc);
    await contractorDirectoryService.recalculateCompliance(input.contractorId);
    return doc;
  }

  async expire(documentId: string, contractorId: string) {
    const existing = await this.get(documentId, contractorId);
    if (existing.exemptionFlag) {
      throw new BadRequestError('Clear exemption before forcing expire');
    }
    const doc = await prisma.documentCenterDocument.update({
      where: { id: documentId },
      data: { status: 'expired' },
      include: { versions: { orderBy: { version: 'desc' }, take: 5 } },
    });
    await this.syncDirectoryDocument(doc);
    await contractorDirectoryService.recalculateCompliance(contractorId);
    return doc;
  }

  async exempt(
    documentId: string,
    input: {
      contractorId: string;
      reason: string;
      exemptionExpiresAt?: string | Date | null;
    },
  ) {
    await this.get(documentId, input.contractorId);
    if (!input.reason?.trim()) {
      throw new BadRequestError('exemption reason required');
    }
    const doc = await prisma.documentCenterDocument.update({
      where: { id: documentId },
      data: {
        exemptionFlag: true,
        exemptionReason: input.reason.trim(),
        exemptionExpiresAt: input.exemptionExpiresAt
          ? new Date(input.exemptionExpiresAt)
          : null,
        status: 'exempt',
      },
      include: { versions: { orderBy: { version: 'desc' }, take: 5 } },
    });
    await this.syncDirectoryDocument(doc);
    await contractorDirectoryService.recalculateCompliance(input.contractorId);
    return doc;
  }

  async clearExemption(documentId: string, contractorId: string) {
    const existing = await this.get(documentId, contractorId);
    const rule = getCategoryRule(existing.category);
    const status =
      deriveStatusFromExpiry(existing.expiryDate, rule.expiryWarningDays) ??
      'pending_review';
    const doc = await prisma.documentCenterDocument.update({
      where: { id: documentId },
      data: {
        exemptionFlag: false,
        exemptionReason: null,
        exemptionExpiresAt: null,
        status,
      },
      include: { versions: { orderBy: { version: 'desc' }, take: 5 } },
    });
    await this.syncDirectoryDocument(doc);
    await contractorDirectoryService.recalculateCompliance(contractorId);
    return doc;
  }

  /**
   * Cron: mark expired / expiring, clear lapsed exemptions, notify.
   */
  async checkExpiries() {
    const now = new Date();
    const docs = await prisma.documentCenterDocument.findMany({
      where: {
        OR: [
          { expiryDate: { not: null } },
          { exemptionFlag: true },
        ],
      },
    });

    let expired = 0;
    let expiring = 0;
    let exemptionsCleared = 0;
    const orgIds = new Set<string>();

    for (const doc of docs) {
      const rule = getCategoryRule(doc.category);

      if (
        doc.exemptionFlag &&
        doc.exemptionExpiresAt &&
        doc.exemptionExpiresAt.getTime() < now.getTime()
      ) {
        const status =
          deriveStatusFromExpiry(doc.expiryDate, rule.expiryWarningDays) ??
          'pending_review';
        await prisma.documentCenterDocument.update({
          where: { id: doc.id },
          data: {
            exemptionFlag: false,
            exemptionReason: null,
            exemptionExpiresAt: null,
            status,
          },
        });
        exemptionsCleared += 1;
        orgIds.add(doc.contractorId);
        continue;
      }

      if (doc.exemptionFlag) continue;

      const next = deriveStatusFromExpiry(
        doc.expiryDate,
        rule.expiryWarningDays,
        now,
      );
      if (!next || next === doc.status) continue;
      if (next !== 'expired' && next !== 'expiring' && next !== 'valid') continue;

      await prisma.documentCenterDocument.update({
        where: { id: doc.id },
        data: { status: next },
      });
      orgIds.add(doc.contractorId);

      if (next === 'expired') {
        expired += 1;
        await notificationService.createNotification({
          orgId: doc.contractorId,
          type: 'compliance_expiry',
          title: 'Document expired',
          message: `${doc.title} (${doc.category}) has expired.`,
          dedupeKey: `doc-expired-${doc.id}`,
          meta: { documentId: doc.id, category: doc.category },
        });
      } else if (next === 'expiring') {
        expiring += 1;
        await notificationService.createNotification({
          orgId: doc.contractorId,
          type: 'compliance_expiry',
          title: 'Document expiring soon',
          message: `${doc.title} (${doc.category}) expires soon.`,
          dedupeKey: `doc-expiring-${doc.id}`,
          meta: { documentId: doc.id, category: doc.category },
        });
      }
    }

    for (const orgId of orgIds) {
      await contractorDirectoryService.recalculateCompliance(orgId);
    }

    return {
      expired,
      expiring,
      exemptionsCleared,
      orgsRecalculated: orgIds.size,
    };
  }

  /** Mirror into ContractorDocument so directory scoring stays in sync. */
  private async syncDirectoryDocument(doc: {
    id: string;
    contractorId: string;
    category: DocumentCategory;
    title: string;
    fileUrl: string | null;
    expiryDate: Date | null;
    status: DocumentCenterStatus;
    exemptionFlag: boolean;
  }) {
    if (!doc.fileUrl) return;

    const kind =
      doc.category === 'insurance'
        ? 'insurance'
        : doc.category === 'license'
          ? 'license'
          : doc.category === 'training'
            ? 'other'
            : 'other';

    const status = doc.exemptionFlag
      ? 'valid'
      : toDirectoryDocStatus(doc.status);

    const existing = await prisma.contractorDocument.findFirst({
      where: {
        contractorId: doc.contractorId,
        meta: { path: ['documentCenterId'], equals: doc.id },
      },
    });

    if (existing) {
      await prisma.contractorDocument.update({
        where: { id: existing.id },
        data: {
          kind: kind as 'insurance' | 'license' | 'other',
          label: doc.title,
          fileUrl: doc.fileUrl,
          expiryDate: doc.expiryDate,
          status,
          meta: {
            documentCenterId: doc.id,
            category: doc.category,
            exemptionFlag: doc.exemptionFlag,
          },
        },
      });
    } else {
      await prisma.contractorDocument.create({
        data: {
          contractorId: doc.contractorId,
          kind: kind as 'insurance' | 'license' | 'other',
          label: doc.title,
          fileUrl: doc.fileUrl,
          expiryDate: doc.expiryDate,
          status,
          meta: {
            documentCenterId: doc.id,
            category: doc.category,
            exemptionFlag: doc.exemptionFlag,
          },
        },
      });
    }
  }
}

export const documentCenterService = new DocumentCenterService();
