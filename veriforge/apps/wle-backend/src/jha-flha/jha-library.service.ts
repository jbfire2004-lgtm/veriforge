import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CONTROL_CLASS_LOOKUP,
  ENERGY_WHEEL,
  HAZARD_KEYWORD_LOOKUP,
} from './jha-flha.constants';
import { getCompleteCatalog } from './jha-library-catalog';
import { inferControlClass } from './jha-control-class';
import {
  resolveIndustryPacks,
  type JhaIndustryPackId,
} from './jha-industry-packs';
import {
  JhaLibraryLearningService,
  type ProjectLearnings,
} from './jha-library-learning.service';
import {
  suggestJhaLibrary,
  type JhaSuggestionInput,
} from './jha-suggestion.engine';

@Injectable()
export class JhaLibraryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly learning: JhaLibraryLearningService,
  ) {}

  energyWheel() {
    return ENERGY_WHEEL;
  }

  async resolveCompanyPacks(companyId: number): Promise<JhaIndustryPackId[]> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { industry: true },
    });
    return resolveIndustryPacks(company?.industry);
  }

  /** Seed full master catalog for every company (all industries). */
  async ensureSeed(companyId: number, projectId?: number) {
    const { hazards, controls } = getCompleteCatalog();

    for (const h of hazards) {
      const exists = await this.prisma.hazardLibraryEntry.findFirst({
        where: {
          companyId,
          projectId: projectId ?? null,
          description: h.description,
        },
      });
      if (!exists) {
        await this.prisma.hazardLibraryEntry.create({
          data: {
            companyId,
            projectId,
            category: h.category,
            subcategory: h.subcategory,
            description: h.description,
            defaultSeverity: h.defaultSeverity ?? 3,
            defaultLikelihood: h.defaultLikelihood ?? 3,
            defaultEnergyTypes: h.defaultEnergyTypes as Prisma.InputJsonValue,
            taskTypes: (h.taskTypes ?? []) as Prisma.InputJsonValue,
          },
        });
      }
    }
    for (const c of controls) {
      const exists = await this.prisma.controlLibraryEntry.findFirst({
        where: {
          companyId,
          projectId: projectId ?? null,
          description: c.description,
        },
      });
      if (!exists) {
        await this.prisma.controlLibraryEntry.create({
          data: {
            companyId,
            projectId,
            controlType: c.controlType,
            description: c.description,
            hazardCategories: c.hazardCategories as Prisma.InputJsonValue,
            energyTypes: (c.energyTypes ?? []) as Prisma.InputJsonValue,
            ppeRequired: c.ppeRequired ?? false,
          },
        });
      }
    }
  }

  mapHazardRow(h: {
    id: string;
    category: string;
    subcategory?: string | null;
    description: string;
    defaultSeverity: number;
    defaultLikelihood: number;
    defaultEnergyTypes: unknown;
  }) {
    return {
      id: h.id,
      category: h.category,
      subcategory: h.subcategory ?? undefined,
      description: h.description,
      defaultSeverity: h.defaultSeverity,
      defaultLikelihood: h.defaultLikelihood,
      defaultEnergyTypes: (h.defaultEnergyTypes as string[]) ?? [],
      keywords: HAZARD_KEYWORD_LOOKUP.get(h.description.toLowerCase().trim()),
    };
  }

  mapControlRow(c: {
    id: string;
    controlType: string;
    description: string;
    hazardCategories: unknown;
    energyTypes?: unknown;
    ppeRequired: boolean;
  }) {
    const hazardCategories = (c.hazardCategories as string[]) ?? [];
    const energyTypes = (c.energyTypes as string[]) ?? [];
    const controlClass =
      CONTROL_CLASS_LOOKUP.get(c.description.toLowerCase().trim()) ??
      inferControlClass(c.controlType, energyTypes, hazardCategories);
    return {
      id: c.id,
      controlType: c.controlType,
      description: c.description,
      hazardCategories,
      energyTypes,
      ppeRequired: c.ppeRequired,
      controlClass,
    };
  }

  async listHazards(companyId: number, projectId?: number, taskCode?: string) {
    await this.ensureSeed(companyId, projectId);
    const rows = await this.prisma.hazardLibraryEntry.findMany({
      where: {
        active: true,
        OR: [
          { companyId, projectId: null },
          { companyId, projectId: projectId ?? undefined },
        ],
      },
      orderBy: [{ category: 'asc' }, { description: 'asc' }],
      take: 2000,
    });
    if (!taskCode) return rows;
    return rows.filter((r) => {
      const types = r.taskTypes as string[] | null;
      return !types?.length || types.includes(taskCode);
    });
  }

  async listControls(companyId: number, projectId?: number, category?: string) {
    await this.ensureSeed(companyId, projectId);
    const rows = await this.prisma.controlLibraryEntry.findMany({
      where: {
        active: true,
        OR: [
          { companyId, projectId: null },
          { companyId, projectId: projectId ?? undefined },
        ],
      },
      orderBy: [{ controlType: 'asc' }, { description: 'asc' }],
      take: 2000,
    });
    if (!category) return rows;
    return rows.filter((r) => {
      const cats = r.hazardCategories as string[];
      return !cats?.length || cats.includes(category);
    });
  }

  async createHazard(data: {
    companyId: number;
    projectId?: number;
    category: string;
    description: string;
    subcategory?: string;
    defaultSeverity?: number;
    defaultLikelihood?: number;
    defaultEnergyTypes?: string[];
  }) {
    return this.prisma.hazardLibraryEntry.create({
      data: {
        companyId: data.companyId,
        projectId: data.projectId,
        category: data.category,
        subcategory: data.subcategory,
        description: data.description,
        defaultSeverity: data.defaultSeverity ?? 3,
        defaultLikelihood: data.defaultLikelihood ?? 3,
        defaultEnergyTypes: (data.defaultEnergyTypes ??
          []) as Prisma.InputJsonValue,
      },
    });
  }

  async createControl(data: {
    companyId: number;
    projectId?: number;
    controlType: string;
    description: string;
    hazardCategories?: string[];
    ppeRequired?: boolean;
  }) {
    return this.prisma.controlLibraryEntry.create({
      data: {
        companyId: data.companyId,
        projectId: data.projectId,
        controlType: data.controlType,
        description: data.description,
        hazardCategories: (data.hazardCategories ??
          []) as Prisma.InputJsonValue,
        ppeRequired: data.ppeRequired ?? false,
      },
    });
  }

  async getProjectLearnings(projectId: number): Promise<ProjectLearnings> {
    return this.learning.getProjectLearnings(projectId);
  }

  async promoteFromApprovedJha(jhaFlhaId: string) {
    return this.learning.promoteFromApprovedJha(jhaFlhaId);
  }

  async suggest(input: JhaSuggestionInput, projectId?: number) {
    const learnings = projectId
      ? await this.learning.getProjectLearnings(projectId)
      : { hazards: [], controls: [], approvedFormCount: 0 };
    return suggestJhaLibrary({ ...input, projectLearnings: learnings });
  }

  async listTasks(companyId: number, projectId?: number) {
    return this.prisma.jhaTaskLibraryEntry.findMany({
      where: {
        active: true,
        OR: [
          { companyId, projectId: null },
          { companyId, projectId: projectId ?? undefined },
        ],
      },
      orderBy: { title: 'asc' },
      take: 100,
    });
  }

  async createTask(data: {
    companyId: number;
    projectId?: number;
    taskCode: string;
    title: string;
    description?: string;
    requiredTraining?: string[];
  }) {
    return this.prisma.jhaTaskLibraryEntry.create({ data });
  }
}
