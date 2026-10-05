import { PmSafetyStationNetworkMode, PmSafetyStationStatus, PmSafetyStationType } from '@prisma/client';
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
export declare class StationRegistrationEngine {
    validateRegistration(input: StationRegistrationInput): StationActivationResult;
    activationTransition(current: PmSafetyStationStatus, hasHardwareId: boolean, hasProject: boolean): PmSafetyStationStatus;
    deactivationTransition(): PmSafetyStationStatus;
}
