/**
 * Idempotent Vera Core / PM catalog seeding.
 * Run via prisma/seed.ts after companies exist.
 */
import { createHash } from 'crypto';
import type { PrismaClient, Prisma } from '@prisma/client';
import { INSPECTION_TEMPLATE_SEEDS } from './data/inspection-templates';
import { INSPECTION_CHECKLIST_SEEDS } from './data/inspection-checklists';
import { SMART_INSPECTION_CATEGORY_SEEDS } from './data/smart-inspection-categories';
import { HAZARD_SEEDS } from './data/hazards';
import { CONTROL_SEEDS } from './data/controls';
import { PERMIT_TYPE_SEEDS } from './data/permit-types';
import { PM_INSPECTION_TEMPLATE_SEEDS } from './data/pm-inspection-templates';

export type VeraCatalogSeedResult = {
  inspectionTemplates: { created: number; updated: number; unchanged: number };
  inspectionChecklists: { created: number; updated: number; unchanged: number };
  smartCategories: { created: number; updated: number; unchanged: number };
  hazards: { created: number; updated: number; unchanged: number };
  controls: { created: number; updated: number; unchanged: number };
  permitTypes: { created: number; updated: number; unchanged: number };
  pmInspectionTemplates: { created: number; updated: number; unchanged: number };
};

function contentHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

type UpsertStats = { created: number; updated: number; unchanged: number };

function bump(stats: UpsertStats, result: 'created' | 'updated' | 'unchanged') {
  stats[result] += 1;
}

async function upsertSystemCatalog(
  prisma: PrismaClient,
  entry: {
    id: string;
    catalogType: string;
    name: string;
    description?: string;
    payload: Record<string, unknown>;
  },
  stats: UpsertStats,
) {
  const hash = contentHash(entry.payload);
  const payload = { ...entry.payload, contentHash: hash };
  const existing = await prisma.systemCatalogEntry.findUnique({ where: { id: entry.id } });

  if (!existing) {
    await prisma.systemCatalogEntry.create({
      data: {
        id: entry.id,
        catalogType: entry.catalogType,
        name: entry.name,
        description: entry.description,
        version: 1,
        payload: payload as Prisma.InputJsonValue,
      },
    });
    bump(stats, 'created');
    return;
  }

  const prevHash = (existing.payload as { contentHash?: string })?.contentHash;
  if (prevHash === hash) {
    bump(stats, 'unchanged');
    return;
  }

  await prisma.systemCatalogEntry.update({
    where: { id: entry.id },
    data: {
      name: entry.name,
      description: entry.description,
      version: existing.version + 1,
      payload: payload as Prisma.InputJsonValue,
    },
  });
  bump(stats, 'updated');
}

