import type {
  ContractorConnectionStatus,
  ContractorDocumentKind,
  ContractorDocumentStatus,
  ContractorAuditResult,
  InsuranceStatus,
  Prisma,
} from '@prisma/client';
import { prisma } from '../db/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { auditService } from './audit.service';
import {
  calculateContractorCompliance,
  deriveInsuranceStatus,
  safetyRatingFromCompliance,
} from '../compliance/contractor-directory-score';

export type ContactInfo = {
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  primaryContact?: string;
};

export type ContractorCreateInput = {
  contractorId: string;
  legalName: string;
  tradeName?: string;
  contactInfo?: ContactInfo;
  industry?: string;
  region?: string;
  isListed?: boolean;
  notes?: string;
};

export type ContractorUpdateInput = Partial<{
  legalName: string;
  tradeName: string | null;
  contactInfo: ContactInfo;
  industry: string | null;
  region: string | null;
  isListed: boolean;
  notes: string | null;
  insuranceStatus: InsuranceStatus;
}>;

export type DirectoryListQuery = {
  q?: string;
  insuranceStatus?: InsuranceStatus;
  minCompliance?: number;
  region?: string;
  connectionStatus?: ContractorConnectionStatus;
  hiringClientId?: string;
  skip?: number;
  take?: number;
};

/**
 * Contractor Directory — CRUD, connections, compliance scoring.
 * contractor_id = Organization.id (contractor tenant).
 */
