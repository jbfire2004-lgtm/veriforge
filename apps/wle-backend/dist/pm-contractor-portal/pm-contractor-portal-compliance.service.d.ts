import { PrismaService } from '../prisma/prisma.service';
import { PmContractorPortalAccessService, type PortalActor } from './pm-contractor-portal-access.service';
export declare class PmContractorPortalComplianceService {
    private readonly prisma;
    private readonly access;
    constructor(prisma: PrismaService, access: PmContractorPortalAccessService);
    getDashboard(actor: PortalActor, projectId?: number): Promise<{
        summary: {
            workersTotal: number;
            trainingExpired: number;
            trainingExpiringSoon: number;
            credentialsExpired: number;
            credentialsExpiringSoon: number;
            equipmentNonCompliant: number;
            equipmentTotal: number;
        };
        workers: {
            id: number;
            firstName: string;
            lastName: string;
            status: string;
        }[];
        training: {
            expired: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
                certification: {
                    id: number;
                    name: string;
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
            expiringSoon: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
                certification: {
                    id: number;
                    name: string;
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
            current: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
                certification: {
                    id: number;
                    name: string;
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
        };
        certifications: {
            expired: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
                certification: {
                    id: number;
                    name: string;
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
            expiringSoon: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
                certification: {
                    id: number;
                    name: string;
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
        };
        equipment: {
            nonCompliant: ({
                equipment: {
                    id: number;
                    name: string;
                    serialNumber: string;
                };
            } & {
                id: number;
                companyId: number;
                equipmentId: number;
                lastPreUseAt: Date | null;
                lastFormalAt: Date | null;
                preUseCompliant7d: boolean;
                formalCompliant: boolean;
                trainingOperatorsOk: number;
                trainingOperatorsTotal: number;
                competencyOperatorsOk: number;
                competencyOperatorsTotal: number;
                updatedAt: Date;
            })[];
            compliant: ({
                equipment: {
                    id: number;
                    name: string;
                    serialNumber: string;
                };
            } & {
                id: number;
                companyId: number;
                equipmentId: number;
                lastPreUseAt: Date | null;
                lastFormalAt: Date | null;
                preUseCompliant7d: boolean;
                formalCompliant: boolean;
                trainingOperatorsOk: number;
                trainingOperatorsTotal: number;
                competencyOperatorsOk: number;
                competencyOperatorsTotal: number;
                updatedAt: Date;
            })[];
        };
    }>;
}
