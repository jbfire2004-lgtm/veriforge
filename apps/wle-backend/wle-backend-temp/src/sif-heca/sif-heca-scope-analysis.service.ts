import { Injectable, Optional } from '@nestjs/common';
import { VsiCopilotEngineService } from '../safety-intelligence/ai/copilot/vsi-copilot-engine.service';
import type { SifHecaAssessmentCopilotOutput } from '../safety-intelligence/ai/copilot/vsi-copilot.types';
import { getCompleteCatalog } from '../jha-flha/jha-library-catalog';
import { suggestJhaLibrary } from '../jha-flha/jha-suggestion.engine';
import {
  HECA_CATEGORIES,
  HIGH_ENERGY_TYPES,
  SIF_INDICATORS,
  categoryFromScore,
} from './sif-heca.constants';

export type SifHecaScopeInput = {
  companyId: number;
  projectId: number;
  title: string;
  jobDescription?: string;
  workScope?: string;
  locationNote?: string;
  environmentNote?: string;
  equipmentNote?: string;
};

export type SifHecaScopeAnalysisResult = SifHecaAssessmentCopilotOutput & {
  engine: string[];
  combined_text: string;
  max_severity: number;
  max_likelihood: number;
};

function scopeText(input: SifHecaScopeInput): string {
  return [
    input.title,
    input.jobDescription,
    input.workScope,
    input.locationNote,
    input.environmentNote,
    input.equipmentNote,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
}

function matchSifIndicators(text: string): string[] {
  const hits: string[] = [];
  const rules: Array<{ code: string; patterns: RegExp }> = [
    {
      code: 'FALL_HEIGHT',
      patterns: /fall|height|ladder|scaffold|roof|elevation|leading edge/i,
    },
    {
      code: 'STRUCK_BY',
      patterns: /struck|swing|overhead|crane|load|line of fire/i,
    },
    { code: 'CAUGHT_IN', patterns: /caught|pinch|rotating|conveyor|between/i },
    {
      code: 'ELECTRICAL_CONTACT',
      patterns: /electrical|arc|energized|voltage|shock|linework/i,
    },
    {
      code: 'CONFINED_SPACE',
      patterns: /confined|tank|vessel|engulf|manhole|silo/i,
    },
    {
      code: 'HEAVY_LIFT',
      patterns: /lift|rigging|crane|hoist|critical lift|heavy/i,
    },
    {
      code: 'VEHICLE_STRIKE',
      patterns: /vehicle|forklift|excavator|mobile equipment|traffic/i,
    },
  ];
  for (const r of rules) {
    if (r.patterns.test(text)) hits.push(r.code);
  }
  return hits;
}

function matchHecaCategories(
  text: string,
  energyTypes: string[],
): {
  primary: (typeof HECA_CATEGORIES)[number];
  secondary: string[];
  score: number;
} {
  type HecaCat = (typeof HECA_CATEGORIES)[number];
  let best: HecaCat = HECA_CATEGORIES[0]!;
  let bestScore = 0;
  const secondary: string[] = [];

  for (const cat of HECA_CATEGORIES) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (text.includes(kw.toLowerCase())) score += 3;
    }
    for (const et of energyTypes) {
      if ((cat.energyTypes as readonly string[]).includes(et)) score += 4;
    }
    if (score > bestScore) {
      if (bestScore > 0 && best.code !== cat.code) secondary.push(best.code);
      bestScore = score;
      best = cat;
    } else if (score > 2) {
      secondary.push(cat.code);
    }
  }
  return {
    primary: best,
    secondary: [...new Set(secondary)],
    score: bestScore,
  };
}

@Injectable()
export class SifHecaScopeAnalysisService {
  constructor(@Optional() private readonly copilot?: VsiCopilotEngineService) {}

  async analyze(input: SifHecaScopeInput): Promise<SifHecaScopeAnalysisResult> {
    const combined = scopeText(input);
    const engines: string[] = [];

    if (this.copilot) {
      const run = await this.copilot.analyzeSifHecaScope({
        title: input.title,
        jobDescription: input.jobDescription,
        workScope: input.workScope,
        locationNote: input.locationNote,
        environmentNote: input.environmentNote,
        equipmentNote: input.equipmentNote,
        projectId: input.projectId,
        companyId: input.companyId,
      });
      engines.push(...run.engine);
      const out = run.output as SifHecaAssessmentCopilotOutput;
      if (out?.inferred_hazards?.length) {
        return this.finalize(out, engines, combined);
      }
    }

    engines.push('catalog-heuristic');
    const heuristic = this.heuristicAnalyze(input, combined);
    return this.finalize(heuristic, engines, combined);
  }

