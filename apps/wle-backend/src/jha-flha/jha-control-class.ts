/** CSRA / HECA control classification (Direct vs Alternative). */

export type ControlClass = 'direct' | 'alternative';

/**
 * Direct control (CSRA): targets the high-energy source, mitigates exposure when
 * installed/verified/used properly, and remains effective if a worker makes an error.
 * Alternative control: mitigates error or exposure indirectly (most admin/PPE).
 */
export function inferControlClass(
  controlType: string,
  energyTypes?: string[],
  hazardCategories?: string[],
): ControlClass {
  if (controlType === 'elimination' || controlType === 'substitution')
    return 'direct';
  if (controlType === 'engineering') {
    if (
      energyTypes?.length ||
      hazardCategories?.some((c) =>
        [
          'Electrical',
          'Pressure',
          'Fall',
          'Confined space',
          'Lifting',
          'Excavation',
        ].includes(c),
      )
    ) {
      return 'direct';
    }
    return 'direct';
  }
  return 'alternative';
}

export function controlClassLabel(cls: ControlClass): string {
  return cls === 'direct' ? 'Direct control' : 'Alternative control';
}

export function isDirectControlType(
  controlType: string,
  energyTypes?: string[],
): boolean {
  return inferControlClass(controlType, energyTypes) === 'direct';
}
