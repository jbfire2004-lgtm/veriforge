import { TrainingRecordsService } from './training-records.service';
import { CreateTrainingRecordDto } from './dto/create-training-record.dto';
import { UpdateTrainingRecordDto } from './dto/update-training-record.dto';
export declare class TrainingRecordsController {
    private readonly service;
    constructor(service: TrainingRecordsService);
    create(dto: CreateTrainingRecordDto): Promise<{
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
        provider: {
            id: number;
            name: string;
            createdAt: Date;
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
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
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
        provider: {
            id: number;
            name: string;
            createdAt: Date;
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
    findByWorker(workerId: number): import(".prisma/client").Prisma.PrismaPromise<({
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
        provider: {
            id: number;
            name: string;
            createdAt: Date;
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
    findOne(id: number): Promise<{
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
        isValid: boolean;
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
        certification: {
            id: number;
            name: string;
            code: string | null;
            description: string | null;
        };
        provider: {
            id: number;
            name: string;
            createdAt: Date;
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
    }>;
    update(id: number, dto: UpdateTrainingRecordDto): Promise<{
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
        provider: {
            id: number;
            name: string;
            createdAt: Date;
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
    }>;
    complete(id: number): Promise<{
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
        provider: {
            id: number;
            name: string;
            createdAt: Date;
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
    }>;
    remove(id: number): import(".prisma/client").Prisma.Prisma__TrainingRecordClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
