import { ComplianceApiService } from '../services/compliance-api.service';
export declare class ComplianceApiController {
    private readonly compliance;
    constructor(compliance: ComplianceApiService);
    worker(id: number): Promise<import("../../../verification/verification.service").WorkerVerificationStatus>;
    equipment(companyId?: string): Promise<{
        summary: {
            total: number;
            compliant: number;
            needsAttention: number;
            nonCompliant: number;
            lockedOut: number;
            overdueInspection: number;
            complianceRate: number;
        };
        chart: {
            labels: string[];
            values: number[];
        };
        recent: {
            company: {
                id: number;
                name: string;
            };
            id: number;
            name: string;
            safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
            lastInspectionAt: Date;
            nextInspectionAt: Date;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            competencyRequired: boolean;
            trainingRequired: boolean;
        }[];
    }>;
    project(id: number, companyId?: string): Promise<{
        summary: {
            totalProjects: number;
            ready: number;
            atRisk: number;
            notReady: number;
            averageReadiness: number;
        };
        chart: {
            labels: string[];
            values: number[];
        };
        rows: {
            projectId: number;
            projectName: string;
            projectCode: string;
            companyId: number;
            companyName: string;
            totalWorkers: number;
            compliantWorkers: number;
            totalEquipment: number;
            compliantEquipment: number;
            readinessScore: number;
            readinessStatus: "READY" | "AT_RISK" | "NOT_READY";
        }[];
    }>;
    trainingExpiry(companyId?: string): Promise<{
        expired: number;
        expiring30: number;
    }>;
}