export class ContractorDirectoryService {
  async ensureOrg(contractorId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: contractorId },
      select: { id: true, name: true, status: true, contactEmail: true, contactPhone: true, address: true, industry: true },
    });
    if (!org || org.status === 'closed') {
      throw new NotFoundError('Contractor organization not found');
    }
    return org;
  }

  async create(input: ContractorCreateInput, actorId?: string) {
    const org = await this.ensureOrg(input.contractorId);
    const existing = await prisma.contractorProfile.findUnique({
      where: { contractorId: input.contractorId },
    });
    if (existing) throw new BadRequestError('Contractor profile already exists');

    const contactInfo: ContactInfo = {
      email: org.contactEmail ?? undefined,
      phone: org.contactPhone ?? undefined,
      address: org.address ?? undefined,
      ...input.contactInfo,
    };

    const profile = await prisma.contractorProfile.create({
      data: {
        contractorId: input.contractorId,
        legalName: input.legalName || org.name,
        tradeName: input.tradeName,
        contactInfo: contactInfo as Prisma.InputJsonValue,
        industry: input.industry ?? org.industry,
        region: input.region,
        isListed: input.isListed ?? true,
        notes: input.notes,
      },
    });

    await this.recalculateCompliance(input.contractorId);

    if (actorId) {
      await auditService.log({
        action: 'contractor.directory.create',
        orgId: input.contractorId,
        actorId,
        meta: { profileId: profile.id },
      });
    }

    return this.getById(input.contractorId);
  }

  async update(contractorId: string, input: ContractorUpdateInput, actorId?: string) {
    await this.ensureProfile(contractorId);
    await prisma.contractorProfile.update({
      where: { contractorId },
      data: {
        legalName: input.legalName,
        tradeName: input.tradeName === undefined ? undefined : input.tradeName,
        contactInfo:
          input.contactInfo === undefined
            ? undefined
            : (input.contactInfo as Prisma.InputJsonValue),
        industry: input.industry === undefined ? undefined : input.industry,
        region: input.region === undefined ? undefined : input.region,
        isListed: input.isListed,
        notes: input.notes === undefined ? undefined : input.notes,
        insuranceStatus: input.insuranceStatus,
      },
    });
    await this.recalculateCompliance(contractorId);
    if (actorId) {
      await auditService.log({
        action: 'contractor.directory.update',
        orgId: contractorId,
        actorId,
        meta: input as Record<string, unknown>,
      });
    }
    return this.getById(contractorId);
  }

  async delete(contractorId: string, actorId?: string) {
    await this.ensureProfile(contractorId);
    await prisma.contractorProfile.delete({ where: { contractorId } });
    if (actorId) {
      await auditService.log({
        action: 'contractor.directory.delete',
        orgId: contractorId,
        actorId,
      });
    }
    return { deleted: true, contractorId };
  }

  async ensureProfile(contractorId: string) {
    const profile = await prisma.contractorProfile.findUnique({
      where: { contractorId },
    });
    if (!profile) throw new NotFoundError('Contractor profile not found');
    return profile;
  }

  async getById(contractorId: string, opts?: { hiringClientId?: string }) {
    const profile = await prisma.contractorProfile.findUnique({
      where: { contractorId },
      include: {
        documents: { orderBy: { updatedAt: 'desc' } },
        audits: { orderBy: { auditedAt: 'desc' } },
        sites: { orderBy: { name: 'asc' } },
        programVerifications: true,
        organization: {
          select: { id: true, name: true, slug: true, status: true },
        },
      },
    });
    if (!profile) throw new NotFoundError('Contractor profile not found');

    let connection: {
      id: string;
      status: ContractorConnectionStatus;
      message: string | null;
      respondedAt: Date | null;
    } | null = null;

    if (opts?.hiringClientId) {
      connection = await prisma.contractorConnection.findUnique({
        where: {
          hiringClientId_contractorId: {
            hiringClientId: opts.hiringClientId,
            contractorId,
          },
        },
        select: {
          id: true,
          status: true,
          message: true,
          respondedAt: true,
        },
      });
    }

    return this.toDto(profile, connection);
  }

  async list(query: DirectoryListQuery = {}) {
    const skip = query.skip ?? 0;
    const take = Math.min(query.take ?? 20, 100);

    const where: Prisma.ContractorProfileWhereInput = {
      isListed: true,
      organization: { status: 'active' },
    };

    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        { legalName: { contains: q, mode: 'insensitive' } },
        { tradeName: { contains: q, mode: 'insensitive' } },
        { industry: { contains: q, mode: 'insensitive' } },
        { region: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (query.insuranceStatus) where.insuranceStatus = query.insuranceStatus;
    if (query.region) where.region = { contains: query.region, mode: 'insensitive' };
    if (query.minCompliance != null) {
      where.complianceScore = { gte: query.minCompliance };
    }
    if (query.hiringClientId && query.connectionStatus) {
      where.connections = {
        some: {
          hiringClientId: query.hiringClientId,
          status: query.connectionStatus,
        },
      };
    }

    const [rows, total] = await Promise.all([
      prisma.contractorProfile.findMany({
        where,
        orderBy: [{ complianceScore: 'desc' }, { legalName: 'asc' }],
        skip,
        take,
        include: {
          organization: {
            select: { id: true, name: true, slug: true, status: true },
          },
          connections: query.hiringClientId
            ? {
                where: { hiringClientId: query.hiringClientId },
                take: 1,
                select: {
                  id: true,
                  status: true,
                  message: true,
                  respondedAt: true,
                },
              }
            : false,
        },
      }),
      prisma.contractorProfile.count({ where }),
    ]);

    return {
      items: rows.map((row) => {
        const conn = Array.isArray(row.connections) ? row.connections[0] : null;
        return this.toListItem(row, conn ?? null);
      }),
      total,
      skip,
      take,
      page: Math.floor(skip / take) + 1,
      pageCount: Math.max(1, Math.ceil(total / take)),
    };
  }

  async recalculateCompliance(contractorId: string) {
    const [docs, audits, profile, centerDocs, evalAudits, pvsPrograms] =
      await Promise.all([
        prisma.contractorDocument.findMany({ where: { contractorId } }),
        prisma.contractorAudit.findMany({ where: { contractorId } }),
        prisma.contractorProfile.findUnique({ where: { contractorId } }),
        prisma.documentCenterDocument.findMany({ where: { contractorId } }),
        prisma.evaluationAudit.findMany({
          where: {
            contractorId,
            status: { in: ['scored', 'closed'] },
            score: { not: null },
          },
        }),
        prisma.programVerification.findMany({ where: { contractorId } }),
      ]);
    if (!profile) return null;

    // Prefer Document Center rows when present (synced + authoritative).
    const scoringDocs =
      centerDocs.length > 0
        ? centerDocs.map((d) => ({
            status: (d.exemptionFlag
              ? 'valid'
              : d.status === 'expiring'
                ? 'valid'
                : d.status === 'exempt'
                  ? 'valid'
                  : d.status === 'expired'
                    ? 'expired'
                    : d.status === 'rejected'
                      ? 'rejected'
                      : d.status === 'missing'
                        ? 'missing'
                        : 'pending_review') as
              | 'valid'
              | 'expired'
              | 'pending_review'
              | 'rejected'
              | 'missing',
            kind:
              d.category === 'insurance'
                ? 'insurance'
                : d.category === 'license'
                  ? 'license'
                  : 'other',
            expiryDate: d.expiryDate,
          }))
        : docs;

    const insuranceFromCenter = centerDocs
      .filter((d) => d.category === 'insurance')
      .map((d) => ({
        kind: 'insurance',
        status: (d.exemptionFlag
          ? 'valid'
          : d.status === 'expired'
            ? 'expired'
            : d.status === 'valid' || d.status === 'expiring' || d.status === 'exempt'
              ? 'valid'
              : 'pending_review') as
          | 'valid'
          | 'expired'
          | 'pending_review'
          | 'rejected'
          | 'missing',
        expiryDate: d.expiryDate,
      }));

    // Prefer Evaluation Audits (mirrored to ContractorAudit) when present.
    const scoringAudits =
      evalAudits.length > 0
        ? evalAudits.map((a) => {
            const score = a.score != null ? Math.round(a.score) : null;
            const result =
              score == null
                ? ('pending' as const)
                : score >= 80
                  ? ('pass' as const)
                  : score >= 60
                    ? ('conditional' as const)
                    : ('fail' as const);
            return { result, score };
          })
        : audits;

    const breakdown = calculateContractorCompliance({
      documents: scoringDocs,
      audits: scoringAudits,
      insuranceStatus: deriveInsuranceStatus(
        insuranceFromCenter.length ? insuranceFromCenter : docs,
      ),
      pvsPrograms: pvsPrograms.map((p) => ({
        programCategory: p.programCategory,
        verificationStatus: p.verificationStatus,
        exemptionFlag: p.exemptionFlag,
      })),
    });

    const updated = await prisma.contractorProfile.update({
      where: { contractorId },
      data: {
        complianceScore: breakdown.complianceScore,
        insuranceStatus: breakdown.insuranceStatus,
        safetyRating: safetyRatingFromCompliance(breakdown.complianceScore),
      },
    });

    return { profile: updated, breakdown };
  }

  // ── Documents / audits / sites ─────────────────────────────────────────────

  async addDocument(
    contractorId: string,
    input: {
      kind: ContractorDocumentKind;
      label?: string;
      fileUrl: string;
      expiryDate?: string | Date | null;
      status?: ContractorDocumentStatus;
    },
  ) {
    await this.ensureProfile(contractorId);
    const row = await prisma.contractorDocument.create({
      data: {
        contractorId,
        kind: input.kind,
        label: input.label,
        fileUrl: input.fileUrl,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
        status: input.status ?? 'pending_review',
      },
    });
    await this.recalculateCompliance(contractorId);
    return row;
  }

  async addAudit(
    contractorId: string,
    input: {
      title: string;
      auditor?: string;
      auditedAt: string | Date;
      result?: ContractorAuditResult;
      score?: number;
      findings?: unknown;
      reportUrl?: string;
    },
  ) {
    await this.ensureProfile(contractorId);
    const row = await prisma.contractorAudit.create({
      data: {
        contractorId,
        title: input.title,
        auditor: input.auditor,
        auditedAt: new Date(input.auditedAt),
        result: input.result ?? 'pending',
        score: input.score,
        findings: (input.findings ?? undefined) as Prisma.InputJsonValue | undefined,
        reportUrl: input.reportUrl,
      },
    });
    await this.recalculateCompliance(contractorId);
    return row;
  }

  async addSite(
    contractorId: string,
    input: { name: string; address?: string; region?: string; isActive?: boolean },
  ) {
    await this.ensureProfile(contractorId);
    return prisma.contractorSite.create({
      data: {
        contractorId,
        name: input.name,
        address: input.address,
        region: input.region,
        isActive: input.isActive ?? true,
      },
    });
  }

  // ── Connection workflow ──────────────────────────────────────────────────

  async requestConnection(input: {
    hiringClientId: string;
    contractorId: string;
    requestedByUserId: string;
    message?: string;
  }) {
    await this.ensureProfile(input.contractorId);
    try {
      const row = await prisma.contractorConnection.create({
        data: {
          hiringClientId: input.hiringClientId,
          contractorId: input.contractorId,
          status: 'pending',
          message: input.message,
          requestedByUserId: input.requestedByUserId,
        },
      });
      return row;
    } catch {
      const existing = await prisma.contractorConnection.findUnique({
        where: {
          hiringClientId_contractorId: {
            hiringClientId: input.hiringClientId,
            contractorId: input.contractorId,
          },
        },
      });
      if (!existing) throw new BadRequestError('Unable to create connection');
      if (existing.status === 'approved') {
        throw new BadRequestError('Already connected');
      }
      if (existing.status === 'pending') {
        throw new BadRequestError('Connection already pending');
      }
      return prisma.contractorConnection.update({
        where: { id: existing.id },
        data: {
          status: 'pending',
          message: input.message,
          requestedByUserId: input.requestedByUserId,
          responseMessage: null,
          respondedAt: null,
          respondedByUserId: null,
        },
      });
    }
  }

  async respondConnection(input: {
    connectionId: string;
    contractorId: string;
    actorUserId: string;
    decision: 'approved' | 'rejected';
    responseMessage?: string;
  }) {
    const row = await prisma.contractorConnection.findUnique({
      where: { id: input.connectionId },
    });
    if (!row || row.contractorId !== input.contractorId) {
      throw new NotFoundError('Connection not found');
    }
    if (row.status !== 'pending') {
      throw new BadRequestError(`Connection is already ${row.status}`);
    }
    return prisma.contractorConnection.update({
      where: { id: row.id },
      data: {
        status: input.decision,
        responseMessage: input.responseMessage,
        respondedByUserId: input.actorUserId,
        respondedAt: new Date(),
      },
    });
  }

  async listConnections(opts: {
    contractorId?: string;
    hiringClientId?: string;
    status?: ContractorConnectionStatus;
  }) {
    return prisma.contractorConnection.findMany({
      where: {
        contractorId: opts.contractorId,
        hiringClientId: opts.hiringClientId,
        status: opts.status,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        profile: {
          select: {
            legalName: true,
            tradeName: true,
            complianceScore: true,
            insuranceStatus: true,
            safetyRating: true,
          },
        },
        hiringClient: {
          select: { id: true, companyName: true, contactEmail: true },
        },
      },
      take: 100,
    });
  }

  assertContractorActor(orgId: string | undefined, contractorId: string) {
    if (!orgId || orgId !== contractorId) {
      throw new ForbiddenError('Contractor org access required');
    }
  }

  private toListItem(
    row: {
      contractorId: string;
      legalName: string;
      tradeName: string | null;
      safetyRating: number;
      insuranceStatus: InsuranceStatus;
      complianceScore: number;
      contactInfo: Prisma.JsonValue;
      industry: string | null;
      region: string | null;
      organization: { id: string; name: string; slug: string; status: string };
    },
    connection: {
      id: string;
      status: ContractorConnectionStatus;
      message: string | null;
      respondedAt: Date | null;
    } | null,
  ) {
    return {
      contractorId: row.contractorId,
      legalName: row.legalName,
      tradeName: row.tradeName,
      safetyRating: row.safetyRating,
      insuranceStatus: row.insuranceStatus,
      complianceScore: row.complianceScore,
      contactInfo: row.contactInfo,
      industry: row.industry,
      region: row.region,
      organization: row.organization,
      connectionStatus: connection?.status ?? null,
      connectionId: connection?.id ?? null,
    };
  }

  private toDto(
    profile: {
      id: string;
      contractorId: string;
      legalName: string;
      tradeName: string | null;
      safetyRating: number;
      insuranceStatus: InsuranceStatus;
      complianceScore: number;
      contactInfo: Prisma.JsonValue;
      industry: string | null;
      region: string | null;
      isListed: boolean;
      notes: string | null;
      createdAt: Date;
      updatedAt: Date;
      documents: unknown[];
      audits: unknown[];
      sites: unknown[];
      organization: { id: string; name: string; slug: string; status: string };
    },
    connection: {
      id: string;
      status: ContractorConnectionStatus;
      message: string | null;
      respondedAt: Date | null;
    } | null,
  ) {
    const breakdown = calculateContractorCompliance({
      documents: profile.documents as {
        status: ContractorDocumentStatus;
        kind: string;
        expiryDate?: Date | null;
      }[],
      audits: profile.audits as {
        result: ContractorAuditResult;
        score?: number | null;
      }[],
      insuranceStatus: profile.insuranceStatus,
      pvsPrograms: (
        (profile as { programVerifications?: {
          programCategory: string;
          verificationStatus: import('@prisma/client').PvsVerificationStatus;
          exemptionFlag: boolean;
        }[] }).programVerifications ?? []
      ).map((p) => ({
        programCategory: p.programCategory,
        verificationStatus: p.verificationStatus,
        exemptionFlag: p.exemptionFlag,
      })),
    });

    return {
      contractorId: profile.contractorId,
      legalName: profile.legalName,
      tradeName: profile.tradeName,
      safetyRating: profile.safetyRating,
      insuranceStatus: profile.insuranceStatus,
      complianceScore: profile.complianceScore,
      contactInfo: profile.contactInfo,
      industry: profile.industry,
      region: profile.region,
      isListed: profile.isListed,
      notes: profile.notes,
      documents: profile.documents,
      audits: profile.audits,
      sites: profile.sites,
      organization: profile.organization,
      complianceBreakdown: breakdown,
      connection: connection
        ? {
            id: connection.id,
            status: connection.status,
            message: connection.message,
            respondedAt: connection.respondedAt,
          }
        : null,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}

export const contractorDirectoryService = new ContractorDirectoryService();
