/** Pure calculation helpers for Vera Hub safety calculators. */

export type FallClearanceResult = {
  clearanceM: number;
  formula: string;
};

export function calcFallClearance(input: {
  lanyardLengthM: number;
  decelerationDistanceM: number;
  harnessStretchM: number;
  dRingHeightM: number;
  safetyMarginM?: number;
}): FallClearanceResult {
  const margin = input.safetyMarginM ?? 0.9;
  const clearanceM =
    input.lanyardLengthM +
    input.decelerationDistanceM +
    input.harnessStretchM +
    input.dRingHeightM +
    margin;
  return {
    clearanceM,
    formula:
      "Clearance = lanyard + deceleration + harness stretch + D-ring height + safety margin (default 0.9 m)",
  };
}

export type SlingAngleResult = {
  tensionPerLegKg: number;
  tensionPerLegLb: number;
  formula: string;
};

export function calcSlingAngleLoad(input: {
  loadWeightKg: number;
  slingAngleDeg: number;
  legs?: number;
}): SlingAngleResult {
  const legs = input.legs ?? 2;
  const rad = (input.slingAngleDeg * Math.PI) / 180;
  const sin = Math.sin(rad);
  if (sin <= 0) {
    throw new Error("Sling angle must be greater than 0°");
  }
  const tensionPerLegKg = input.loadWeightKg / (legs * sin);
  return {
    tensionPerLegKg,
    tensionPerLegLb: tensionPerLegKg * 2.20462,
    formula: `T (per leg) = Load ÷ (${legs} × sin θ), θ measured from horizontal`,
  };
}

export type CraneRadiusResult = {
  radiusM: number;
  formula: string;
};

export function calcCraneRadius(input: {
  boomLengthM: number;
  boomAngleDeg: number;
}): CraneRadiusResult {
  const rad = (input.boomAngleDeg * Math.PI) / 180;
  const radiusM = input.boomLengthM * Math.cos(rad);
  return {
    radiusM,
    formula: "Radius = boom length × cos(θ), θ measured from horizontal",
  };
}

export type ConfinedSpaceVentResult = {
  timeMinutes: number;
  airChanges: number;
  formula: string;
};

export function calcConfinedSpaceVentilation(input: {
  volumeM3: number;
  ventilationRateM3PerMin: number;
  targetAirChanges?: number;
}): ConfinedSpaceVentResult {
  const changes = input.targetAirChanges ?? 4;
  if (input.ventilationRateM3PerMin <= 0) {
    throw new Error("Ventilation rate must be greater than zero");
  }
  const timeMinutes = (input.volumeM3 * changes) / input.ventilationRateM3PerMin;
  return {
    timeMinutes,
    airChanges: changes,
    formula: "Time (min) = (volume × target air changes) ÷ ventilation rate",
  };
}
