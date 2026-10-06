import { Injectable } from '@nestjs/common';
import { TrainingStandard, TrainingStandardKind } from '@prisma/client';

export interface StandardsMatchInput {
  courseStandardKeys: string[];
  contentText?: string | null;
  certificationName?: string | null;
  catalogStandards: TrainingStandard[];
}

export interface StandardsMatchResult {
  matched: string[];
  missing: string[];
  score: number;
  byKind: Record<string, string[]>;
}

@Injectable()
export class StandardsMatchingEngine {
  match(input: StandardsMatchInput): StandardsMatchResult {
    const requiredCodes = new Set(input.courseStandardKeys);
    const content = [input.contentText ?? '', input.certificationName ?? '']
      .join(' ')
      .toLowerCase();

    const matched = new Set<string>(input.courseStandardKeys);
    const byKind: Record<string, string[]> = {};

    for (const std of input.catalogStandards) {
      if (!std.active) continue;
      const hit =
        requiredCodes.has(std.code) ||
        std.keywords.some((k) => content.includes(k.toLowerCase()));
      if (hit) {
        matched.add(std.code);
        const kind = std.kind;
        byKind[kind] = byKind[kind] ?? [];
        if (!byKind[kind].includes(std.code)) byKind[kind].push(std.code);
      }
    }

    const csaRequired = input.catalogStandards
      .filter((s) => s.kind === TrainingStandardKind.CSA && s.active)
      .map((s) => s.code);
    const missing = csaRequired.filter((c) => !matched.has(c));

    const total = Math.max(csaRequired.length, 1);
    const score = Math.round(
      (matched.size / (matched.size + missing.length || 1)) * 100,
    );

    return {
      matched: [...matched],
      missing,
      score: Math.min(100, score),
      byKind,
    };
  }
}
