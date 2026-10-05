import { PpeType, ToolStatus } from '@prisma/client';
export declare class CreateToolDto {
    companyId: number;
    name: string;
    serialNumber?: string;
    assetTag?: string;
    category?: string;
    inspectionIntervalDays?: number;
    notes?: string;
}
export declare class CreatePpeDto {
    companyId: number;
    name: string;
    ppeType: PpeType;
    serialNumber?: string;
    condition?: string;
    notes?: string;
    expiresAt?: string;
    issuedAt?: string;
}
export declare class AssignToWorkerDto {
    workerId: number;
    projectId?: number;
}
export declare class AssignToProjectDto {
    projectId: number;
    workerId?: number;
}
export declare class ToolInspectDto {
    passed: boolean;
    checklist?: Record<string, unknown>;
    notes?: string;
    workerId?: number;
}
export declare class PpeInspectDto {
    passed: boolean;
    checklist?: Record<string, unknown>;
    notes?: string;
    workerId?: number;
    extendedExpiresAt?: string;
}
export declare class UpdateToolDto {
    name?: string;
    status?: ToolStatus;
    notes?: string;
}
