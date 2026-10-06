import { Injectable } from '@nestjs/common';
import type { ClearanceParamsDto } from './dto/configuration-instance.dto';

export type ParsedManualResult = {
  clearanceParams: Partial<ClearanceParamsDto>;
  confidence: number;
  warnings: string[];
  model: string;
};

/**
 * AI / heuristic parser for manufacturer manual text → clearanceParams.
 * Replace `parseWithHeuristic` body with LLM call when AI gateway is wired;
 * keep the same return shape so ingestManual stays stable.
 */
@Injectable()
export class EquipmentManualAiParserService {
  async parseManualText(text: string): Promise<ParsedManualResult> {
    // Downstream: POST to AIOrientation-style / equipment parser with schema.
    return this.parseWithHeuristic(text);
  }

  private parseWithHeuristic(text: string): ParsedManualResult {
    const lower = text.toLowerCase();
    const clearanceParams: Partial<ClearanceParamsDto> = {};
    const warnings: string[] = [
      'Heuristic extraction — verify against manufacturer datasheet before approving.',
    ];

    const freefall =
      lower.match(
        /(?:max(?:imum)?\s*)?free\s*fall[^0-9]{0,20}(\d+(?:\.\d+)?)\s*m\b/,
      ) ||
      lower.match(
        /(?:lanyard)\s*(?:length)?[^0-9]{0,20}(\d+(?:\.\d+)?)\s*m\b/,
      );
    if (freefall) clearanceParams.maxFreeFallM = parseFloat(freefall[1]);

    const decel = lower.match(
      /(?:decelerat|elongat|max(?:imum)?\s*extension)[^0-9]{0,24}(\d+(?:\.\d+)?)\s*m\b/,
    );
    if (decel) clearanceParams.decelerationDistanceM = parseFloat(decel[1]);

    const stretch = lower.match(
      /(?:harness\s*stretch)[^0-9]{0,20}(\d+(?:\.\d+)?)\s*m\b/,
    );
    if (stretch) clearanceParams.harnessStretchM = parseFloat(stretch[1]);

    const payout = lower.match(
      /(?:lifeline|srl)\s*payout[^0-9]{0,20}(\d+(?:\.\d+)?)\s*m\b/,
    );
    if (payout) clearanceParams.lifelinePayoutM = parseFloat(payout[1]);

    const deflect = lower.match(
      /(?:anchor)\s*deflect[^0-9]{0,20}(\d+(?:\.\d+)?)\s*m\b/,
    );
    if (deflect) clearanceParams.anchorDeflectionM = parseFloat(deflect[1]);

    const margin = lower.match(
      /(?:safety\s*margin|clearance\s*margin)[^0-9]{0,20}(\d+(?:\.\d+)?)\s*m\b/,
    );
    if (margin) clearanceParams.safetyMarginM = parseFloat(margin[1]);

    const keys = Object.keys(clearanceParams).length;
    const confidence = Math.min(0.95, 0.25 + keys * 0.12);

    return {
      clearanceParams,
      confidence,
      warnings,
      model: 'vera-equipment-manual-heuristic-v1',
    };
  }
}
