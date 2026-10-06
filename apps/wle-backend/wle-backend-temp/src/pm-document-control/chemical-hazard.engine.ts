import { Injectable } from '@nestjs/common';

export type ExtractedSdsHazards = {
  hazards: string[];
  controls: string[];
  ppeRequirements: string[];
  firstAid: Record<string, unknown>;
  handlingStorage: Record<string, unknown>;
  whmisClassification: Record<string, unknown>;
  chemicalRiskScore: number;
};

@Injectable()
export class ChemicalHazardEngine {
  extract(doc: {
    hazardClasses?: unknown;
    whmisJson?: unknown;
    metadataJson?: unknown;
    casNumbers?: unknown;
  }): ExtractedSdsHazards {
    const meta = (doc.metadataJson ?? {}) as Record<string, unknown>;
    const whmis = (doc.whmisJson ?? {}) as Record<string, unknown>;

    const hazardClasses = Array.isArray(doc.hazardClasses)
      ? (doc.hazardClasses as string[])
      : [];
    const metaHazards = Array.isArray(meta.hazards)
      ? (meta.hazards as string[])
      : Array.isArray(meta.hazardClasses)
      ? (meta.hazardClasses as string[])
      : [];

    const hazards = [...new Set([...hazardClasses, ...metaHazards])];

    const controls = Array.isArray(meta.controls)
      ? (meta.controls as string[])
      : Array.isArray(meta.requiredControls)
      ? (meta.requiredControls as string[])
      : typeof meta.handling_storage === 'object' && meta.handling_storage
      ? Object.keys(meta.handling_storage as object)
      : [];

    const ppeRequirements = Array.isArray(meta.ppeRequirements)
      ? (meta.ppeRequirements as string[])
      : Array.isArray(meta.ppe)
      ? (meta.ppe as string[])
      : [];

    const firstAid =
      (meta.firstAid as Record<string, unknown>) ??
      (meta.first_aid as Record<string, unknown>) ??
      {};

    const handlingStorage =
      (meta.handlingStorage as Record<string, unknown>) ??
      (meta.handling_storage as Record<string, unknown>) ??
      (meta.handling as Record<string, unknown>) ??
      {};

    const highEnergy =
      hazards.some((h) => /flamm|oxid|corros|toxic|reactive|explos/i.test(h)) ||
      /class [bcd]/i.test(JSON.stringify(whmis));

    const chemicalRiskScore = Math.min(
      100,
      hazards.length * 12 + ppeRequirements.length * 5 + (highEnergy ? 25 : 0),
    );

    return {
      hazards,
      controls,
      ppeRequirements,
      firstAid,
      handlingStorage,
      whmisClassification: whmis,
      chemicalRiskScore,
    };
  }

  suggestedControls(hazards: string[]): string[] {
    const suggestions: string[] = [];
    for (const h of hazards) {
      if (/flamm/i.test(h)) {
        suggestions.push(
          'Eliminate ignition sources',
          'Ground/bond containers',
        );
      }
      if (/corros/i.test(h))
        suggestions.push('Acid/base PPE', 'Eyewash within 10s');
      if (/toxic|health/i.test(h))
        suggestions.push('Respiratory protection per SDS');
    }
    if (suggestions.length === 0 && hazards.length > 0) {
      suggestions.push('Review SDS Section 8 PPE', 'Implement spill kit');
    }
    return [...new Set(suggestions)];
  }
}
