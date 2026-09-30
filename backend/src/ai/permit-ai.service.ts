import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PmPermitType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PERMIT_TYPE_SEEDS } from '../../prisma/data/permit-types';
import { HazardControlCatalogService } from '../jha-flha/hazard-control-catalog.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  WorkerTrainingHydrationService,
  type WorkerTrainingRequirement,
} from '../workers/worker-training-hydration.service';
import type { PermitWorkflowJson } from '../pm-permits/pm-permits.service';

export type PermitAiSuggestInput = {
  companyId: number;
  projectId: number;
  permitType: PmPermitType | string;
  jobScope: string;
  workerId?: number;
  equipmentIds?: number[];
  locationNote?: string;
  weatherNote?: string;
};

export type PermitAiSuggestionItem = {
  key: string;
  label: string;
  selected: boolean;
  confidence: number;
  source: 'permit_template' | 'ai_catalog' | 'rule_engine';
  reason?: string;
};

export type PermitAiOverridableBlock = {
  id: string;
  label: string;
  blocked: boolean;
  canOverride: boolean;
  message: string;
};

export type PermitAiSuggestResult = {
  suggestionId: string;
  source: 'stub';
  model: string | null;
  message: string;
  suggestedTitle: string;
  jobScope: string;
  hazards: PermitAiSuggestionItem[];
  controls: PermitAiSuggestionItem[];
  fieldValues: Record<string, unknown>;
  training: {
    valid: boolean;
    requirements: WorkerTrainingRequirement[];
    message: string;
  };
  equipment: {
    valid: boolean;
    items: Array<{
      equipmentId: number;
      name: string;
      status: 'valid' | 'expired' | 'missing';
      message: string;
    }>;
    message: string;
  };
  weather: {
    status: 'stub';
    summary: string;
    warnings: string[];
    proceed: boolean;
  };
  incidents: {
    status: 'stub';
    recentCount: number;
    warnings: string[];
    proceed: boolean;
  };
  overridableBlocks: PermitAiOverridableBlock[];
  warnings: string[];
  workflow: PermitWorkflowJson;
};

