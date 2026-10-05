import { WorkerApiService } from '../services/worker-api.service';
import { CreateWorkerDto } from '../../../workers/dto/create-worker.dto';
import { UpdateWorkerDto } from '../../../workers/dto/update-worker.dto';
import { toSecurityActor } from '../../../security/actor.util';
import { PermissionService } from '../../../security/permission.service';
export declare class WorkersApiController {
    private readonly workers;
    private readonly permissions;
    constructor(workers: WorkerApiService, permissions: PermissionService);
    search(q?: string, companyId?: string, page?: string, pageSize?: string): Promise<ApiSuccessEnvelope<T[]>>;
    getProjectReadiness(id: number, req: {
        user: Parameters<typeof toSecurityActor>[0];
    }, projectId: number): Promise<import("../../../workers/worker-project-readiness.types").WorkerProjectReadinessResult>;
    getTraining(id: number, req: {
        user: Parameters<typeof toSecurityActor>[0];
    }, requiredTraining?: string, roleType?: string, projectId?: string): Promise<import("../../../workers/worker-training-hydration.service").WorkerTrainingHydration>;
    get(id: number, req: {
        user: Parameters<typeof toSecurityActor>[0];
    }): Promise<{
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
    linkCompany(id: number, body: {
        companyId: number;
        role?: string;
        trade?: string;
    }): Promise<{
        trainingSummary: any;
        id: number;
        workerId: number;
        companyId: number;
        active: boolean;
        startDate: Date;
        endDate: Date | null;
        role: string | null;
        trade: string | null;
        visibilityRules: import(".prisma/client").Prisma.JsonValue | null;
    }>;
    unlinkCompany(id: number, body: {
        companyId: number;
    }): Promise<{
        ok: boolean;
    }>;
    assignProject(id: number, body: {
        projectId: number;
    }): Promise<{
        trainingSummary: any;
        id: number;
        workerId: number;
        projectId: number;
        companyId: number;
        assignedBy: number | null;
        assignedAt: Date;
        status: import(".prisma/client").$Enums.AssignmentStatus;
        role: string | null;
        endedAt: Date | null;
    }>;
    uploadTraining(id: number, body: Record<string, unknown>): Promise<{
        ok: boolean;
        error: string;
        workerId?: undefined;
        trainingRecord?: undefined;
        walletTraining?: undefined;
    } | {
        ok: boolean;
        workerId: number;
        trainingRecord: {
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
        };
        walletTraining: import("../../vera-core/training-wallet.mapper").WalletTrainingRecordDto;
        error?: undefined;
    }>;
}
