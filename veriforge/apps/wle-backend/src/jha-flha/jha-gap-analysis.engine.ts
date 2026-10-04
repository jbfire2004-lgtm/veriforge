import type { ControlSeed, HazardSeed } from './jha-library-seed';
import { TASK_HAZARD_PROFILES } from './jha-library-catalog';

type LibraryHazardRow = HazardSeed & { id?: string };
type LibraryControlRow = ControlSeed & { id?: string };

export type GapAnalysisInput = {
  taskDescription?: string;
  locationNote?: string;
  weather?: string;
  existingHazardDescriptions: string[];
  existingHazardCategories: string[];
  existingControlDescriptions: string[];
  existingControlTypes: string[];
  existingEnergyTypes: string[];
  hazardLibrary: LibraryHazardRow[];
  controlLibrary: LibraryControlRow[];
  onFormControls?: Array<{
    controlType: string;
    description: string;
    hazardId?: string | null;
    controlClass?: ControlSeed['controlClass'];
  }>;
};

export type GapAnalysisResult = {
  missedHazards: Array<
    LibraryHazardRow & { score: number; reason: string; profileId: string }
  >;
  missedControls: Array<
    LibraryControlRow & { score: number; reason: string; profileId: string }
  >;
  requiredEnergyTypes: string[];
  matchedProfiles: string[];
  gapWarnings: string[];
  hecaNotes: string[];
};

function taskText(input: GapAnalysisInput): string {
  return [input.taskDescription, input.locationNote, input.weather]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function matchesProfile(text: string, tokens: string[]): boolean {
  return tokens.some((t) => text.includes(t.toLowerCase()));
}

export function analyzeJhaGaps(input: GapAnalysisInput): GapAnalysisResult {
  const text = taskText(input);
  const existingH = new Set(
    input.existingHazardDescriptions.map((d) => d.toLowerCase().trim()),
  );
  const existingC = new Set(
    input.existingControlDescriptions.map((d) => d.toLowerCase().trim()),
  );
  const existingCats = new Set(input.existingHazardCategories);
  const missedHazards: GapAnalysisResult['missedHazards'] = [];
  const missedControls: GapAnalysisResult['missedControls'] = [];
  const requiredEnergy = new Set<string>(input.existingEnergyTypes);
  const matchedProfiles: string[] = [];
  const gapWarnings: string[] = [];
  const hecaNotes: string[] = [];

  if (!text.trim()) {
    return {
      missedHazards: [],
      missedControls: [],
      requiredEnergyTypes: [],
      matchedProfiles: [],
      gapWarnings: [],
      hecaNotes: [],
    };
  }

  for (const profile of TASK_HAZARD_PROFILES) {
    if (!matchesProfile(text, profile.tokens)) continue;
    matchedProfiles.push(profile.id);

    for (const e of profile.energyTypes) requiredEnergy.add(e);

    const categoryCovered = profile.hazardCategories.some((c) =>
      existingCats.has(c),
    );
    const keywordCovered = profile.hazardKeywords.some((kw) =>
      input.existingHazardDescriptions.some((d) =>
        d.toLowerCase().includes(kw.toLowerCase()),
      ),
    );

    if (!categoryCovered && !keywordCovered) {
      const candidates = input.hazardLibrary
        .filter((h) => !existingH.has(h.description.toLowerCase().trim()))
        .filter(
          (h) =>
            profile.hazardCategories.includes(h.category) ||
            profile.hazardKeywords.some((kw) =>
              h.description.toLowerCase().includes(kw.toLowerCase()),
            ),
        )
        .slice(0, 3);

      for (const h of candidates) {
        missedHazards.push({
          ...h,
          score: 90,
          reason: `Task matches "${profile.label}" — this hazard is commonly required`,
          profileId: profile.id,
        });
      }

      if (candidates.length === 0) {
        gapWarnings.push(
          `Task scope suggests "${
            profile.label
          }" work — add hazards for: ${profile.hazardCategories.join(', ')}`,
        );
      }
    }

    const hasRequiredControl = profile.requiredControlCategories.some(
      (cat) =>
        input.controlLibrary.some(
          (c) =>
            existingC.has(c.description.toLowerCase().trim()) &&
            (c.hazardCategories.includes(cat) ||
              c.hazardCategories.length === 0),
        ) ||
        input.onFormControls?.some(
          (c) =>
            existingC.has(c.description.toLowerCase().trim()) &&
            input.existingHazardCategories.some((hc) =>
              profile.requiredControlCategories.includes(hc),
            ),
        ),
    );

    const controlCatOnForm = profile.requiredControlCategories.some(
      (cat) =>
        input.existingHazardCategories.includes(cat) &&
        input.existingControlDescriptions.length > 0,
    );

    if (!hasRequiredControl && !controlCatOnForm) {
      const controlCandidates = input.controlLibrary
        .filter((c) => !existingC.has(c.description.toLowerCase().trim()))
        .filter((c) =>
          profile.requiredControlCategories.some((cat) =>
            c.hazardCategories.includes(cat),
          ),
        )
        .sort((a, b) => (a.controlClass === 'direct' ? -1 : 1))
        .slice(0, 3);

      for (const c of controlCandidates) {
        missedControls.push({
          ...c,
          score: 85,
          reason: `Recommended for "${profile.label}" — ${
            c.controlClass === 'direct' ? 'direct' : 'alternative'
          } control`,
          profileId: profile.id,
        });
      }
    }

    if (profile.minDirectControls && profile.minDirectControls > 0) {
      const directOnForm =
        input.onFormControls?.filter(
          (c) =>
            c.controlClass === 'direct' ||
            c.controlType === 'elimination' ||
            c.controlType === 'substitution' ||
            c.controlType === 'engineering',
        ).length ?? 0;
      if (
        directOnForm < profile.minDirectControls &&
        profile.hazardCategories.some((c) => existingCats.has(c))
      ) {
        hecaNotes.push(
          `CSRA/HECA: "${profile.label}" high-energy work should have a direct control (energy-targeted, error-tolerant) — consider engineering or elimination`,
        );
      }
    }
  }

  for (const e of requiredEnergy) {
    if (!input.existingEnergyTypes.includes(e)) {
      gapWarnings.push(
        `Energy wheel: select "${e}" based on task scope and identified hazards`,
      );
    }
  }

  const dedupe = <T extends { description: string }>(items: T[]): T[] => {
    const seen = new Set<string>();
    return items.filter((i) => {
      const k = i.description.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  return {
    missedHazards: dedupe(missedHazards)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12),
    missedControls: dedupe(missedControls)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12),
    requiredEnergyTypes: Array.from(requiredEnergy),
    matchedProfiles,
    gapWarnings,
    hecaNotes,
  };
}
