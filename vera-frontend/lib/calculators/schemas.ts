import { z } from "zod";

export const fallClearanceSchema = z.object({
  lanyardLengthM: z.coerce.number().positive("Must be positive"),
  decelerationDistanceM: z.coerce.number().min(0),
  harnessStretchM: z.coerce.number().min(0),
  dRingHeightM: z.coerce.number().min(0),
  safetyMarginM: z.coerce.number().min(0).optional(),
});

export const slingAngleSchema = z.object({
  loadWeightKg: z.coerce.number().positive("Load must be positive"),
  slingAngleDeg: z.coerce
    .number()
    .gt(0, "Angle must be > 0°")
    .lt(90, "Angle must be < 90° from horizontal"),
});

export const craneRadiusSchema = z.object({
  boomLengthM: z.coerce.number().positive("Boom length must be positive"),
  boomAngleDeg: z.coerce
    .number()
    .gte(0, "Angle 0–90°")
    .lte(90, "Angle 0–90°"),
});

export const confinedSpaceSchema = z.object({
  volumeM3: z.coerce.number().positive("Volume must be positive"),
  ventilationRateM3PerMin: z.coerce.number().positive("Rate must be positive"),
  targetAirChanges: z.coerce.number().min(1).max(20).optional(),
});

export type FallClearanceForm = z.infer<typeof fallClearanceSchema>;
export type SlingAngleForm = z.infer<typeof slingAngleSchema>;
export type CraneRadiusForm = z.infer<typeof craneRadiusSchema>;
export type ConfinedSpaceForm = z.infer<typeof confinedSpaceSchema>;
