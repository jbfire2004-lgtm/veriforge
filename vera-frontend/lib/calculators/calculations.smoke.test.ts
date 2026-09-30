import { describe, expect, it } from "vitest";
import {
  calcCraneRadius,
  calcConfinedSpaceVentilation,
  calcFallClearance,
  calcSlingAngleLoad,
} from "./calculations";

describe("calcFallClearance", () => {
  it("sums components and default safety margin", () => {
    const r = calcFallClearance({
      lanyardLengthM: 1.8,
      decelerationDistanceM: 1.07,
      harnessStretchM: 0.3,
      dRingHeightM: 1.5,
    });
    expect(r.clearanceM).toBeCloseTo(5.57, 2);
  });
});

describe("calcSlingAngleLoad", () => {
  it("computes tension for 45° two-leg hitch", () => {
    const r = calcSlingAngleLoad({ loadWeightKg: 1000, slingAngleDeg: 45 });
    expect(r.tensionPerLegKg).toBeCloseTo(707.1, 0);
  });
});

describe("calcCraneRadius", () => {
  it("uses cosine of boom angle", () => {
    const r = calcCraneRadius({ boomLengthM: 30, boomAngleDeg: 60 });
    expect(r.radiusM).toBeCloseTo(15, 2);
  });
});

describe("calcConfinedSpaceVentilation", () => {
  it("computes minutes for air changes", () => {
    const r = calcConfinedSpaceVentilation({
      volumeM3: 50,
      ventilationRateM3PerMin: 10,
      targetAirChanges: 4,
    });
    expect(r.timeMinutes).toBe(20);
  });
});
