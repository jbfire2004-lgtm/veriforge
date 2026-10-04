import { Injectable } from '@nestjs/common';
import { PmSafetyEventType } from '@prisma/client';
import { EVENT_TYPE_KEYWORDS } from './pm-safety-events.constants';

@Injectable()
export class EventClassificationEngine {
  classifyType(
    description: string,
    hint?: PmSafetyEventType,
  ): {
    eventType: PmSafetyEventType;
    confidence: number;
    explainability: string[];
  } {
    if (hint && hint !== 'custom') {
      return {
        eventType: hint,
        confidence: 1,
        explainability: [`User-selected type: ${hint}`],
      };
    }
    const text = description.toLowerCase();
    let best: PmSafetyEventType = 'hazard_observation';
    let bestScore = 0;
    const explainability: string[] = [];

    for (const [type, keywords] of Object.entries(EVENT_TYPE_KEYWORDS)) {
      if (type === 'custom') continue;
      let score = 0;
      for (const kw of keywords) {
        if (text.includes(kw)) score += 2;
      }
      if (score > bestScore) {
        bestScore = score;
        best = type as PmSafetyEventType;
      }
    }
    explainability.push(`Keyword match score ${bestScore} → ${best}`);
    return {
      eventType: best,
      confidence: Math.min(1, bestScore / 6),
      explainability,
    };
  }

  suggestHecaCategory(description: string, energyHint?: string): string {
    const text = description.toLowerCase();
    if (energyHint) return energyHint;
    if (text.includes('fall') || text.includes('height'))
      return 'gravitational';
    if (text.includes('electr')) return 'electrical';
    if (text.includes('chemical') || text.includes('spill')) return 'chemical';
    if (text.includes('crane') || text.includes('lift')) return 'mechanical';
    return 'general';
  }
}
