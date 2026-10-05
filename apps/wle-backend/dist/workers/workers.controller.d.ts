import { WorkersService } from './workers.service';
import { AssignWorkersCompanyDto } from './dto/assign-workers-company.dto';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerExpiryRulesDto } from './dto/update-worker-expiry-rules.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { PermissionService } from '../security/permission.service';
import type { SecurityActor } from '../security/security.types';
import { WorkerExpiryRulesStore } from './worker-expiry-rules.store';
type AuthedRequest = {
    user?: SecurityActor;
};
export declare class WorkersController {
    private readonly workersService;
    private readonly permissions;
    private readonly expiryRulesStore;
    constructor(workersService: WorkersService, permissions: PermissionService, expiryRulesStore: WorkerExpiryRulesStore);
    findAll(): Promise<({
        company: {
            id: number;
            name: string;
            logoUrl: string | null;
            city: string | null;
            province: string | null;
            industry: string | null;
            lat: number | null;
            lng: number | null;
            createdAt: Date;
        };
    } & {
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
    })[]>;
    findByCompany(companyId: number): Promise<({
        company: {
            id: number;
            name: string;
            logoUrl: string | null;
            city: string | null;
            province: string | null;
            industry: string | null;
            lat: number | null;
            lng: number | null;
            createdAt: Date;
        };
    } & {
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
    })[]>;
    getExpiryRules(companyId: number): Promise<import("./worker-expiry-rules.store").WorkerExpiryRules>;
    updateExpiryRules(companyId: number, dto: UpdateWorkerExpiryRulesDto): Promise<import("./worker-expiry-rules.store").WorkerExpiryRules>;
    heartbeat(id: number): Promise<{
        id: number;
        lastHeartbeat: string;
    }>;
    assignCompany(dto: AssignWorkersCompanyDto): Promise<{
        updated: number;
        workerIds: number[];
        companyId: number;
    }>;
    findOne(id: number, req: AuthedRequest): Promise<{
        training: {
            isValid: boolean;
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
            id: number;
            workerId: number;
            certificationId: number;
            providerId: number | null;
            trainingProviderId: number | null;
            courseId: number | null;
            instructorId: number | null;
            companyId: number | null;
            projectId: number | null;
            expiresAt: Date | null;
            issuedAt: Date;
            certificateNumber: string | null;
            certificateUrl: string | null;
            certificateQrToken: string | null;
            certificateSignedAt: Date | null;
            certificateSignedByInstructorId: number | null;
            completedAt: Date | null;
            lastVerificationStatus: string | null;
            lastVerificationChecks: import(".prisma/client").Prisma.JsonValue | null;
            verifiedAt: Date | null;
            ingestionRunId: number | null;
        }[];
        equipment: {
            id: number;
            equipment: {
                isSafe: boolean;
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
        }[];
        company: {
            id: number;
            name: string;
            logoUrl: string | null;
            city: string | null;
            province: string | null;
            industry: string | null;
            lat: number | null;
            lng: number | null;
            createdAt: Date;
        };
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
    }>;
    create(body: CreateWorkerDto): Promise<{
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
    }>;
    update(id: number, body: UpdateWorkerDto): Promise<{
        company: {
            id: number;
            name: string;
            logoUrl: string | null;
            city: string | null;
            province: string | null;
            industry: string | null;
            lat: number | null;
            lng: number | null;
            createdAt: Date;
        };
    } & {
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
    }>;
    remove(id: number): Promise<{
        status: string;
        deletedId: number;
    }>;
    profile(id: number, req: AuthedRequest): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        fullName: string;
        company: {
            id: number;
            name: string;
        };
        photoUrl: string;
        training: {
            records: ({
                certification: {
                    id: number;
                    name: string;
                    code: string | null;
                    description: string | null;
                };
            } & {
                id: number;
                workerId: number;
                certificationId: number;
                providerId: number | null;
                trainingProviderId: number | null;
                courseId: number | null;
                instructorId: number | null;
                companyId: number | null;
                projectId: number | null;
                expiresAt: Date | null;
                issuedAt: Date;
                certificateNumber: string | null;
                certificateUrl: string | null;
                certificateQrToken: string | null;
                certificateSignedAt: Date | null;
                certificateSignedByInstructorId: number | null;
                completedAt: Date | null;
                lastVerificationStatus: string | null;
                lastVerificationChecks: import(".prisma/client").Prisma.JsonValue | null;
                verifiedAt: Date | null;
                ingestionRunId: number | null;
            })[];
            expiredCount: number;
        };
        credentials: {
            records: ({
                certification: {
                    id: number;
                    name: string;
                    code: string | null;
                    description: string | null;
                };
            } & {
                id: number;
                workerId: number;
                name: string;
                value: string;
                createdAt: Date;
                expiresAt: Date | null;
                issuedAt: Date;
                certificationId: number | null;
            })[];
            expiredCount: number;
        };
        incidents: {
            id: number;
            title: string;
            description: string | null;
            category: string | null;
            latitude: number | null;
            longitude: number | null;
            metadata: import(".prisma/client").Prisma.JsonValue | null;
            status: string;
            severity: string;
            workerId: number | null;
            equipmentId: number | null;
            companyId: number | null;
            siteId: number | null;
            createdById: number | null;
            assignedToId: number | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        siteAccess: ({
            site: {
                id: number;
                name: string;
                code: string | null;
                region: string | null;
                latitude: number | null;
                longitude: number | null;
                active: boolean;
                createdAt: Date;
            };
        } & {
            workerId: number;
            siteId: number;
            status: import(".prisma/client").$Enums.WorkerSiteStatus;
            approved: boolean;
            notes: string | null;
            updatedAt: Date;
        })[];
        signoffs: ({
            site: {
                id: number;
                name: string;
                code: string | null;
                region: string | null;
                latitude: number | null;
                longitude: number | null;
                active: boolean;
                createdAt: Date;
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
            supervisor: {
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
            createdAt: Date;
            workerId: number | null;
            equipmentId: number | null;
            supervisorId: number | null;
            siteId: number | null;
            checklist: import(".prisma/client").Prisma.JsonValue;
            workerSignature: string | null;
            supervisorSignature: string;
            notes: string | null;
        })[];
        compliance: import("../verification/verification.service").WorkerVerificationStatus;
    }>;
    compliance(id: number, req: AuthedRequest): Promise<import("../verification/verification.service").WorkerVerificationStatus>;
    private assertWorkerSelfOrElevated;
}
export {};
