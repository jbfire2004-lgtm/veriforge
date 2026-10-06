import { Injectable } from '@nestjs/common';
import { PmEnergyControlState, PmUnifiedEnergyType } from '@prisma/client';

export type EnergyWheelEntry = {
  energyType: PmUnifiedEnergyType;
  controlState: PmEnergyControlState;
  existingControls: string[];
  missingOrFailedControls: string[];
  highEnergy: boolean;
};

export const ENERGY_WHEEL_TYPES: Array<{
  type: PmUnifiedEnergyType;
  label: string;
  defaultHighEnergy: boolean;
}> = [
  { type: 'gravity', label: 'Gravity', defaultHighEnergy: true },
  { type: 'motion', label: 'Motion', defaultHighEnergy: false },
  { type: 'mechanical', label: 'Mechanical', defaultHighEnergy: true },
  { type: 'electrical', label: 'Electrical', defaultHighEnergy: true },
  { type: 'chemical', label: 'Chemical', defaultHighEnergy: true },
  { type: 'thermal', label: 'Thermal', defaultHighEnergy: false },
  { type: 'pressure', label: 'Pressure', defaultHighEnergy: true },
  { type: 'radiation', label: 'Radiation', defaultHighEnergy: true },
  { type: 'biological', label: 'Biological', defaultHighEnergy: false },
];

@Injectable()
export class SmsEnergyWheelService {
  catalog() {
    return {
      energyTypes: ENERGY_WHEEL_TYPES,
      controlStates: [
        'controlled',
        'uncontrolled',
        'partially_controlled',
      ] as PmEnergyControlState[],
    };
  }

  suggestControls(energyTypes: PmUnifiedEnergyType[]): string[] {
    const suggestions: string[] = [];
    for (const t of energyTypes) {
      switch (t) {
        case 'gravity':
          suggestions.push('fall_protection', 'guardrails', 'exclusion_zone');
          break;
        case 'electrical':
          suggestions.push(
            'lockout_tagout',
            'insulated_tools',
            'arc_rated_ppe',
          );
          break;
        case 'chemical':
          suggestions.push('sds_available', 'ventilation', 'spill_kit');
          break;
        case 'pressure':
          suggestions.push('pressure_relief', 'bleed_down_procedure');
          break;
        case 'mechanical':
          suggestions.push('machine_guarding', 'lockout_tagout');
          break;
        default:
          suggestions.push('engineering_controls', 'administrative_controls');
      }
    }
    return [...new Set(suggestions)];
  }

  buildProfile(entries: EnergyWheelEntry[]) {
    const highEnergy = entries.some((e) => e.highEnergy);
    const uncontrolled = entries.filter(
      (e) =>
        e.controlState === 'uncontrolled' ||
        e.controlState === 'partially_controlled',
    );
    const gaps = entries.flatMap((e) => e.missingOrFailedControls);

    return {
      entries,
      highEnergy,
      uncontrolledCount: uncontrolled.length,
      systemicGaps: [...new Set(gaps)],
      suggestedControls: this.suggestControls(entries.map((e) => e.energyType)),
    };
  }

  inferFromText(text: string): PmUnifiedEnergyType[] {
    const lower = text.toLowerCase();
    const found: PmUnifiedEnergyType[] = [];
    const rules: Array<[RegExp, PmUnifiedEnergyType]> = [
      [/fall|height|ladder|scaffold|gravity/, 'gravity'],
      [/electric|shock|arc|energized/, 'electrical'],
      [/chemical|spill|hazmat|solvent/, 'chemical'],
      [/pressure|steam|pipe|vessel/, 'pressure'],
      [/crush|pinch|rotating|machine/, 'mechanical'],
      [/heat|burn|thermal|fire/, 'thermal'],
      [/radiation|x-ray/, 'radiation'],
      [/vehicle|moving|traffic|motion/, 'motion'],
    ];
    for (const [re, type] of rules) {
      if (re.test(lower)) found.push(type);
    }
    return [...new Set(found)];
  }
}
