import { Injectable } from '@nestjs/common';

export type AttachmentCailTags = {
  autoTags: string[];
  hazardDetected: boolean;
  equipmentIdentified: boolean;
  sceneClassification: string;
  confidence: number;
};

@Injectable()
export class PmAttachmentsCailIntelligenceService {
  analyze(input: {
    fileName?: string;
    mimeType?: string;
    moduleType?: string;
    annotationCount?: number;
  }): AttachmentCailTags {
    const name = (input.fileName ?? '').toLowerCase();
    const mime = (input.mimeType ?? '').toLowerCase();
    const autoTags: string[] = [];

    if (mime.startsWith('image/')) autoTags.push('photo');
    if (mime === 'application/pdf') autoTags.push('document');
    if (mime.startsWith('video/')) autoTags.push('video');
    if (input.moduleType) autoTags.push(input.moduleType);

    const hazardKeywords = [
      'hazard',
      'spill',
      'leak',
      'fire',
      'fall',
      'damage',
      'unsafe',
      'deficiency',
      'violation',
    ];
    const equipmentKeywords = [
      'crane',
      'forklift',
      'excavator',
      'loader',
      'scaffold',
      'ladder',
      'ppe',
      'helmet',
      'harness',
      'equipment',
    ];

    const hazardDetected = hazardKeywords.some((k) => name.includes(k));
    const equipmentIdentified = equipmentKeywords.some((k) => name.includes(k));

    if (hazardDetected) autoTags.push('hazard_suspected');
    if (equipmentIdentified) autoTags.push('equipment_visible');

    let sceneClassification = 'general_site';
    if (hazardDetected) sceneClassification = 'hazard_documentation';
    else if (equipmentIdentified)
      sceneClassification = 'equipment_documentation';
    else if (input.moduleType === 'inspection')
      sceneClassification = 'inspection_evidence';
    else if (input.moduleType === 'incident')
      sceneClassification = 'incident_scene';

    const confidence =
      0.55 +
      (hazardDetected ? 0.15 : 0) +
      (equipmentIdentified ? 0.12 : 0) +
      (input.annotationCount ? 0.1 : 0);

    return {
      autoTags: [...new Set(autoTags)],
      hazardDetected,
      equipmentIdentified,
      sceneClassification,
      confidence: Math.min(0.95, confidence),
    };
  }
}
