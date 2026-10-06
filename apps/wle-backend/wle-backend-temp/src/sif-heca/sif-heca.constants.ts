export const HECA_CATEGORIES = [
  {
    code: 'eyes_on_task',
    label: 'Eyes on task',
    keywords: ['distraction', 'attention', 'eyes', 'focus', 'phone'],
    energyTypes: [],
  },
  {
    code: 'line_of_fire',
    label: 'Line of fire',
    keywords: ['struck', 'swing', 'drop', 'line of fire', 'overhead', 'crane'],
    energyTypes: ['gravity', 'mechanical'],
  },
  {
    code: 'balance_fall',
    label: 'Balance / fall',
    keywords: ['fall', 'slip', 'trip', 'height', 'ladder', 'edge'],
    energyTypes: ['gravity'],
  },
  {
    code: 'body_position',
    label: 'Body position',
    keywords: ['ergonomic', 'posture', 'pinch', 'strain', 'awkward'],
    energyTypes: ['motion'],
  },
  {
    code: 'tools_equipment',
    label: 'Tools / equipment',
    keywords: ['tool', 'equipment', 'machine', 'guard', 'lockout'],
    energyTypes: ['mechanical', 'electrical'],
  },
  {
    code: 'procedures',
    label: 'Procedures',
    keywords: ['procedure', 'permit', 'shortcut', 'bypass', 'rule'],
    energyTypes: [],
  },
] as const;

export const SIF_INDICATORS = [
  { code: 'FALL_HEIGHT', label: 'Fall from height', weight: 25 },
  { code: 'STRUCK_BY', label: 'Struck-by moving object', weight: 20 },
  { code: 'CAUGHT_IN', label: 'Caught in/between', weight: 20 },
  { code: 'ELECTRICAL_CONTACT', label: 'Electrical contact', weight: 25 },
  { code: 'CONFINED_SPACE', label: 'Confined space engulfment', weight: 25 },
  { code: 'HEAVY_LIFT', label: 'Heavy lift / rigging', weight: 15 },
  {
    code: 'VEHICLE_STRIKE',
    label: 'Vehicle / mobile equipment strike',
    weight: 20,
  },
] as const;

export const HIGH_ENERGY_TYPES = new Set([
  'gravity',
  'mechanical',
  'electrical',
  'pressure',
]);

/** Energy wheel segments for SIF high-energy detection (aligned with JHA/FLHA). */
export const SIF_ENERGY_WHEEL = [
  { type: 'gravity', label: 'Gravity / falling', highEnergy: true },
  { type: 'mechanical', label: 'Mechanical / moving parts', highEnergy: true },
  { type: 'electrical', label: 'Electrical', highEnergy: true },
  { type: 'pressure', label: 'Pressure / pneumatic', highEnergy: true },
  { type: 'thermal', label: 'Thermal', highEnergy: false },
  { type: 'chemical', label: 'Chemical', highEnergy: false },
  { type: 'radiation', label: 'Radiation', highEnergy: false },
  { type: 'biological', label: 'Biological', highEnergy: false },
  { type: 'motion', label: 'Motion / ergonomics', highEnergy: false },
] as const;

export function categoryFromScore(
  score: number,
): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}