  private heuristicAnalyze(
    input: SifHecaScopeInput,
    combined: string,
  ): SifHecaAssessmentCopilotOutput {
    const catalog = getCompleteCatalog();
    const taskText = [
      input.title,
      input.jobDescription,
      input.workScope,
      input.locationNote,
      input.environmentNote,
      input.equipmentNote,
    ]
      .filter(Boolean)
      .join(' ');

    const suggestions = suggestJhaLibrary({
      taskDescription: taskText,
      locationNote: input.locationNote,
      weather: input.environmentNote,
      selectedHazardCategories: [],
      selectedEnergyTypes: [],
      existingHazardDescriptions: [],
      existingControlDescriptions: [],
      hazardLibrary: catalog.hazards,
      controlLibrary: catalog.controls,
    });

    const hazardPool =
      suggestions.suggestedHazards.length > 0
        ? suggestions.suggestedHazards
        : suggestions.missedHazards ?? [];

    const inferred_hazards = hazardPool.slice(0, 8).map((h) => ({
      description: h.description,
      category: h.category ?? 'Field',
      severity: h.defaultSeverity ?? 3,
      likelihood: h.defaultLikelihood ?? 3,
      energy_types: (h.defaultEnergyTypes as string[]) ?? [],
      sif_indicator: matchSifIndicators(h.description.toLowerCase())[0],
      heca_category: matchHecaCategories(
        h.description.toLowerCase(),
        (h.defaultEnergyTypes as string[]) ?? [],
      ).primary.code,
      reason: h.reason ?? 'Matched from industry hazard catalog',
    }));

    const controlPool =
      suggestions.suggestedControls.length > 0
        ? suggestions.suggestedControls
        : suggestions.missedControls ?? [];

    const inferred_controls = controlPool.slice(0, 10).map((c) => ({
      description: c.description,
      control_type: c.controlType ?? 'administrative',
      linked_hazard: inferred_hazards[0]?.description ?? 'General',
      reason: c.reason ?? 'Recommended control for identified hazards',
    }));

    const energySet = new Set<string>();
    for (const h of inferred_hazards) {
      for (const e of h.energy_types) energySet.add(e);
    }
    for (const e of suggestions.requiredEnergyTypes ?? []) energySet.add(e);
    const energy_types = Array.from(energySet);

    const hecaMatch = matchHecaCategories(combined, energy_types);
    const high_energy = energy_types.some((e) => HIGH_ENERGY_TYPES.has(e));
    const sifIndicators = matchSifIndicators(combined);

    const maxSeverity = inferred_hazards.reduce(
      (m, h) => Math.max(m, h.severity),
      high_energy ? 4 : 3,
    );
    const maxLikelihood = inferred_hazards.reduce(
      (m, h) => Math.max(m, h.likelihood),
      high_energy ? 4 : 3,
    );
    const roughSif =
      maxSeverity * 5 +
      maxLikelihood * 4 +
      (high_energy ? 20 : 0) +
      sifIndicators.length * 8;
    const sifCategory = categoryFromScore(Math.min(100, roughSif));
    const sifApplies =
      sifIndicators.length > 0 ||
      high_energy ||
      maxSeverity >= 4 ||
      maxLikelihood >= 4;

    const job_steps =
      tokenize(taskText).length > 5
        ? this.inferStepsFromText(input)
        : [input.title];

    return {
      job_steps,
      inferred_hazards,
      inferred_controls,
      energy_types,
      heca_assessment: {
        primary_category: hecaMatch.primary.code,
        primary_label: hecaMatch.primary.label,
        secondary_categories: hecaMatch.secondary,
        high_energy,
        narrative: high_energy
          ? `High-energy work detected (${
              energy_types.filter((e) => HIGH_ENERGY_TYPES.has(e)).join(', ') ||
              'multiple sources'
            }). HECA focus: ${hecaMatch.primary.label}.`
          : `Primary HECA category: ${
              hecaMatch.primary.label
            }. Review controls for ${hecaMatch.primary.label.toLowerCase()} exposures.`,
      },
      sif_protocol: {
        applies: sifApplies,
        category: sifCategory,
        indicators: sifIndicators.map(
          (code) => SIF_INDICATORS.find((i) => i.code === code)?.label ?? code,
        ),
        narrative: sifApplies
          ? `SIF protocol applies — ${
              sifIndicators.length
                ? `indicators: ${sifIndicators.join(', ')}`
                : 'high energy or elevated risk profile'
            }.`
          : 'Routine work profile — standard hazard controls apply; elevated SIF protocol not indicated from scope alone.',
        requires_supervisor_review:
          sifCategory === 'high' || sifCategory === 'critical' || high_energy,
      },
      scope_fit_summary: sifApplies
        ? `Scope fits SIF review criteria (${sifCategory}) and HECA category "${hecaMatch.primary.label}". Complete formal controls before work.`
        : `Scope aligns with HECA "${hecaMatch.primary.label}" — routine controls sufficient unless field conditions change.`,
      warnings: [
        ...(suggestions.warnings ?? []),
        ...(suggestions.hecaNotes ?? []),
        ...(suggestions.gapWarnings ?? []),
      ].slice(0, 8),
    };
  }

  private inferStepsFromText(input: SifHecaScopeInput): string[] {
    const raw = input.workScope ?? input.jobDescription ?? input.title;
    const parts = raw
      .split(/[;\n]+|(?:\d+\.\s)|(?:\s+then\s+)/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 8);
    return parts.length >= 2
      ? parts.slice(0, 8)
      : [
          input.title,
          ...(parts.length
            ? parts
            : ['Mobilize and set up', 'Execute work', 'Demobilize']),
        ];
  }

  private finalize(
    out: SifHecaAssessmentCopilotOutput,
    engines: string[],
    combined: string,
  ): SifHecaScopeAnalysisResult {
    const max_severity = out.inferred_hazards.reduce(
      (m, h) => Math.max(m, h.severity ?? 3),
      3,
    );
    const max_likelihood = out.inferred_hazards.reduce(
      (m, h) => Math.max(m, h.likelihood ?? 3),
      3,
    );
    return {
      ...out,
      engine: engines,
      combined_text: combined,
      max_severity,
      max_likelihood,
      energy_types: out.energy_types?.length
        ? out.energy_types
        : [
            ...new Set(
              out.inferred_hazards.flatMap((h) => h.energy_types ?? []),
            ),
          ],
    };
  }
}
