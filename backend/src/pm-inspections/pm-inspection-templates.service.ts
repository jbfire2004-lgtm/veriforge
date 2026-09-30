import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PmInspectionTemplateStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { ChecklistItemDef } from './pm-inspections.constants';
import { CHECKLIST_LIBRARY_TEMPLATES } from './pm-inspection-checklist-library.constants';
import {
  FOCUS_AUDIT_TEMPLATES,
  SMART_SITE_TEMPLATE,
  type SystemTemplateDef,
} from './pm-inspection-focus-audits.constants';
import { EXPANDED_FOCUS_AUDIT_TEMPLATES } from './pm-inspection-focus-audits-extra.constants';

const ALL_FOCUS_AUDIT_TEMPLATES: SystemTemplateDef[] = [
  ...FOCUS_AUDIT_TEMPLATES,
  ...EXPANDED_FOCUS_AUDIT_TEMPLATES,
];

const ALL_SYSTEM_TEMPLATES: SystemTemplateDef[] = [
  ...CHECKLIST_LIBRARY_TEMPLATES,
  SMART_SITE_TEMPLATE,
  ...ALL_FOCUS_AUDIT_TEMPLATES,
];
import {
  normalizeChecklistItems,
  validateChecklistItems,
  validateRequiredSignatures,
  validateScoringRules,
} from './pm-inspection-template.validation';
import { AuditLogService } from '../audit/audit-log.service';
import { AuditAction, AuditEntityType } from '../audit/audit-actions';

@Injectable()
export class PmInspectionTemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async ensureDefaults(companyId: number, _projectId?: number) {
    let created = 0;
    let updated = 0;

    for (const tpl of ALL_SYSTEM_TEMPLATES) {
      let exists = await this.prisma.pmInspectionTemplate.findFirst({
        where: {
          companyId,
          projectId: null,
          name: tpl.name,
          deletedAt: null,
        },
      });

      if (!exists) {
        const legacy = await this.prisma.pmInspectionTemplate.findFirst({
          where: {
            companyId,
            name: tpl.name,
            deletedAt: null,
            projectId: { not: null },
          },
        });
        if (legacy) {
          exists = await this.prisma.pmInspectionTemplate.update({
            where: { id: legacy.id },
            data: { projectId: null },
          });
        }
      }

      if (!exists) {
        await this.prisma.pmInspectionTemplate.create({
          data: {
            companyId,
            projectId: null,
            name: tpl.name,
            description: tpl.description,
            category: tpl.category,
            scoringMode: tpl.scoringMode,
            status: 'published',
            publishedAt: new Date(),
            items: tpl.items as unknown as Prisma.InputJsonValue,
            scoringRules: (tpl.scoringRules ?? {}) as Prisma.InputJsonValue,
            equipmentTypeKeys: (tpl.equipmentTypeKeys ??
              []) as Prisma.InputJsonValue,
          },
        });
        created += 1;
        continue;
      }

      const existingRules =
        exists.scoringRules && typeof exists.scoringRules === 'object'
          ? (exists.scoringRules as Record<string, unknown>)
          : {};
      const needsRules =
        tpl.scoringRules &&
        (!existingRules.inspectionKind ||
          JSON.stringify(existingRules) !== JSON.stringify(tpl.scoringRules));

      if (needsRules || (!exists.description && tpl.description)) {
        await this.prisma.pmInspectionTemplate.update({
          where: { id: exists.id },
          data: {
            ...(needsRules
              ? { scoringRules: tpl.scoringRules as Prisma.InputJsonValue }
              : {}),
            ...(tpl.description && !exists.description
              ? { description: tpl.description }
              : {}),
          },
        });
        updated += 1;
      }
    }

