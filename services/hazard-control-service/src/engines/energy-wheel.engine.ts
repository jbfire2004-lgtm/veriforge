import type { EnergyDetection, EnergyType } from '../types';

const ENERGY_KEYWORDS: Record<EnergyType, string[]> = {
  gravity: ['fall', 'drop', 'height', 'overhead', 'gravity', 'crush'],
  motion: ['moving', 'vehicle', 'traffic', 'motion', 'struck-by'],
  mechanical: ['pinch', 'shear', 'rotating', 'mechanical', 'conveyor', 'gear'],
  electrical: ['electric', 'shock', 'arc', 'energized', 'voltage'],
  chemical: ['chemical', 'vapor', 'fume', 'sds', 'toxic', 'corrosive'],
  thermal: ['heat', 'burn', 'fire', 'thermal', 'hot', 'cold', 'frostbite'],
  pressure: ['pressure', 'hydraulic', 'pneumatic', 'steam', 'compressed'],
  radiation: ['radiation', 'laser', 'uv', 'ionizing'],
  biological: ['biological', 'bloodborne', 'pathogen', 'mold', 'virus'],
};

const DEFAULT_CONTROLS: Record<EnergyType, string[]> = {
  gravity: ['Fall protection systems', 'Barricades and exclusion zones'],
  motion: ['Spotter and communication protocol', 'Vehicle/equipment separation'],
  mechanical: ['Machine guarding', 'Lockout/tagout before maintenance'],
  electrical: ['De-energize and LOTO', 'Insulated tools and PPE'],
  chemical: ['SDS review and spill kit', 'Ventilation and compatible storage'],
  thermal: ['Hot work permit', 'Thermal PPE and fire watch'],
  pressure: ['Pressure relief verification', 'Hose and fitting inspection'],
  radiation: ['Time-distance-shielding', 'Radiation area controls'],
  biological: ['Universal precautions', 'Hygiene and vaccination where required'],
};

export class EnergyWheelEngine {
  detectFromText(description: string): EnergyDetection[] {
    const lower = description.toLowerCase();
    const results: EnergyDetection[] = [];

    for (const [type, keywords] of Object.entries(ENERGY_KEYWORDS) as [EnergyType, string[]][]) {
      const hits = keywords.filter((k) => lower.includes(k)).length;
      if (hits === 0) continue;
      const exposureLevel = Math.min(5, hits + 1);
      const highEnergyFlag =
        ['electrical', 'pressure', 'chemical', 'gravity'].includes(type) && exposureLevel >= 3;
      results.push({
        energyType: type,
        exposureLevel,
        highEnergyFlag,
        severityScore: Math.min(5, exposureLevel + (highEnergyFlag ? 1 : 0)),
        autoDetected: true,
      });
    }
    return results;
  }

  suggestControlDescriptions(energyTypes: EnergyType[]): string[] {
    const out: string[] = [];
    for (const t of energyTypes) {
      out.push(...(DEFAULT_CONTROLS[t] ?? []));
    }
    return [...new Set(out)];
  }

  aggregateEnergySeverity(energies: EnergyDetection[]): number {
    if (energies.length === 0) return 0;
    return Math.max(...energies.map((e) => e.severityScore));
  }
}

export const energyWheelEngine = new EnergyWheelEngine();
