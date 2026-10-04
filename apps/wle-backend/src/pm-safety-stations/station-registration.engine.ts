import {
  PmSafetyStationNetworkMode,
  PmSafetyStationStatus,
  PmSafetyStationType,
} from '@prisma/client';

export type StationRegistrationInput = {
  name: string;
  code: string;
  companyId: number;
  projectId?: number;
  siteId?: number;
  zoneCode?: string;
  stationType?: PmSafetyStationType;
  hardwareId?: string;
  firmwareVersion?: string;
  networkMode?: PmSafetyStationNetworkMode;
  equipmentId?: number;
  latitude?: number;
  longitude?: number;
  heartbeatIntervalSec?: number;
};

export type StationActivationResult = {
  valid: boolean;
  errors: string[];
  nextStatus: PmSafetyStationStatus;
};

export class StationRegistrationEngine {
  validateRegistration(
    input: StationRegistrationInput,
  ): StationActivationResult {
    const errors: string[] = [];
    if (!input.name?.trim()) errors.push('Station name required');
    if (!input.code?.trim()) errors.push('Station code required');
    if (!input.companyId) errors.push('Company required');
    if (input.stationType === 'equipment' && !input.equipmentId) {
      errors.push('Equipment station requires equipmentId');
    }
    if (input.stationType === 'muster' && !input.zoneCode) {
      errors.push('Muster station requires muster point zoneCode');
    }
    return {
      valid: errors.length === 0,
      errors,
      nextStatus: errors.length === 0 ? 'pending' : 'pending',
    };
  }

  activationTransition(
    current: PmSafetyStationStatus,
    hasHardwareId: boolean,
    hasProject: boolean,
  ): PmSafetyStationStatus {
    if (current === 'deactivated') return 'deactivated';
    if (!hasHardwareId || !hasProject) return 'pending';
    return 'active';
  }

  deactivationTransition(): PmSafetyStationStatus {
    return 'deactivated';
  }
}
