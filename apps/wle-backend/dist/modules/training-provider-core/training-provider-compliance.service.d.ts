import { InstructorQualificationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class TrainingProviderComplianceService {
    private readonly prisma;
    private readonly legislation;
    constructor(prisma: PrismaService);
    assessProvider(providerId: number, notes?: string): Promise<{
        gaps: string[];
        id: number;
        providerId: number;
        status: import(".prisma/client").$Enums.ProviderComplianceLevel;
        score: number | null;
        assessedAt: Date;
        notes: string | null;
    }>;
    latestCompliance(providerId: number): Promise<{
        id: number;
        providerId: number;
        status: import(".prisma/client").$Enums.ProviderComplianceLevel;
        score: number | null;
        gaps: import(".prisma/client").Prisma.JsonValue | null;
        assessedAt: Date;
        notes: string | null;
    }>;
    validateInstructorForCourse(instructor: {
        active: boolean;
        qualificationStatus: InstructorQualificationStatus;
        qualificationExpiresAt: Date | null;
        qualifiedCourseCodes: string[];
    }, courseCode: string): {
        valid: boolean;
        reason?: string;
    };
}
