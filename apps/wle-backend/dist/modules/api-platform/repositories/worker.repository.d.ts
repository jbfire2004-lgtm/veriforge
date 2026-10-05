import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository, type PaginatedResult, type PaginationParams } from './base.repository';
export declare class WorkerRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    findById(id: number): Prisma.Prisma__WorkerClient<{
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
            lastVerificationChecks: Prisma.JsonValue | null;
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    search(where: Prisma.WorkerWhereInput, pagination?: PaginationParams): Promise<PaginatedResult<unknown>>;
}
