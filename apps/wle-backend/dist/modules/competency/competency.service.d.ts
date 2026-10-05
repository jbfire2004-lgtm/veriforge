import { PrismaService } from '../../prisma/prisma.service';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';
import { AuditLogService } from '../../audit/audit-log.service';
export type ResolvedCompetencyRules = {
    minPassingScore: number;
    expiryDays: number | null;
    requireEvaluation: boolean;
    source: 'equipment' | 'type' | 'default';
    certificationId: number | null;
};
export type CompetencyCheckResult = {
    eligible: boolean;
    reason?: string;
    requireEvaluation: boolean;
    minPassingScore: number;
    latestEvaluation?: {
        id: number;
        passed: boolean;
        score: number;
        evaluationDate: Date;
        expiresAt: Date | null;
        expired: boolean;
    };
    trainingEvidence?: {
        trainingRecordId: number;
        certificationId: number;
        expiresAt: Date | null;
        expired: boolean;
        verificationStatus: string | null;
        eligible: boolean;
        href: string;
    } | null;
    rules: ResolvedCompetencyRules;
};
export declare class CompetencyService {
    private readonly prisma;
    private readonly compliance;
    private readonly auditLog;
    constructor(prisma: PrismaService, compliance: EquipmentComplianceService, auditLog: AuditLogService);
    resolveRules(equipmentId: number): Promise<ResolvedCompetencyRules>;
    private isExpired;
    expireStaleForWorker(workerId: number): Promise<number>;
    checkWorkerEquipment(workerId: number, equipmentId: number): Promise<CompetencyCheckResult>;
    private resolveTrainingEvidence;
    assertEligible(workerId: number, equipmentId: number): Promise<CompetencyCheckResult>;
    evaluate(data: {
        workerId: number;
        equipmentId: number;
        evaluatorUserId?: number;
        score: number;
        passed: boolean;
        evaluationDate?: Date;
        notes?: string;
        evidenceNotes?: string;
        evidencePhotos?: string[];
        workerSignature?: string;
        evaluatorSignature?: string;
    }): Promise<{
        worker: {
            id: number;
            firstName: string;
            lastName: string;
            status: string;
            companyId: number | null;
            photoUrl: string | null;
            userId: number | null;
            email: string | null;
            phone: string | null;
            dateOfBirth: Date | null;
            qrToken: string | null;
            unionNumber: string | null;
        };
        equipment: {
            id: number;
            name: string;
            serialNumber: string | null;
            assetTag: string | null;
            qrToken: string | null;
            safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
            companyId: number | null;
            categoryId: number | null;
            typeId: number | null;
            photoUrl: string | null;
            description: string | null;
            manufacturer: string | null;
            model: string | null;
            yearMade: number | null;
            lockedOutAt: Date | null;
            lockoutReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            catalogCategory: import(".prisma/client").$Enums.EquipmentCatalogCategory | null;
            catalogTypeKey: string | null;
            meterHours: number;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
            lastInspectionAt: Date | null;
            nextInspectionAt: Date | null;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            competencyRequired: boolean;
            trainingRequired: boolean;
            complianceUpdatedAt: Date | null;
            operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
            safetyCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
            capacity: string | null;
            loadChartJson: import(".prisma/client").Prisma.JsonValue;
            pmSafetyMetadataJson: import(".prisma/client").Prisma.JsonValue;
            deletedAt: Date | null;
        };
        evaluator: {
            id: number;
            username: string;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            companyId: number | null;
            unionHallId: number | null;
            trainingProviderId: number | null;
            acpTenantId: string | null;
            active: boolean;
            createdAt: Date;
        };
    } & {
        id: number;
        workerId: number;
        equipmentId: number;
        evaluatorUserId: number | null;
        equipmentTypeKey: string;
        score: number;
        passed: boolean;
        evaluationDate: Date;
        expiresAt: Date | null;
        notes: string | null;
        evidenceNotes: string | null;
        evidencePhotos: import(".prisma/client").Prisma.JsonValue | null;
        workerSignature: string | null;
        evaluatorSignature: string | null;
        createdAt: Date;
    }>;
    listForWorker(workerId: number): Promise<({
        equipment: {
            id: number;
            name: string;
            serialNumber: string | null;
            assetTag: string | null;
            qrToken: string | null;
            safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
            companyId: number | null;
            categoryId: number | null;
            typeId: number | null;
            photoUrl: string | null;
            description: string | null;
            manufacturer: string | null;
            model: string | null;
            yearMade: number | null;
            lockedOutAt: Date | null;
            lockoutReason: string | null;
            createdAt: Date;
            updatedAt: Date;
            catalogCategory: import(".prisma/client").$Enums.EquipmentCatalogCategory | null;
            catalogTypeKey: string | null;
            meterHours: number;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
            lastInspectionAt: Date | null;
            nextInspectionAt: Date | null;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            competencyRequired: boolean;
            trainingRequired: boolean;
            complianceUpdatedAt: Date | null;
            operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
            safetyCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
            capacity: string | null;
            loadChartJson: import(".prisma/client").Prisma.JsonValue;
            pmSafetyMetadataJson: import(".prisma/client").Prisma.JsonValue;
            deletedAt: Date | null;
        };
        evaluator: {
            id: number;
            username: string;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            companyId: number | null;
            unionHallId: number | null;
            trainingProviderId: number | null;
            acpTenantId: string | null;
            active: boolean;
            createdAt: Date;
        };
    } & {
        id: number;
        workerId: number;
        equipmentId: number;
        evaluatorUserId: number | null;
        equipmentTypeKey: string;
        score: number;
        passed: boolean;
        evaluationDate: Date;
        expiresAt: Date | null;
        notes: string | null;
        evidenceNotes: string | null;
        evidencePhotos: import(".prisma/client").Prisma.JsonValue | null;
        workerSignature: string | null;
        evaluatorSignature: string | null;
        createdAt: Date;
    })[]>;
    listForEquipment(equipmentId: number): Promise<({
        worker: {
            id: number;
            firstName: string;
            lastName: string;
            status: string;
            companyId: number | null;
            photoUrl: string | null;
            userId: number | null;
            email: string | null;
            phone: string | null;
            dateOfBirth: Date | null;
            qrToken: string | null;
            unionNumber: string | null;
        };
        evaluator: {
            id: number;
            username: string;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
            companyId: number | null;
            unionHallId: number | null;
            trainingProviderId: number | null;
            acpTenantId: string | null;
            active: boolean;
            createdAt: Date;
        };
    } & {
        id: number;
        workerId: number;
        equipmentId: number;
        evaluatorUserId: number | null;
        equipmentTypeKey: string;
        score: number;
        passed: boolean;
        evaluationDate: Date;
        expiresAt: Date | null;
        notes: string | null;
        evidenceNotes: string | null;
        evidencePhotos: import(".prisma/client").Prisma.JsonValue | null;
        workerSignature: string | null;
        evaluatorSignature: string | null;
        createdAt: Date;
    })[]>;
    getEquipmentRequirements(equipmentId: number): Promise<{
        equipmentId: number;
        assetRequirement: ({
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
        } & {
            id: number;
            equipmentId: number;
            minPassingScore: number;
            expiryDays: number | null;
            requireEvaluation: boolean;
            certificationId: number | null;
        })[];
        typeRequirement: {
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
        } & {
            id: number;
            equipmentTypeId: number;
            minPassingScore: number;
            expiryDays: number | null;
            requireEvaluation: boolean;
            certificationId: number | null;
        };
        resolved: ResolvedCompetencyRules;
    }>;
    upsertEquipmentRequirement(equipmentId: number, data: {
        minPassingScore?: number;
        expiryDays?: number | null;
        requireEvaluation?: boolean;
        certificationId?: number | null;
    }): Promise<{
        certification: {
            id: number;
            name: string;
            code: string | null;
            description: string | null;
        };
    } & {
        id: number;
        equipmentId: number;
        minPassingScore: number;
        expiryDays: number | null;
        requireEvaluation: boolean;
        certificationId: number | null;
    }>;
    upsertTypeRequirement(equipmentTypeId: number, data: {
        minPassingScore?: number;
        expiryDays?: number | null;
        requireEvaluation?: boolean;
        certificationId?: number | null;
    }): Promise<{
        certification: {
            id: number;
            name: string;
            code: string | null;
            description: string | null;
        };
    } & {
        id: number;
        equipmentTypeId: number;
        minPassingScore: number;
        expiryDays: number | null;
        requireEvaluation: boolean;
        certificationId: number | null;
    }>;
    dashboard(companyId?: number): Promise<{
        totalEvaluations: number;
        passing: number;
        expiringSoon: number;
        expired: number;
        operatorLinks: number;
        recent: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
                status: string;
                companyId: number | null;
                photoUrl: string | null;
                userId: number | null;
                email: string | null;
                phone: string | null;
                dateOfBirth: Date | null;
                qrToken: string | null;
                unionNumber: string | null;
            };
            equipment: {
                id: number;
                name: string;
                serialNumber: string | null;
                assetTag: string | null;
                qrToken: string | null;
                safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
                companyId: number | null;
                categoryId: number | null;
                typeId: number | null;
                photoUrl: string | null;
                description: string | null;
                manufacturer: string | null;
                model: string | null;
                yearMade: number | null;
                lockedOutAt: Date | null;
                lockoutReason: string | null;
                createdAt: Date;
                updatedAt: Date;
                catalogCategory: import(".prisma/client").$Enums.EquipmentCatalogCategory | null;
                catalogTypeKey: string | null;
                meterHours: number;
                complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
                lastInspectionAt: Date | null;
                nextInspectionAt: Date | null;
                lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
                competencyRequired: boolean;
                trainingRequired: boolean;
                complianceUpdatedAt: Date | null;
                operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
                safetyCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
                capacity: string | null;
                loadChartJson: import(".prisma/client").Prisma.JsonValue;
                pmSafetyMetadataJson: import(".prisma/client").Prisma.JsonValue;
                deletedAt: Date | null;
            };
            evaluator: {
                id: number;
                username: string;
                email: string;
                password: string;
                role: import(".prisma/client").$Enums.UserRole;
                companyId: number | null;
                unionHallId: number | null;
                trainingProviderId: number | null;
                acpTenantId: string | null;
                active: boolean;
                createdAt: Date;
            };
        } & {
            id: number;
            workerId: number;
            equipmentId: number;
            evaluatorUserId: number | null;
            equipmentTypeKey: string;
            score: number;
            passed: boolean;
            evaluationDate: Date;
            expiresAt: Date | null;
            notes: string | null;
            evidenceNotes: string | null;
            evidencePhotos: import(".prisma/client").Prisma.JsonValue | null;
            workerSignature: string | null;
            evaluatorSignature: string | null;
            createdAt: Date;
        })[];
    }>;
}
