import { Injectable } from '@nestjs/common';
import { PmInspectionTemplateStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PmInspectionTemplatesService } from './pm-inspection-templates.service';
import { inspectionKind } from './pm-inspection-kind.util';

type TemplateRow = {
  id: string;
  name: string;
  category: string;
  status: string;
  version: number;
  description: string | null;
  scoringMode: string;
  scoringRules: unknown;
  items: unknown;
  equipmentTypeKeys: unknown;
  requiredSignatures: unknown;
};

@Injectable()
export class InspectionCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pmTemplates: PmInspectionTemplatesService,
  ) {}

  private mapTemplate(row: TemplateRow) {
    const scoringRules =
      row.scoringRules && typeof row.scoringRules === 'object'
        ? (row.scoringRules as Record<string, unknown>)
        : {};
    return {
      ...row,
      scoringRules,
      inspectionKind: inspectionKind({ name: row.name, scoringRules }),
      items: Array.isArray(row.items) ? row.items : [],
    };
  }

  async ensurePmLibrary(companyId: number, projectId?: number) {
    // Always run ensureDefaults — it is idempotent (creates missing system
    // templates by name). Skipping when any published row exists left new
    // focus-audit industries stranded after early seeds.
    return this.pmTemplates.ensureDefaults(companyId, projectId);
  }

  async listPmTemplates(
    companyId: number,
    projectId?: number,
    options?: {
      status?: PmInspectionTemplateStatus;
      kind?: string;
      autoSeed?: boolean;
    },
  ) {
    if (options?.autoSeed !== false) {
      await this.ensurePmLibrary(companyId, projectId);
    }

    const status = options?.status ?? 'published';
    const rows = await this.pmTemplates.list({
      companyId,
      projectId,
      status,
    });

    let mapped = rows.map((r) => this.mapTemplate(r as TemplateRow));
    if (options?.kind) {
      mapped = mapped.filter((t) => t.inspectionKind === options.kind);
    }

    const counts = {
      smart_site: mapped.filter((t) => t.inspectionKind === 'smart_site')
        .length,
      focus_audit: mapped.filter((t) => t.inspectionKind === 'focus_audit')
        .length,
      checklist: mapped.filter((t) => t.inspectionKind === 'checklist').length,
    };

    return { templates: mapped, counts };
  }

  async getSmartCatalog(companyId: number, projectId?: number) {
    const { templates, counts } = await this.listPmTemplates(
      companyId,
      projectId,
    );

    const categories = await this.prisma.systemCatalogEntry.findMany({
      where: {
        catalogType: 'smart_inspection_category',
        active: true,
      },
      orderBy: [{ name: 'asc' }],
    });

    const smartSiteTemplate =
      templates.find((t) => t.inspectionKind === 'smart_site') ?? null;
    const focusAudits = templates.filter(
      (t) => t.inspectionKind === 'focus_audit',
    );

    return {
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        version: c.version,
        ...(c.payload as Record<string, unknown>),
      })),
      smartSiteTemplate,
      focusAudits,
      counts,
      photoFirst: true,
    };
  }

  async listUnifiedChecklists(
    companyId: number,
    projectId?: number,
    filters?: {
      inspectionType?: string;
      category?: string;
      activeOnly?: boolean;
    },
  ) {
    const core = await this.prisma.inspectionChecklist.findMany({
      where: {
        inspectionType: filters?.inspectionType as never,
        category: filters?.category as never,
        active: filters?.activeOnly === false ? undefined : true,
      },
      orderBy: [{ inspectionType: 'asc' }, { name: 'asc' }],
    });

    const pmResult = await this.listPmTemplates(companyId, projectId, {
      kind: 'checklist',
    });

    return {
      core,
      pm: pmResult.templates,
      counts: {
        core: core.length,
        pm: pmResult.templates.length,
      },
    };
  }
}
