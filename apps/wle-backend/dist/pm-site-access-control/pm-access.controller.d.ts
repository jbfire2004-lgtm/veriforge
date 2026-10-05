import { PmSiteAccessControlService } from './pm-site-access-control.service';
import { PmSiteAccessCailIntelligenceService } from './pm-site-access-cail-intelligence.service';
export declare class PmAccessController {
    private readonly access;
    private readonly cail;
    constructor(access: PmSiteAccessControlService, cail: PmSiteAccessCailIntelligenceService);
    validate(body: {
        workerId: number;
        projectId: number;
        zoneCode?: string;
        equipmentId?: number;
        accessPointId?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        result: "granted" | "denied" | "override_required";
        workflowState: "override_required" | "access_granted" | "access_denied" | "override_approved" | "override_expired";
        decision: import(".prisma/client").PmAccessDecision;
        granted: boolean;
        denialReasons: string[];
        checks: Record<string, boolean>;
        attemptId?: string;
        overrideId?: string;
    }>;
    override(body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number;
        workerId: number | null;
        equipmentId: number | null;
        zoneCode: string | null;
        overrideType: import(".prisma/client").$Enums.PmAccessOverrideType;
        reason: string;
        expiresAt: Date;
        supervisorUserId: number | null;
        safetyUserId: number | null;
        supervisorSignature: string | null;
        safetySignature: string | null;
        active: boolean;
        revokedAt: Date | null;
        clientSyncId: string | null;
        createdAt: Date;
    }>;
    offlineSync(body: {
        projectId: number;
        attempts?: Array<Record<string, unknown>>;
        overrides?: Array<Record<string, unknown>>;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        syncedAt: string;
        attempts: number;
        overrides: number;
        projectId: number;
    }>;
    workerProfile(id: number, projectId: string): Promise<{
        workerId: number;
        projectId: number;
        worker: {
            id: number;
            companyId: number;
            firstName: string;
            lastName: string;
        };
        complianceScore: number;
        attempts30d: number;
        denials30d: number;
        workflowState: "override_required" | "access_granted" | "access_denied" | "override_approved" | "override_expired";
        recentAttempts: {
            id: string;
            timestamp: Date;
            result: "granted" | "denied" | "override_required";
            reason: string;
            zoneCode: string;
        }[];
        requirements: {
            id: string;
            companyId: number;
            projectId: number | null;
            workerId: number;
            requirementType: string;
            requirementKey: string;
            satisfied: boolean;
            expiresAt: Date | null;
            metadataJson: import(".prisma/client").Prisma.JsonValue;
            updatedAt: Date;
        }[];
        cail: {
            predictiveDenialLikelihood: number;
            workerRiskScore: number;
            denialRate30d: number;
            attempts30d: number;
            denials30d: number;
            openCapa: number;
            chronicNonCompliance: boolean;
        };
    }>;
    workerPredict(id: number, projectId: string): Promise<{
        predictiveDenialLikelihood: number;
        workerRiskScore: number;
        denialRate30d: number;
        attempts30d: number;
        denials30d: number;
        openCapa: number;
        chronicNonCompliance: boolean;
    }>;
    equipmentProfile(id: number, projectId: string): Promise<{
        equipmentId: number;
        projectId: number;
        equipment: {
            id: number;
            name: string;
            operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
        };
        accessAllowed: boolean;
        equipmentScore: {
            equipmentId: number;
            conditionScore: number;
            riskBand: "medium" | "low" | "high" | "critical";
            factors: Record<string, number>;
            status: "active" | "in_service" | "out_of_service" | "locked_out";
            nextInspectionDue: Date;
            lastInspectionDate: Date;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
        };
        denialReasons: string[];
        requirements: {
            id: string;
            companyId: number;
            equipmentId: number;
            requirementType: string;
            requirementKey: string;
            satisfied: boolean;
            expiresAt: Date | null;
            metadataJson: import(".prisma/client").Prisma.JsonValue;
            updatedAt: Date;
        }[];
        recentAttempts: {
            id: string;
            timestamp: Date;
            result: "granted" | "denied" | "override_required";
            workerId: number;
        }[];
        cail: {
            equipmentId: number;
            projectId: number;
            equipmentRiskScore: number;
            accessBlocked: boolean;
            openFailures: number;
            predictiveDenialLikelihood: number;
        };
    }>;
    equipmentPredict(id: number): Promise<{
        equipmentId: number;
        projectId: number;
        equipmentRiskScore: number;
        accessBlocked: boolean;
        openFailures: number;
        predictiveDenialLikelihood: number;
    }>;
}