@Injectable()
export class PermitAiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hazardCatalog: HazardControlCatalogService,
    private readonly trainingHydration: WorkerTrainingHydrationService,
  ) {}

  async suggest(input: PermitAiSuggestInput): Promise<PermitAiSuggestResult> {
    const jobScope = input.jobScope?.trim();
    if (!jobScope) {
      throw new BadRequestException('jobScope is required');
    }

    const seed = PERMIT_TYPE_SEEDS.find(
      (p) => p.permitType === input.permitType,
    );
    if (!seed) {
      throw new NotFoundException(`Unknown permit type: ${input.permitType}`);
    }

    const taskText = [jobScope, input.locationNote].filter(Boolean).join(' — ');

    const aiHazards = await this.hazardCatalog.aiIdentifyHazards(
      input.companyId,
      input.projectId,
      {
        taskDescription: taskText,
        workScope: jobScope,
        locationNote: input.locationNote,
      },
    );

    const hazardCategories = [
      ...new Set(aiHazards.hazards.map((h) => h.category)),
    ];
    const controlSuggestions =
      await this.hazardCatalog.suggestControlsForHazards(
        input.companyId,
        input.projectId,
        {
          taskDescription: taskText,
          hazardCategories,
          hazardDescriptions: aiHazards.hazards.map((h) => h.description),
        },
      );

    const hazards = this.buildSuggestionItems(
      seed.defaultHazardKeys ?? [],
      'hz',
      taskText,
      aiHazards.hazards.map((h) => ({
        description: h.description,
        score: h.score,
        reason: h.reason,
      })),
    );

    const controls = this.buildSuggestionItems(
      seed.defaultControlKeys ?? [],
      'ctrl',
      taskText,
      controlSuggestions.suggestedControls.map((c) => ({
        description: c.description,
        score: c.score,
        reason: c.reason,
      })),
    );

    const requiredTraining = seed.requiredTraining ?? [];
    let trainingRequirements: WorkerTrainingRequirement[] = [];
    let trainingValid = true;
    let trainingMessage = 'Assign a worker to validate training.';

    if (input.workerId) {
      const hydration = await this.trainingHydration.hydrateWorkerTraining(
        input.workerId,
        {
          requiredCodes: requiredTraining,
          projectId: input.projectId,
        },
      );
      trainingRequirements = hydration.requirements;
      trainingValid = trainingRequirements.every((r) => r.status === 'valid');
      trainingMessage = trainingValid
        ? 'All required training valid in Vera Core.'
        : 'One or more required training items missing or expired.';
    }

    const equipment = await this.validateEquipment(
      input.workerId,
      input.equipmentIds ?? [],
      input.projectId,
    );

    const incidents = await this.checkRecentIncidents(
      input.workerId,
      input.projectId,
    );

    const weather = this.buildWeatherStub(input.weatherNote);

    const fieldValues = this.prefillFields(seed.requiredFields ?? [], jobScope);

    const overridableBlocks: PermitAiOverridableBlock[] = [
      {
        id: 'training',
        label: 'Worker training',
        blocked: !trainingValid && !!input.workerId,
        canOverride: true,
        message: trainingMessage,
      },
      {
        id: 'equipment',
        label: 'Equipment certifications',
        blocked: !equipment.valid && equipment.items.length > 0,
        canOverride: true,
        message: equipment.message,
      },
      {
        id: 'weather',
        label: 'Weather conditions',
        blocked: !weather.proceed,
        canOverride: true,
        message: weather.summary,
      },
      {
        id: 'incidents',
        label: 'Previous incidents',
        blocked: !incidents.proceed,
        canOverride: true,
        message:
          incidents.recentCount > 0
            ? `${incidents.recentCount} incident(s) in last 90 days — review before approving.`
            : 'No recent incidents flagged (stub).',
      },
    ];

    const warnings = [
      ...aiHazards.warnings,
      ...(controlSuggestions.warnings ?? []),
      ...incidents.warnings,
      ...weather.warnings,
    ];

    const workflow: PermitWorkflowJson = {
      jobScope,
      workerId: input.workerId,
      fieldValues,
      hazards: hazards.filter((h) => h.selected).map((h) => h.key),
      controls: controls.filter((c) => c.selected).map((c) => c.key),
      trainingValidated: trainingRequirements
        .filter((r) => r.status === 'valid')
        .map((r) => r.code),
      aiGenerated: true,
      aiSuggestionSummary: `Smart permit generated for ${seed.name}`,
      signoffs: [],
    };

    return {
      suggestionId: randomUUID(),
      source: 'stub',
      model: null,
      message:
        'Smart permit stub — rule engine + Vera catalogs until LLM permit agent is configured.',
      suggestedTitle: this.suggestTitle(seed.name, jobScope),
      jobScope,
      hazards,
      controls,
      fieldValues,
      training: {
        valid: trainingValid,
        requirements: trainingRequirements,
        message: trainingMessage,
      },
      equipment,
      weather,
      incidents,
      overridableBlocks,
      warnings,
      workflow,
    };
  }

  private keyLabel(key: string) {
    return key
      .replace(/^hz\.|^ctrl\./, '')
      .replace(/\./g, ' · ')
      .replace(/_/g, ' ');
  }

  private scorePermitKey(key: string, jobScope: string, boost = 0): number {
    const label = this.keyLabel(key).toLowerCase();
    const scope = jobScope.toLowerCase();
    let score = 0.35 + boost;
    for (const word of label.split(/\s+/)) {
      if (word.length > 3 && scope.includes(word)) score += 0.12;
    }
    return Math.min(1, score);
  }

  private buildSuggestionItems(
    templateKeys: string[],
    _prefix: 'hz' | 'ctrl',
    jobScope: string,
    catalogSuggestions: Array<{
      description: string;
      score: number;
      reason?: string;
    }>,
  ): PermitAiSuggestionItem[] {
    const catalogText = catalogSuggestions
      .map((s) => s.description.toLowerCase())
      .join(' ');

    return templateKeys.map((key) => {
      const label = this.keyLabel(key);
      const labelLower = label.toLowerCase();
      const catalogBoost = catalogText.includes(labelLower.split(' ')[0] ?? '')
        ? 0.2
        : catalogSuggestions.some((s) =>
            s.description.toLowerCase().includes(labelLower.slice(0, 8)),
          )
        ? 0.15
        : 0;
      const confidence = this.scorePermitKey(key, jobScope, catalogBoost);
      const matchedCatalog = catalogSuggestions.find((s) =>
        s.description.toLowerCase().includes(labelLower.slice(0, 6)),
      );
      return {
        key,
        label,
        selected: confidence >= 0.45 || templateKeys.length <= 3,
        confidence,
        source: matchedCatalog ? 'ai_catalog' : 'permit_template',
        reason: matchedCatalog?.reason,
      };
    });
  }

  private suggestTitle(permitName: string, jobScope: string) {
    const snippet = jobScope.split(/[\n.]/)[0]?.trim().slice(0, 60);
    return snippet ? `${permitName} — ${snippet}` : permitName;
  }

  private prefillFields(
    fields: Array<{
      key: string;
      label: string;
      type: string;
      required?: boolean;
    }>,
    jobScope: string,
  ): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    const now = new Date();
    const end = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    for (const field of fields) {
      const key = field.key;
      const scopeLower = jobScope.toLowerCase();

      if (field.type === 'datetime') {
        values[key] =
          key.includes('valid_to') || key === 'valid_to'
            ? end.toISOString().slice(0, 16)
            : now.toISOString().slice(0, 16);
        continue;
      }

      if (field.type === 'boolean') {
        values[key] =
          key.includes('verified') ||
          key.includes('ready') ||
          key.includes('tieoff') ||
          key.includes('inspection');
        continue;
      }

      if (field.type === 'number') {
        const numMatch = jobScope.match(
          /(\d+(?:\.\d+)?)\s*(?:ft|feet|m|meter)?/i,
        );
        values[key] = numMatch ? Number(numMatch[1]) : '';
        continue;
      }

      if (
        key.includes('location') ||
        key.includes('space_id') ||
        key.includes('opening')
      ) {
        values[key] = jobScope.split('\n')[0]?.trim().slice(0, 120) ?? '';
        continue;
      }

      if (key.includes('work_type') && scopeLower.includes('weld')) {
        values[key] = 'Welding';
      } else if (key.includes('work_type') && scopeLower.includes('grind')) {
        values[key] = 'Grinding';
      } else if (key.includes('work_type')) {
        values[key] = 'Cutting / hot work';
      } else {
        values[key] = '';
      }
    }

    return values;
  }

  private async validateEquipment(
    workerId: number | undefined,
    equipmentIds: number[],
    projectId: number,
  ) {
    let ids = equipmentIds;
    if (ids.length === 0 && workerId) {
      const assignments = await this.prisma.equipmentAssignment.findMany({
        where: { workerId, endedAt: null, equipmentId: { not: null } },
        select: { equipmentId: true },
      });
      ids = assignments
        .map((a) => a.equipmentId)
        .filter((id): id is number => id != null);
    }

    if (ids.length === 0) {
      return {
        valid: true,
        items: [] as PermitAiSuggestResult['equipment']['items'],
        message: 'No equipment specified — skipped certification check.',
      };
    }

    const now = new Date();
    const items: PermitAiSuggestResult['equipment']['items'] = [];

    for (const equipmentId of ids.slice(0, 10)) {
      const eq = await this.prisma.equipment.findUnique({
        where: { id: equipmentId },
        select: { id: true, name: true, assetTag: true },
      });
      if (!eq) continue;

      const certCount = await this.prisma.pmEquipmentCertification.count({
        where: {
          equipmentId,
          status: 'approved',
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      });
      const legacyCert = await this.prisma.trainingRecord.count({
        where: {
          workerId: workerId ?? undefined,
          expiresAt: { gt: now },
        },
      });

      const valid = certCount > 0 || legacyCert > 0;
      items.push({
        equipmentId,
        name: eq.name ?? eq.assetTag ?? `Equipment #${equipmentId}`,
        status: valid ? 'valid' : 'missing',
        message: valid
          ? 'Certification current'
          : 'Equipment certification missing or expired',
      });
    }

    const valid = items.every((i) => i.status === 'valid');
    return {
      valid,
      items,
      message: valid
        ? 'All listed equipment certifications valid.'
        : 'One or more equipment certifications missing or expired.',
    };
  }

  private async checkRecentIncidents(
    workerId: number | undefined,
    projectId: number,
  ) {
    if (!workerId) {
      return {
        status: 'stub' as const,
        recentCount: 0,
        warnings: [] as string[],
        proceed: true,
      };
    }

    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const recentCount = await this.prisma.pmSafetyEvent.count({
      where: {
        projectId,
        deletedAt: null,
        occurredAt: { gte: since },
        OR: [
          { people: { some: { workerId } } },
          { injuries: { some: { workerId } } },
        ],
      },
    });

    const warnings =
      recentCount > 0
        ? [
            `${recentCount} safety incident(s) involving this worker in the last 90 days.`,
          ]
        : [];

    return {
      status: 'stub' as const,
      recentCount,
      warnings,
      proceed: recentCount === 0,
    };
  }

  private buildWeatherStub(weatherNote?: string) {
    const warnings = weatherNote?.trim()
      ? [`Operator note: ${weatherNote.trim()}`]
      : [
          'Weather API not connected — confirm wind, precipitation, and temperature on site.',
        ];

    return {
      status: 'stub' as const,
      summary:
        'Weather check stub — verify conditions meet permit requirements before activation.',
      warnings,
      proceed: true,
    };
  }
}
