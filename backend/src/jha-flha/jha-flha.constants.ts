import { JhaEnergyType } from '@prisma/client';
import {
  getCompleteCatalog,
  CONTROL_CLASS_LOOKUP,
} from './jha-library-catalog';

export const ENERGY_WHEEL: Array<{
  type: JhaEnergyType;
  label: string;
  requiredControlTypes: string[];
  highExposureThreshold: number;
}> = [
  {
    type: 'gravity',
    label: 'Gravity / falling',
    requiredControlTypes: ['engineering', 'administrative'],
    highExposureThreshold: 3,
  },
  {
    type: 'mechanical',
    label: 'Mechanical / moving parts',
    requiredControlTypes: ['engineering', 'administrative'],
    highExposureThreshold: 3,
  },
  {
    type: 'electrical',
    label: 'Electrical',
    requiredControlTypes: ['engineering', 'administrative'],
    highExposureThreshold: 2,
  },
  {
    type: 'pressure',
    label: 'Pressure / pneumatic',
    requiredControlTypes: ['engineering'],
    highExposureThreshold: 2,
  },
  {
    type: 'thermal',
    label: 'Thermal',
    requiredControlTypes: ['ppe', 'administrative'],
    highExposureThreshold: 3,
  },
  {
    type: 'chemical',
    label: 'Chemical',
    requiredControlTypes: ['substitution', 'engineering', 'ppe'],
    highExposureThreshold: 2,
  },
  {
    type: 'radiation',
    label: 'Radiation',
    requiredControlTypes: ['engineering', 'administrative'],
    highExposureThreshold: 2,
  },
  {
    type: 'biological',
    label: 'Biological',
    requiredControlTypes: ['ppe', 'administrative'],
    highExposureThreshold: 2,
  },
  {
    type: 'motion',
    label: 'Motion / ergonomics',
    requiredControlTypes: ['administrative', 'ppe'],
    highExposureThreshold: 3,
  },
];

const catalog = getCompleteCatalog();
export const DEFAULT_HAZARD_SEED = catalog.hazards;
export const DEFAULT_CONTROL_SEED = catalog.controls;

/** Keyword lookup for DB-backed hazards (keywords are not persisted). */
export const HAZARD_KEYWORD_LOOKUP: Map<string, string[]> = (() => {
  const map = new Map<string, string[]>();
  for (const h of catalog.hazards) {
    if (h.keywords?.length)
      map.set(h.description.toLowerCase().trim(), h.keywords);
  }
  return map;
})();

export { CONTROL_CLASS_LOOKUP };

export function industryPackSeeds(_packIds?: string[]) {
  return getCompleteCatalog();
}
