import { env } from '../config/env';
import type { ExtractedControl, ExtractedHazard } from '../types';

const WHMIS_PATTERNS: Array<{ pattern: RegExp; code: string; category: string }> = [
  { pattern: /flammab/i, code: 'FLAMMABLE', category: 'physical' },
  { pattern: /oxidiz/i, code: 'OXIDIZER', category: 'physical' },
  { pattern: /corros/i, code: 'CORROSIVE', category: 'health' },
  { pattern: /toxic|poison/i, code: 'TOXIC', category: 'health' },
  { pattern: /carcinogen/i, code: 'CARCINOGEN', category: 'health' },
  { pattern: /irritant/i, code: 'IRRITANT', category: 'health' },
  { pattern: /compressed\s*gas/i, code: 'COMPRESSED_GAS', category: 'physical' },
  { pattern: /environment/i, code: 'ENVIRONMENTAL', category: 'environmental' },
];

export class HazardExtractionEngine {
  extract(input: {
    whmisClassification?: string | null;
    handlingStorage?: unknown;
    firstAid?: unknown;
    casNumber?: string | null;
  }): ExtractedHazard[] {
    const hazards: ExtractedHazard[] = [];
    const seen = new Set<string>();

    const add = (code: string, category: string, description: string, source: string) => {
      const key = `${code}:${description}`;
      if (seen.has(key)) return;
      seen.add(key);
      hazards.push({ code, category, description, source });
    };

    if (input.whmisClassification) {
      for (const { pattern, code, category } of WHMIS_PATTERNS) {
        if (pattern.test(input.whmisClassification)) {
          add(code, category, input.whmisClassification, 'whmis_classification');
        }
      }
      if (hazards.length === 0) {
        add('GENERAL', 'health', input.whmisClassification, 'whmis_classification');
      }
    }

    const handlingText = jsonToText(input.handlingStorage);
    for (const { pattern, code, category } of WHMIS_PATTERNS) {
      if (pattern.test(handlingText)) {
        add(code, category, `Detected in handling/storage`, 'handling_storage');
      }
    }

    const firstAidText = jsonToText(input.firstAid);
    if (/eye|skin|inhal/i.test(firstAidText)) {
      add('EXPOSURE_ROUTE', 'health', 'Exposure routes documented in first aid', 'first_aid');
    }

    if (input.casNumber) {
      add('CAS', 'identifier', `CAS ${input.casNumber}`, 'cas_number');
    }

    return hazards;
  }
}

export class ControlExtractionEngine {
  extract(input: {
    ppeRequirements?: unknown;
    handlingStorage?: unknown;
  }): ExtractedControl[] {
    const controls: ExtractedControl[] = [];
    const seen = new Set<string>();

    const add = (type: string, description: string, source: string) => {
      const key = `${type}:${description}`;
      if (seen.has(key)) return;
      seen.add(key);
      controls.push({ type, description, source });
    };

    const ppe = input.ppeRequirements;
    if (Array.isArray(ppe)) {
      for (const item of ppe) {
        if (typeof item === 'string') add('ppe', item, 'ppe_requirements');
        else if (item && typeof item === 'object' && 'type' in item) {
          const o = item as { type?: string; description?: string };
          add('ppe', o.description ?? o.type ?? String(item), 'ppe_requirements');
        }
      }
    } else if (ppe && typeof ppe === 'object') {
      for (const [key, value] of Object.entries(ppe as Record<string, unknown>)) {
        if (value) add('ppe', `${key}: ${String(value)}`, 'ppe_requirements');
      }
    }

    const handling = input.handlingStorage;
    if (handling && typeof handling === 'object') {
      const h = handling as Record<string, unknown>;
      if (h.ventilation) add('engineering', `Ventilation: ${String(h.ventilation)}`, 'handling_storage');
      if (h.spill_response) add('spill', String(h.spill_response), 'handling_storage');
      if (h.storage) add('storage', String(h.storage), 'handling_storage');
      if (h.handling) add('handling', String(h.handling), 'handling_storage');
    }

    const handlingText = jsonToText(handling);
    if (/gloves|respirator|eye\s*protection|face\s*shield/i.test(handlingText)) {
      add('ppe', 'PPE referenced in handling instructions', 'handling_storage');
    }

    return controls;
  }
}

export class ExpiryEngine {
  isExpired(expiryDate: Date | null, now = new Date()): boolean {
    if (!expiryDate) return false;
    return expiryDate.getTime() < now.getTime();
  }

  isExpiringSoon(expiryDate: Date | null, now = new Date()): boolean {
    if (!expiryDate) return false;
    const threshold = now.getTime() + env.expiryWarningDays * 24 * 60 * 60 * 1000;
    return expiryDate.getTime() <= threshold && expiryDate.getTime() > now.getTime();
  }
}

export class ZoneEnforcementEngine {
  evaluate(input: {
    requiredSdsIds: string[];
    acknowledgedSdsIds: Set<string>;
    expiredSdsIds: Set<string>;
  }): { compliant: boolean; missingSds: string[]; expiredSds: string[] } {
    const missingSds = input.requiredSdsIds.filter((id) => !input.acknowledgedSdsIds.has(id));
    const expiredSds = input.requiredSdsIds.filter((id) => input.expiredSdsIds.has(id));

    return {
      compliant: missingSds.length === 0 && expiredSds.length === 0,
      missingSds,
      expiredSds,
    };
  }
}

function jsonToText(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

export const hazardExtractionEngine = new HazardExtractionEngine();
export const controlExtractionEngine = new ControlExtractionEngine();
export const expiryEngine = new ExpiryEngine();
export const zoneEnforcementEngine = new ZoneEnforcementEngine();
