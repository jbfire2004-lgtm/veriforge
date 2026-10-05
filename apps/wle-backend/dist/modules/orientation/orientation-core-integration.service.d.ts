import { PrismaService } from '../../prisma/prisma.service';
export declare class OrientationCoreIntegrationService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    ensureCertification(code: string, name: string): Promise<{
        id: number;
        name: string;
        code: string | null;
        description: string | null;
    }>;
    recordCompletion(input: {
        workerId: number;
        packageId: string;
        packageTitle: string;
        companyId: number | null;
        projectId: number | null;
        versionNumber: number;
        certificateId: string;
        quizScore?: number;
        languageCode: string;
    }): Promise<any>;
    private syncSiteOrientationForm;
    complianceSummaryForCompany(companyId: number): Promise<{
        packageCount: number;
        completed: number;
        pending: number;
        outdated: number;
        packages: {
            id: string;
            title: string;
            version: number;
            progress: number;
        }[];
    }>;
    complianceSummaryForProject(projectId: number): Promise<{
        packageCount: number;
        completed: number;
        pending: number;
        outdated: number;
        packages: {
            id: string;
            title: string;
            version: number;
            progress: number;
        }[];
    }>;
    private summarizePackages;
}
