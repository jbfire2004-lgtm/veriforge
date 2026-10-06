import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogService } from '../../../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../../../audit/audit-actions';
import type {
  CreateOrientationDefinitionInput,
  OrientationContentBlock,
  UpdateOrientationDefinitionInput,
} from './orientation.types';
import {
  bumpMinorVersion,
  normalizeAndValidateBlocks,
} from './orientation-validation';

@Injectable()
export class OrientationDefinitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async create(input: CreateOrientationDefinitionInput) {
    if (!input.title?.trim()) {
      throw new BadRequestException('title is required');
    }
    const blocks = normalizeAndValidateBlocks(input.contentBlocks ?? []);
    const row = await this.prisma.orientationDefinition.create({
      data: {
        companyId: input.companyId,
        title: input.title.trim(),
        type: input.type,
        contentMode: input.contentMode ?? 'native',
        contentBlocks: blocks as unknown as Prisma.InputJsonValue,
        createdByUserId: input.createdByUserId,
        createdByType: input.createdByType ?? 'company',
        version: input.version ?? '1.0',
        isPublished: input.isPublished ?? false,
        expiryRules: (input.expiryRules ??
          {}) as unknown as Prisma.InputJsonValue,
        metadata: (input.metadata ?? {}) as unknown as Prisma.InputJsonValue,
        sourceFileKey: input.sourceFileKey,
        sourceCoreFileId: input.sourceCoreFileId,
      },
    });

    await this.auditLog.logAudit(
      { id: input.createdByUserId, companyId: input.companyId },
      AuditAction.ORIENTATION_DEFINITION_CREATED,
      {
        type: AuditEntityType.ORIENTATION_DEFINITION,
        id: row.id,
        tenantId: input.companyId,
      },
      { type: row.type, contentMode: row.contentMode },
    );

    return row;
  }

  async createFromUpload(input: {
    companyId: number;
    title: string;
    type: CreateOrientationDefinitionInput['type'];
    createdByUserId: number;
    sourceFileKey: string;
    sourceCoreFileId?: number;
    contentBlocks?: OrientationContentBlock[];
    metadata?: Record<string, unknown>;
  }) {
    return this.create({
      companyId: input.companyId,
      title: input.title,
      type: input.type,
      contentMode: 'uploaded',
      contentBlocks: input.contentBlocks ?? [
        {
          id: 'upload-1',
          type: 'slide',
          title: input.title,
          body: 'Uploaded orientation material. Review and acknowledge.',
          order: 0,
        },
      ],
      createdByUserId: input.createdByUserId,
      createdByType: 'company',
      sourceFileKey: input.sourceFileKey,
      sourceCoreFileId: input.sourceCoreFileId,
      metadata: {
        ...(input.metadata ?? {}),
        sourceFileId: input.sourceFileKey,
      },
    });
  }

  async get(id: string, opts?: { companyId?: number }) {
    const row = await this.prisma.orientationDefinition.findUnique({
      where: { id },
      include: {
        requirements: { where: { isActive: true }, take: 50 },
      },
    });
    if (!row) throw new NotFoundException('Orientation definition not found');
    if (opts?.companyId != null && row.companyId !== opts.companyId) {
      throw new ForbiddenException('Cross-tenant orientation access denied');
    }
    return row;
  }

  async list(filters: {
    companyId: number;
    projectId?: number;
    type?: CreateOrientationDefinitionInput['type'];
    isPublished?: boolean;
  }) {
    const where: Prisma.OrientationDefinitionWhereInput = {
      companyId: filters.companyId,
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.isPublished != null
        ? { isPublished: filters.isPublished }
        : {}),
      ...(filters.projectId
        ? {
            OR: [
              { type: 'company' },
              {
                requirements: {
                  some: {
                    projectId: filters.projectId,
                    isActive: true,
                  },
                },
              },
            ],
          }
        : {}),
    };

    return this.prisma.orientationDefinition.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });
  }

  async update(
    id: string,
    input: UpdateOrientationDefinitionInput,
    actor: { id: number; companyId?: number },
  ) {
    const existing = await this.get(id, {
      companyId: actor.companyId,
    });
    const contentChanged = input.contentBlocks != null;
    const shouldBump =
      input.bumpVersion === true
        ? true
        : input.bumpVersion === false
          ? false
          : contentChanged;
    const nextVersion = shouldBump
      ? bumpMinorVersion(existing.version)
      : existing.version;

    const row = await this.prisma.orientationDefinition.update({
      where: { id },
      data: {
        ...(input.title != null ? { title: input.title.trim() } : {}),
        ...(input.type != null ? { type: input.type } : {}),
        ...(input.contentMode != null ? { contentMode: input.contentMode } : {}),
        ...(input.contentBlocks != null
          ? {
              contentBlocks: normalizeAndValidateBlocks(
                input.contentBlocks,
              ) as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(input.isPublished != null ? { isPublished: input.isPublished } : {}),
        ...(input.expiryRules != null
          ? {
              expiryRules:
                input.expiryRules as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(input.metadata != null
          ? {
              metadata: {
                ...((existing.metadata as object) ?? {}),
                ...input.metadata,
              } as Prisma.InputJsonValue,
            }
          : {}),
        version: nextVersion,
      },
    });

    await this.auditLog.logAudit(
      { id: actor.id, companyId: actor.companyId ?? existing.companyId },
      AuditAction.ORIENTATION_DEFINITION_UPDATED,
      {
        type: AuditEntityType.ORIENTATION_DEFINITION,
        id: row.id,
        tenantId: existing.companyId,
      },
      {
        version: row.version,
        isPublished: row.isPublished,
        contentChanged,
      },
    );

    return row;
  }
}
