import { Injectable } from '@nestjs/common';
import { HECA_CATEGORIES, HIGH_ENERGY_TYPES } from './sif-heca.constants';

export type HecaClassificationInput = {
  description: string;
  energyTypes: string[];
  equipmentType?: string;
  taskType?: string;
  categories: Array<{
    code: string;
    label: string;
    keywordPatterns: string[];
    energyTypes: string[];
    severityDefault: number;
  }>;
};

export type HecaClassificationOutput = {
  hecaCategoryCode: string;
  hecaCategoryLabel: string;
  severity: number;
  likelihood: number;
  hecaRiskScore: number;
  highEnergyFlag: boolean;
  requiredControls: string[];
  requiredCorrective: string[];
  explainability: Array<{ rule: string; detail: string }>;
};

@Injectable()
export class HecaClassificationEngine {
  classify(input: HecaClassificationInput): HecaClassificationOutput {
    const text = input.description.toLowerCase();
    const cats =
      input.categories.length > 0
        ? input.categories
        : HECA_CATEGORIES.map((c) => ({
            code: c.code,
            label: c.label,
            keywordPatterns: [...c.keywords],
            energyTypes: [...c.energyTypes],
            severityDefault: 3,
          }));

    let best = cats[0]!;
    let bestScore = 0;
    const explainability: HecaClassificationOutput['explainability'] = [];

    for (const cat of cats) {
      let score = 0;
      for (const kw of cat.keywordPatterns) {
        if (text.includes(String(kw).toLowerCase())) score += 3;
      }
      for (const et of input.energyTypes) {
        if (cat.energyTypes.includes(et)) score += 4;
      }
      if (score > bestScore) {
        bestScore = score;
        best = cat;
      }
    }

    explainability.push({
      rule: 'keyword_energy_match',
      detail: `Matched ${best.label} (score ${bestScore})`,
    });

    const highEnergyFlag = input.energyTypes.some((e) =>
      HIGH_ENERGY_TYPES.has(e),
    );
    const severity = Math.min(5, best.severityDefault ?? 3);
    const likelihood = highEnergyFlag ? 4 : 3;
    const hecaRiskScore = severity * likelihood;

    const requiredControls: string[] = [];
    if (highEnergyFlag) {
      requiredControls.push(
        `Apply mandatory controls for ${input.energyTypes.join(', ')} energy`,
      );
    }
    if (best.code === 'line_of_fire') {
      requiredControls.push('Establish exclusion zone and spotter');
    }

    const requiredCorrective: string[] = [];
    if (hecaRiskScore >= 15) {
      requiredCorrective.push(
        `Address ${best.label} observation before close-out`,
      );
    }

    return {
      hecaCategoryCode: best.code,
      hecaCategoryLabel: best.label,
      severity,
      likelihood,
      hecaRiskScore,
      highEnergyFlag,
      requiredControls,
      requiredCorrective,
      explainability,
    };
  }
}