export async function seedVeraCatalog(
  prisma: PrismaClient,
  options: { companyIds: number[]; publisherUserId?: number },
): Promise<VeraCatalogSeedResult> {
  const result: VeraCatalogSeedResult = {
    inspectionTemplates: { created: 0, updated: 0, unchanged: 0 },
    inspectionChecklists: { created: 0, updated: 0, unchanged: 0 },
    smartCategories: { created: 0, updated: 0, unchanged: 0 },
    hazards: { created: 0, updated: 0, unchanged: 0 },
    controls: { created: 0, updated: 0, unchanged: 0 },
    permitTypes: { created: 0, updated: 0, unchanged: 0 },
    pmInspectionTemplates: { created: 0, updated: 0, unchanged: 0 },
  };

  for (const tpl of INSPECTION_TEMPLATE_SEEDS) {
    const body = { items: tpl.items };
    const hash = contentHash(body);
    const existing = await prisma.inspectionTemplate.findUnique({
      where: {
        catalogTypeKey_kind: {
          catalogTypeKey: tpl.catalogTypeKey,
          kind: tpl.kind,
        },
      },
    });

    if (!existing) {
      await prisma.inspectionTemplate.create({
        data: {
          catalogTypeKey: tpl.catalogTypeKey,
          catalogCategory: tpl.catalogCategory,
          kind: tpl.kind,
          items: tpl.items as Prisma.InputJsonValue,
          seedVersion: 1,
        },
      });
      bump(result.inspectionTemplates, 'created');
      continue;
    }

    const prevHash = contentHash({ items: existing.items });
    if (prevHash === hash) {
      bump(result.inspectionTemplates, 'unchanged');
      continue;
    }

    await prisma.inspectionTemplate.update({
      where: { id: existing.id },
      data: {
        items: tpl.items as Prisma.InputJsonValue,
        catalogCategory: tpl.catalogCategory,
        seedVersion: existing.seedVersion + 1,
      },
    });
    bump(result.inspectionTemplates, 'updated');
  }

  for (const cl of INSPECTION_CHECKLIST_SEEDS) {
    const body = {
      name: cl.name,
      category: cl.category,
      inspectionType: cl.inspectionType,
      items: cl.items,
      intervalDays: cl.intervalDays ?? null,
    };
    const hash = contentHash(body);
    const existing = await prisma.inspectionChecklist.findUnique({
      where: { seedKey: cl.seedKey },
    });

    if (!existing) {
      await prisma.inspectionChecklist.create({
        data: {
          seedKey: cl.seedKey,
          name: cl.name,
          category: cl.category,
          inspectionType: cl.inspectionType,
          items: cl.items as Prisma.InputJsonValue,
          intervalDays: cl.intervalDays,
          seedVersion: 1,
        },
      });
      bump(result.inspectionChecklists, 'created');
      continue;
    }

    const prevHash = contentHash({
      name: existing.name,
      category: existing.category,
      inspectionType: existing.inspectionType,
      items: existing.items,
      intervalDays: existing.intervalDays,
    });
    if (prevHash === hash) {
      bump(result.inspectionChecklists, 'unchanged');
      continue;
    }

    await prisma.inspectionChecklist.update({
      where: { id: existing.id },
      data: {
        name: cl.name,
        category: cl.category,
        inspectionType: cl.inspectionType,
        items: cl.items as Prisma.InputJsonValue,
        intervalDays: cl.intervalDays,
        seedVersion: existing.seedVersion + 1,
      },
    });
    bump(result.inspectionChecklists, 'updated');
  }

  for (const cat of SMART_INSPECTION_CATEGORY_SEEDS) {
    await upsertSystemCatalog(
      prisma,
      {
        id: cat.id,
        catalogType: 'smart_inspection_category',
        name: cat.name,
        description: cat.description,
        payload: {
          inspectionKind: cat.inspectionKind,
          libraryGroup: cat.libraryGroup,
          industry: cat.industry,
          focusArea: cat.focusArea,
          sortOrder: cat.sortOrder,
        },
      },
      result.smartCategories,
    );
  }

  for (const companyId of options.companyIds) {
    for (const c of CONTROL_SEEDS) {
      const body = {
        controlType: c.controlType,
        description: c.description,
        hazardCategories: c.hazardCategories,
        energyTypes: c.energyTypes ?? [],
        ppeRequired: c.ppeRequired ?? false,
      };
      const hash = contentHash(body);
      const existing = await prisma.controlLibraryEntry.findFirst({
        where: { seedKey: c.seedKey, companyId },
      });

      if (!existing) {
        await prisma.controlLibraryEntry.create({
          data: {
            seedKey: c.seedKey,
            companyId,
            controlType: c.controlType,
            description: c.description,
            hazardCategories: c.hazardCategories as Prisma.InputJsonValue,
            energyTypes: (c.energyTypes ?? []) as Prisma.InputJsonValue,
            ppeRequired: c.ppeRequired ?? false,
            seedVersion: 1,
          },
        });
        if (companyId === options.companyIds[0]) bump(result.controls, 'created');
        continue;
      }

      const prevHash = contentHash({
        controlType: existing.controlType,
        description: existing.description,
        hazardCategories: existing.hazardCategories,
        energyTypes: existing.energyTypes,
        ppeRequired: existing.ppeRequired,
      });
      if (prevHash === hash) {
        if (companyId === options.companyIds[0]) bump(result.controls, 'unchanged');
        continue;
      }

      await prisma.controlLibraryEntry.update({
        where: { id: existing.id },
        data: {
          ...body,
          hazardCategories: body.hazardCategories as Prisma.InputJsonValue,
          energyTypes: body.energyTypes as Prisma.InputJsonValue,
          seedVersion: existing.seedVersion + 1,
        },
      });
      if (companyId === options.companyIds[0]) bump(result.controls, 'updated');
    }

    for (const h of HAZARD_SEEDS) {
      const body = {
        category: h.category,
        subcategory: h.subcategory ?? null,
        description: h.description,
        defaultSeverity: h.defaultSeverity ?? 3,
        defaultLikelihood: h.defaultLikelihood ?? 3,
        defaultEnergyTypes: h.defaultEnergyTypes,
        defaultControlKeys: h.defaultControlKeys,
        taskTypes: h.taskTypes ?? [],
      };
      const hash = contentHash(body);
      const existing = await prisma.hazardLibraryEntry.findFirst({
        where: { seedKey: h.seedKey, companyId },
      });

      if (!existing) {
        await prisma.hazardLibraryEntry.create({
          data: {
            seedKey: h.seedKey,
            companyId,
            category: h.category,
            subcategory: h.subcategory,
            description: h.description,
            defaultSeverity: h.defaultSeverity ?? 3,
            defaultLikelihood: h.defaultLikelihood ?? 3,
            defaultEnergyTypes: h.defaultEnergyTypes as Prisma.InputJsonValue,
            defaultControlKeys: h.defaultControlKeys as Prisma.InputJsonValue,
            taskTypes: (h.taskTypes ?? []) as Prisma.InputJsonValue,
            seedVersion: 1,
          },
        });
        if (companyId === options.companyIds[0]) bump(result.hazards, 'created');
        continue;
      }

      const prevHash = contentHash({
        category: existing.category,
        subcategory: existing.subcategory,
        description: existing.description,
        defaultSeverity: existing.defaultSeverity,
        defaultLikelihood: existing.defaultLikelihood,
        defaultEnergyTypes: existing.defaultEnergyTypes,
        defaultControlKeys: existing.defaultControlKeys,
        taskTypes: existing.taskTypes,
      });
      if (prevHash === hash) {
        if (companyId === options.companyIds[0]) bump(result.hazards, 'unchanged');
        continue;
      }

      await prisma.hazardLibraryEntry.update({
        where: { id: existing.id },
        data: {
          category: body.category,
          subcategory: body.subcategory,
          description: body.description,
          defaultSeverity: body.defaultSeverity,
          defaultLikelihood: body.defaultLikelihood,
          defaultEnergyTypes: body.defaultEnergyTypes as Prisma.InputJsonValue,
          defaultControlKeys: body.defaultControlKeys as Prisma.InputJsonValue,
          taskTypes: body.taskTypes as Prisma.InputJsonValue,
          seedVersion: existing.seedVersion + 1,
        },
      });
      if (companyId === options.companyIds[0]) bump(result.hazards, 'updated');
    }
  }

  for (const permit of PERMIT_TYPE_SEEDS) {
    await upsertSystemCatalog(
      prisma,
      {
        id: permit.id,
        catalogType: 'permit_type',
        name: permit.name,
        description: permit.description,
        payload: {
          permitType: permit.permitType,
          requiredFields: permit.requiredFields,
          workflowSteps: permit.workflowSteps,
          defaultControlKeys: permit.defaultControlKeys,
          defaultHazardKeys: permit.defaultHazardKeys,
          requiredTraining: permit.requiredTraining,
        },
      },
      result.permitTypes,
    );
  }

  const publishedAt = new Date();
  for (const companyId of options.companyIds) {
    for (const tpl of PM_INSPECTION_TEMPLATE_SEEDS) {
      const body = {
        name: tpl.name,
        category: tpl.category,
        description: tpl.description ?? null,
        scoringMode: tpl.scoringMode,
        scoringRules: tpl.scoringRules ?? {},
        items: tpl.items,
        equipmentTypeKeys: tpl.equipmentTypeKeys ?? [],
      };
      const hash = contentHash(body);
      const existing = await prisma.pmInspectionTemplate.findFirst({
        where: { seedKey: tpl.seedKey, companyId },
      });

      if (!existing) {
        await prisma.pmInspectionTemplate.create({
          data: {
            seedKey: tpl.seedKey,
            companyId,
            projectId: null,
            name: tpl.name,
            category: tpl.category as never,
            description: tpl.description,
            scoringMode: tpl.scoringMode as never,
            status: 'published',
            publishedAt,
            publishedByUserId: options.publisherUserId,
            items: tpl.items as Prisma.InputJsonValue,
            scoringRules: (tpl.scoringRules ?? {}) as Prisma.InputJsonValue,
            equipmentTypeKeys: (tpl.equipmentTypeKeys ?? []) as Prisma.InputJsonValue,
            seedVersion: 1,
          },
        });
        if (companyId === options.companyIds[0]) bump(result.pmInspectionTemplates, 'created');
        continue;
      }

      const prevHash = contentHash({
        name: existing.name,
        category: existing.category,
        description: existing.description,
        scoringMode: existing.scoringMode,
        scoringRules: existing.scoringRules,
        items: existing.items,
        equipmentTypeKeys: existing.equipmentTypeKeys,
      });
      if (prevHash === hash) {
        if (companyId === options.companyIds[0]) bump(result.pmInspectionTemplates, 'unchanged');
        continue;
      }

      await prisma.pmInspectionTemplate.update({
        where: { id: existing.id },
        data: {
          name: tpl.name,
          category: tpl.category as never,
          description: tpl.description,
          scoringMode: tpl.scoringMode as never,
          items: tpl.items as Prisma.InputJsonValue,
          scoringRules: (tpl.scoringRules ?? {}) as Prisma.InputJsonValue,
          equipmentTypeKeys: (tpl.equipmentTypeKeys ?? []) as Prisma.InputJsonValue,
          seedVersion: existing.seedVersion + 1,
          status: 'published',
          publishedAt,
        },
      });
      if (companyId === options.companyIds[0]) bump(result.pmInspectionTemplates, 'updated');
    }
  }

  return result;
}
