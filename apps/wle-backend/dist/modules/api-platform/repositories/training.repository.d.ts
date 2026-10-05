import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from './base.repository';
export declare class TrainingRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    findById(id: number): import(".prisma/client").Prisma.Prisma__TrainingRecordClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    listByWorker(workerId: number): import(".prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
}