    return {
      created,
      updated,
      total: ALL_SYSTEM_TEMPLATES.length,
      checklistCount: CHECKLIST_LIBRARY_TEMPLATES.length,
      focusAuditCount: ALL_FOCUS_AUDIT_TEMPLATES.length,
    };
  }

  list(filters: {
    companyId: number;
    projectId?: number;
    category?: string;
    status?: PmInspectionTemplateStatus;
  }) {
    return this.prisma.pmInspectionTemplate.findMany({
      where: {
        companyId: filters.companyId,
        deletedAt: null,
        ...(filters.projectId != null
          ? { OR: [{ projectId: null }, { projectId: filters.projectId }] }
          : {}),
        ...(filters.category ? { category: filters.category as never } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async get(id: string) {
    const row = await this.prisma.pmInspectionTemplate.findFirst({
      where: { id, deletedAt: null },
    });
    if (!row) throw new NotFoundException('Template not found');
    return row;
  }

  private prepareTemplatePayload(data: {
    items: ChecklistItemDef[];
    scoringRules?: Record<string, unknown>;
    requiredSignatures?: unknown;
  }) {
    const items = normalizeChecklistItems(data.items);
    validateChecklistItems(items);
    const scoringRules = validateScoringRules(data.scoringRules);
    const requiredSignatures = validateRequiredSignatures(
      data.requiredSignatures,
    );
    return { items, scoringRules, requiredSignatures };
  }

  async create(data: {
    companyId: number;
    projectId?: number;
    name: string;
    category: string;
    description?: string;
    scoringMode?: string;
    items: ChecklistItemDef[];
    scoringRules?: Record<string, unknown>;
    requiredAttachments?: unknown[];
    requiredSignatures?: unknown[];
    equipmentTypeKeys?: string[];
    clientSyncId?: string;
  }) {
    const prepared = this.prepareTemplatePayload(data);
    const row = await this.prisma.pmInspectionTemplate.create({
      data: {
        companyId: data.companyId,
        projectId: data.projectId,
        name: data.name.trim(),
        category: data.category as never,
        description: data.description,
        scoringMode: (data.scoringMode ?? 'pass_fail') as never,
        items: prepared.items as unknown as Prisma.InputJsonValue,
        scoringRules: prepared.scoringRules as Prisma.InputJsonValue,
        requiredAttachments: (data.requiredAttachments ??
          []) as Prisma.InputJsonValue,
        requiredSignatures:
          prepared.requiredSignatures as Prisma.InputJsonValue,
        equipmentTypeKeys: (data.equipmentTypeKeys ??
          []) as Prisma.InputJsonValue,
        clientSyncId: data.clientSyncId,
        status: 'draft',
      },
    });
    await this.auditLog.logAudit(
      null,
      AuditAction.TEMPLATE_CREATED,
      {
        type: AuditEntityType.PM_INSPECTION_TEMPLATE,
        id: row.id,
        tenantId: data.companyId,
      },
      { name: row.name, category: row.category },
    );
    return row;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      scoringMode: string;
      items: ChecklistItemDef[];
      scoringRules: Record<string, unknown>;
      requiredAttachments: unknown[];
      requiredSignatures: unknown[];
    }>,
  ) {
    const tpl = await this.get(id);
    if (tpl.status === 'published') {
      throw new BadRequestException(
        'Published templates are immutable; create a new version',
      );
    }

    let items = tpl.items as ChecklistItemDef[];
    let scoringRules = tpl.scoringRules as Record<string, unknown>;
    let requiredSignatures = tpl.requiredSignatures;

    if (data.items) {
      const prepared = this.prepareTemplatePayload({
        items: data.items,
        scoringRules: data.scoringRules ?? scoringRules,
        requiredSignatures: data.requiredSignatures ?? requiredSignatures,
      });
      items = prepared.items;
      scoringRules = prepared.scoringRules;
      requiredSignatures =
        prepared.requiredSignatures as typeof requiredSignatures;
    } else if (data.scoringRules || data.requiredSignatures) {
      const prepared = this.prepareTemplatePayload({
        items,
        scoringRules: data.scoringRules ?? scoringRules,
        requiredSignatures: data.requiredSignatures ?? requiredSignatures,
      });
      scoringRules = prepared.scoringRules;
      requiredSignatures =
        prepared.requiredSignatures as typeof requiredSignatures;
    }

    const updated = await this.prisma.pmInspectionTemplate.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.scoringMode ? { scoringMode: data.scoringMode as never } : {}),
        ...(data.items || data.scoringRules || data.requiredSignatures
          ? {
              items: items as unknown as Prisma.InputJsonValue,
              scoringRules: scoringRules as Prisma.InputJsonValue,
              requiredSignatures: requiredSignatures as Prisma.InputJsonValue,
            }
          : {}),
        ...(data.requiredAttachments
          ? {
              requiredAttachments:
                data.requiredAttachments as Prisma.InputJsonValue,
            }
          : {}),
      },
    });
    await this.auditLog.logAudit(
      null,
      AuditAction.TEMPLATE_UPDATED,
      {
        type: AuditEntityType.PM_INSPECTION_TEMPLATE,
        id,
        tenantId: tpl.companyId,
      },
      { fields: Object.keys(data) },
    );
    return updated;
  }

  async publish(id: string, userId: number) {
    const tpl = await this.get(id);
    const items = tpl.items as ChecklistItemDef[];
    this.prepareTemplatePayload({
      items,
      scoringRules: tpl.scoringRules as Record<string, unknown>,
      requiredSignatures: tpl.requiredSignatures,
    });
    const published = await this.prisma.pmInspectionTemplate.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
        publishedByUserId: userId,
      },
    });
    await this.auditLog.logAudit(
      { id: userId, companyId: tpl.companyId },
      AuditAction.TEMPLATE_PUBLISHED,
      {
        type: AuditEntityType.PM_INSPECTION_TEMPLATE,
        id,
        tenantId: tpl.companyId,
      },
      { version: tpl.version },
    );
    return published;
  }

  async newVersion(id: string) {
    const parent = await this.get(id);
    return this.prisma.pmInspectionTemplate.create({
      data: {
        companyId: parent.companyId,
        projectId: parent.projectId,
        name: parent.name,
        category: parent.category,
        description: parent.description,
        version: parent.version + 1,
        scoringMode: parent.scoringMode,
        items: parent.items as Prisma.InputJsonValue,
        scoringRules: parent.scoringRules as Prisma.InputJsonValue,
        requiredAttachments:
          parent.requiredAttachments as Prisma.InputJsonValue,
        requiredSignatures: parent.requiredSignatures as Prisma.InputJsonValue,
        equipmentTypeKeys: parent.equipmentTypeKeys as Prisma.InputJsonValue,
        parentTemplateId: parent.id,
        status: 'draft',
      },
    });
  }

  async archive(id: string) {
    const tpl = await this.get(id);
    if (tpl.status === 'archived') {
      throw new BadRequestException('Template is already archived');
    }
    const archived = await this.prisma.pmInspectionTemplate.update({
      where: { id },
      data: { status: 'archived', deletedAt: new Date() },
    });
    await this.auditLog.logAudit(
      null,
      AuditAction.TEMPLATE_ARCHIVED,
      {
        type: AuditEntityType.PM_INSPECTION_TEMPLATE,
        id,
        tenantId: tpl.companyId,
      },
      {},
    );
    return archived;
  }
}
