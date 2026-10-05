import { CombinedService } from './combined.service';
import { VerificationService } from '../verification/verification.service';
export declare class CombinedController {
    private readonly combinedService;
    private readonly verification;
    constructor(combinedService: CombinedService, verification: VerificationService);
    verifyPublic(workerRef: string, equipmentRef: string): Promise<{
        status: string;
        worker: {
            publicRef: string;
            displayName: string;
            company: {
                name: string;
            };
            isCompliant: boolean;
        };
        equipment: {
            publicRef: string;
            name: string;
            isSafe: boolean;
            safetyStatus: string;
        };
    }>;
    verifyFull(workerRef: string, equipmentRef: string): Promise<{
        result: string;
        reasons: string[];
        missingCertifications: number[];
        expiredTraining: any;
        expiredCredentials: any;
        workerIncidents: any;
        equipmentIncidents: any;
        worker: {
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
            trainingRecords: ({
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
            credentials: ({
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
        };
        equipment: {
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
            trainingRequirements: ({
                certification: {
                    id: number;
                    name: string;
                    code: string | null;
                    description: string | null;
                };
            } & {
                id: number;
                equipmentId: number;
                certificationId: number;
            })[];
        } & {
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
        requiredCerts: number[];
    }>;
    view(workerRef: string, equipmentRef: string): Promise<{
        status: string;
        reasons: string[];
        workerSummary: {
            id: number;
            firstName: string;
            lastName: string;
            fullName: string;
            companyName: string;
            photoUrl: string;
        };
        equipmentSummary: {
            id: number;
            name: string;
            serialNumber: string;
            companyName: string;
        };
        badges: {
            missingCertsCount: number;
            expiredTrainingCount: any;
            expiredCredentialsCount: any;
            workerIncidentsCount: any;
            equipmentIncidentsCount: any;
        };
    }>;
}
