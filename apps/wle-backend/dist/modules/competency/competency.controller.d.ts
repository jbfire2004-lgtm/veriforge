import { CompetencyService } from './competency.service';
import { CheckCompetencyDto, EvaluateCompetencyDto, UpsertCompetencyRequirementDto } from './dto/evaluate-competency.dto';
export declare class CompetencyController {
    private readonly competency;
    constructor(competency: CompetencyService);
    dashboard(companyId?: string): Promise<{
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
    evaluate(dto: EvaluateCompetencyDto, req: {
        user: {
            id: number;
        };
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
    check(dto: CheckCompetencyDto): Promise<import("./competency.service").CompetencyCheckResult>;
    workerHistory(workerId: number): Promise<({
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
    equipmentEvaluations(equipmentId: number): Promise<({
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
    equipmentRequirements(equipmentId: number): Promise<{
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
        resolved: import("./competency.service").ResolvedCompetencyRules;
    }>;
    upsertEquipmentRequirements(equipmentId: number, dto: UpsertCompetencyRequirementDto): Promise<{
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
    upsertTypeRequirements(typeId: number, dto: UpsertCompetencyRequirementDto): Promise<{
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
}
