import { Injectable } from '@nestjs/common';
import { JhaLibraryService } from './jha-library.service';

export type HazardCatalogRow = ReturnType<JhaLibraryService['mapHazardRow']>;
export type ControlCatalogRow = ReturnType<JhaLibraryService['mapControlRow']>;

@Injectable()
export class HazardControlCatalogService {
  constructor(private readonly library: JhaLibraryService) {}

  private filterBySearch<T extends { description: string; category?: string }>(
    rows: T[],
    search?: string,
  ): T[] {
    const q = search?.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.description.toLowerCase().includes(q) ||
        (r.category?.toLowerCase().includes(q) ?? false),
    );
  }

  async listHazards(
    companyId: number,
    projectId?: number,
    options?: { category?: string; search?: string; taskCode?: string },
  ) {
    const rows = await this.library.listHazards(
      companyId,
      projectId,
      options?.taskCode,
    );
    let mapped = rows.map((h) => this.library.mapHazardRow(h));
    if (options?.category) {
      mapped = mapped.filter((h) => h.category === options.category);
    }
    mapped = this.filterBySearch(mapped, options?.search);

    const categories = [...new Set(mapped.map((h) => h.category))].sort();
    const counts: Record<string, number> = {};
    for (const h of mapped) {
      counts[h.category] = (counts[h.category] ?? 0) + 1;
    }

    return { hazards: mapped, categories, counts, total: mapped.length };
  }

  async listControls(
    companyId: number,
    projectId?: number,
    options?: {
      hazardCategory?: string;
      hazardCategories?: string[];
      search?: string;
    },
  ) {
    const rows = await this.library.listControls(
      companyId,
      projectId,
      options?.hazardCategory,
    );
    let mapped = rows.map((c) => this.library.mapControlRow(c));

    const hazardCats = options?.hazardCategories?.filter(Boolean) ?? [];
    if (hazardCats.length > 0 && !options?.hazardCategory) {
      mapped = mapped.filter((c) => {
        if (!c.hazardCategories?.length) return true;
        return c.hazardCategories.some((cat) => hazardCats.includes(cat));
      });
    }

    const q = options?.search?.trim().toLowerCase();
    if (q) {
      mapped = mapped.filter(
        (c) =>
          c.description.toLowerCase().includes(q) ||
          c.controlType.toLowerCase().includes(q),
      );
    }

    const controlTypes = [...new Set(mapped.map((c) => c.controlType))].sort();
    const counts: Record<string, number> = {};
    for (const c of mapped) {
      counts[c.controlType] = (counts[c.controlType] ?? 0) + 1;
    }

    return { controls: mapped, controlTypes, counts, total: mapped.length };
  }

  async suggestHazardsForTask(
    companyId: number,
    projectId: number | undefined,
    input: {
      taskDescription: string;
      locationNote?: string;
      weather?: string;
      existingHazardDescriptions?: string[];
    },
  ) {
    const hazards = await this.library.listHazards(companyId, projectId);
    const controls = await this.library.listControls(companyId, projectId);
    const result = await this.library.suggest(
      {
        taskDescription: input.taskDescription,
        locationNote: input.locationNote,
        weather: input.weather,
        selectedHazardCategories: [],
        selectedEnergyTypes: [],
        existingHazardDescriptions: input.existingHazardDescriptions ?? [],
        existingControlDescriptions: [],
        hazardLibrary: hazards.map((h) => this.library.mapHazardRow(h)),
        controlLibrary: controls.map((c) => this.library.mapControlRow(c)),
      },
      projectId,
    );
    return {
      suggestedHazards: result.suggestedHazards,
      missedHazards: result.missedHazards ?? [],
      matchedTaskProfiles: result.matchedTaskProfiles ?? [],
      warnings: result.warnings ?? [],
    };
  }

  async suggestControlsForHazards(
    companyId: number,
    projectId: number | undefined,
    input: {
      taskDescription?: string;
      hazardCategories?: string[];
      hazardDescriptions?: string[];
      energyTypes?: string[];
      focusedHazardCategory?: string;
      focusedHazardDescription?: string;
      focusedHazardEnergyTypes?: string[];
      existingControlDescriptions?: string[];
    },
  ) {
    const hazards = await this.library.listHazards(companyId, projectId);
    const controls = await this.library.listControls(companyId, projectId);
    const result = await this.library.suggest(
      {
        taskDescription: input.taskDescription,
        selectedHazardCategories: input.hazardCategories ?? [],
        selectedEnergyTypes: input.energyTypes ?? [],
        existingHazardDescriptions: input.hazardDescriptions ?? [],
        existingControlDescriptions: input.existingControlDescriptions ?? [],
        focusedHazardCategory: input.focusedHazardCategory,
        focusedHazardDescription: input.focusedHazardDescription,
        focusedHazardEnergyTypes: input.focusedHazardEnergyTypes,
        hazardLibrary: hazards.map((h) => this.library.mapHazardRow(h)),
        controlLibrary: controls.map((c) => this.library.mapControlRow(c)),
      },
      projectId,
    );
    return {
      suggestedControls: result.suggestedControls,
      missedControls: result.missedControls ?? [],
      warnings: result.warnings ?? [],
      crewOftenAdds: result.crewOftenAdds?.controls ?? [],
    };
  }

  /** Stub AI hazard identification — returns rule-engine matches until LLM is wired. */
  async aiIdentifyHazards(
    companyId: number,
    projectId: number | undefined,
    body: {
      taskDescription: string;
      workScope?: string;
      locationNote?: string;
      equipment?: string[];
    },
  ) {
    const taskText = [
      body.taskDescription,
      body.workScope,
      body.locationNote,
      ...(body.equipment ?? []),
    ]
      .filter(Boolean)
      .join(' ');

    const ruleBased = await this.suggestHazardsForTask(companyId, projectId, {
      taskDescription: taskText,
      locationNote: body.locationNote,
    });

    return {
      source: 'stub' as const,
      model: null,
      message:
        'AI hazard identification stub — results use Vera rule engine until vision/LLM is configured.',
      hazards: ruleBased.suggestedHazards.slice(0, 12),
      matchedTaskProfiles: ruleBased.matchedTaskProfiles,
      warnings: ruleBased.warnings,
    };
  }
}
