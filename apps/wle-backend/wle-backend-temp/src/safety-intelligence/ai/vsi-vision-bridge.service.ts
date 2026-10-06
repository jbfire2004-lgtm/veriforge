import { Injectable } from '@nestjs/common';
import { VisionService } from '../../modules/vision/vision.service';

@Injectable()
export class VsiVisionBridgeService {
  constructor(private readonly vision: VisionService) {}

  async analyzeSafetyPhoto(input: {
    caption?: string;
    ocrText?: string;
    imageUrl?: string;
    companyId?: number;
    projectId?: number;
  }) {
    const combinedText = [input.caption, input.ocrText]
      .filter(Boolean)
      .join('\n');

    const vision = await this.vision.analyzeInspection({
      ocrText: combinedText || 'safety site photo',
      companyId: input.companyId,
      projectId: input.projectId,
      imageHints: {
        hazards: input.caption ? [input.caption] : undefined,
        damageTypes: visionDamageHints(combinedText),
      },
    });

    const hazards = [
      ...vision.visual.hazards,
      ...vision.classification.tags,
      ...vision.fields
        .filter((f) => /hazard|risk|violation|unsafe/i.test(f.key))
        .map((f) => `${f.key}: ${f.value}`),
    ];

    const atRisk =
      hazards.length > 0 ||
      vision.reviewRequired ||
      vision.fraud.score > 60 ||
      /unsafe|hazard|violation|damage|fail/i.test(combinedText);

    return {
      engine: 'vera-vision' as const,
      vision,
      hazards: [...new Set(hazards)].slice(0, 10),
      suggestedPolarity: atRisk ? ('at_risk' as const) : ('safe' as const),
      suggestedSeverity: severityFromVision(vision, combinedText),
      ocrFullText: vision.ocr.fullText,
      suggestedCaption:
        input.caption ||
        vision.summary.bullets[0] ||
        vision.fields.find((f) => f.key === 'finding')?.value,
      riskCategory: mapRiskCategory(vision.classification.category),
    };
  }
}

function visionDamageHints(text: string): string[] {
  const hints: string[] = [];
  if (/crack|damage|broken|leak/i.test(text)) hints.push('structural_damage');
  if (/ppe|helmet|harness|glasses/i.test(text)) hints.push('ppe');
  if (/housekeeping|clutter|trip/i.test(text)) hints.push('housekeeping');
  return hints;
}

function severityFromVision(
  vision: Awaited<ReturnType<VisionService['analyzeInspection']>>,
  text: string,
): 'low' | 'medium' | 'high' | 'critical' {
  if (/critical|sif|fatality|death/i.test(text)) return 'critical';
  if (vision.fraud.score > 70 || /serious|major|stop work/i.test(text)) {
    return 'high';
  }
  if (vision.reviewRequired || vision.visual.hazards.length > 0)
    return 'medium';
  return 'low';
}

function mapRiskCategory(category: string): string | undefined {
  const c = category.toLowerCase();
  if (c.includes('ppe')) return 'ppe';
  if (c.includes('equip')) return 'equipment';
  if (c.includes('behavior')) return 'behavior';
  if (c.includes('env')) return 'environment';
  return 'other';
}
