/** Shared types for Fall Clearance workspace (aligned with backend DTOs). */

export type ClearanceParams = {
  maxFreeFallM: number;
  decelerationDistanceM: number;
  harnessStretchM: number;
  lifelinePayoutM: number;
  anchorDeflectionM: number;
  safetyMarginM: number;
};

export type EquipmentProfile = {
  id: string;
  type: string;
  manufacturer: string;
  model: string;
  standardRefs: string[];
  clearanceParams: ClearanceParams;
  status: string;
};

export type ConfigurationInstance = {
  id?: string;
  siteId?: string;
  projectId?: string;
  workerMassKg: number;
  anchorHeightM: number;
  workSurfaceHeightM: number;
  horizontalOffsetM?: number;
  equipmentId: string;
  environment?: string;
};

export type ClearanceStatus = "PASS" | "WARNING" | "FAIL";

export type ClearanceBreakdown = {
  freeFallM: number;
  decelerationM: number;
  harnessStretchM: number;
  lifelinePayoutM: number;
  anchorDeflectionM: number;
  safetyMarginM: number;
};

export type StandardBasisRef = {
  ref: string;
  description: string;
};

export type CalculationResult = {
  id: string;
  configId: string;
  requiredClearanceM: number;
  availableClearanceM: number;
  status: ClearanceStatus;
  breakdown: ClearanceBreakdown;
  standardBasis: StandardBasisRef[];
  aiExplanation: string;
};
