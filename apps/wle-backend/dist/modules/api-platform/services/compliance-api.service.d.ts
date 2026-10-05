import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import { VerificationService } from '../../../verification/verification.service';
import { ComplianceRepository } from '../repositories/compliance.repository';
export declare class ComplianceApiService {
    private readonly reporting;
    private readonly verification;
    private readonly complianceRepo;
    constructor(reporting: ReportingCoreService, verification: VerificationService, complianceRepo: ComplianceRepository);
    workerCompliance(workerId: number): Promise<import("../../../verification/verification.service").WorkerVerificationStatus>;
    equipmentCompliance(companyId?: number): Promise<{
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
    projectReadiness(companyId?: number, projectId?: number): Promise<{
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
    trainingExpiry(companyId?: number): Promise<{
        expired: number;
        expiring30: number;
    }>;
}
