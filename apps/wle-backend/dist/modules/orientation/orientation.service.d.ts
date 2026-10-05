import { OrientationAssignmentScope, OrientationPackageType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OrientationAiService, type AiGenerateInput } from './orientation-ai.service';
import { OrientationLinkingService } from './orientation-linking.service';
import { OrientationTranslationService } from './orientation-translation.service';
import { OrientationCoreIntegrationService } from './orientation-core-integration.service';
import { OrientationUploadService } from './orientation-upload.service';
export declare class OrientationService {
    private readonly prisma;
    private readonly ai;
    private readonly translate;
    private readonly linking;
    private readonly core;
    private readonly upload;
    constructor(prisma: PrismaService, ai: OrientationAiService, translate: OrientationTranslationService, linking: OrientationLinkingService, core: OrientationCoreIntegrationService, upload: OrientationUploadService);
    create(input: {
        companyId?: number;
        projectId?: number;
        type: OrientationPackageType;
        title: string;
        languages?: string[];
        userId?: number;
    }): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        };
        assignments: {
            id: string;
            packageId: string;
            scope: import(".prisma/client").$Enums.OrientationAssignmentScope;
            required: boolean;
            createdAt: Date;
        }[];
        _count: {
            workerProgress: number;
        };
        versions: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        }[];
        id: string;
        companyId: number | null;
        projectId: number | null;
        type: import(".prisma/client").$Enums.OrientationPackageType;
        title: string;
        languages: string[];
        version: number;
        isPublished: boolean;
        createdById: number | null;
        updatedById: number | null;
        createdAt: Date;
        updatedAt: Date;
        archivedAt: Date | null;
    }>;
    getById(id: string): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        };
        assignments: {
            id: string;
            packageId: string;
            scope: import(".prisma/client").$Enums.OrientationAssignmentScope;
            required: boolean;
            createdAt: Date;
        }[];
        _count: {
            workerProgress: number;
        };
        versions: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        }[];
        id: string;
        companyId: number | null;
        projectId: number | null;
        type: import(".prisma/client").$Enums.OrientationPackageType;
        title: string;
        languages: string[];
        version: number;
        isPublished: boolean;
        createdById: number | null;
        updatedById: number | null;
        createdAt: Date;
        updatedAt: Date;
        archivedAt: Date | null;
    }>;
    listForCompany(companyId: number): Promise<({
        _count: {
            workerProgress: number;
        };
    } & {
        id: string;
        companyId: number | null;
        projectId: number | null;
        type: import(".prisma/client").$Enums.OrientationPackageType;
        title: string;
        languages: string[];
        version: number;
        isPublished: boolean;
        createdById: number | null;
        updatedById: number | null;
        createdAt: Date;
        updatedAt: Date;
        archivedAt: Date | null;
    })[]>;
    listForProject(projectId: number): Promise<({
        _count: {
            workerProgress: number;
        };
    } & {
        id: string;
        companyId: number | null;
        projectId: number | null;
        type: import(".prisma/client").$Enums.OrientationPackageType;
        title: string;
        languages: string[];
        version: number;
        isPublished: boolean;
        createdById: number | null;
        updatedById: number | null;
        createdAt: Date;
        updatedAt: Date;
        archivedAt: Date | null;
    })[]>;
    update(id: string, data: {
        title?: string;
        languages?: string[];
        isPublished?: boolean;
    }, userId?: number): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        };
        assignments: {
            id: string;
            packageId: string;
            scope: import(".prisma/client").$Enums.OrientationAssignmentScope;
            required: boolean;
            createdAt: Date;
        }[];
        _count: {
            workerProgress: number;
        };
        versions: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        }[];
        id: string;
        companyId: number | null;
        projectId: number | null;
        type: import(".prisma/client").$Enums.OrientationPackageType;
        title: string;
        languages: string[];
        version: number;
        isPublished: boolean;
        createdById: number | null;
        updatedById: number | null;
        createdAt: Date;
        updatedAt: Date;
        archivedAt: Date | null;
    }>;
    archive(id: string): Promise<{
        ok: boolean;
    }>;
    uploadContent(id: string, files: Array<{
        originalname: string;
        mimetype: string;
        size: number;
        buffer?: Buffer;
    }>, userId?: number): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        };
        assignments: {
            id: string;
            packageId: string;
            scope: import(".prisma/client").$Enums.OrientationAssignmentScope;
            required: boolean;
            createdAt: Date;
        }[];
        _count: {
            workerProgress: number;
        };
        versions: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        }[];
        id: string;
        companyId: number | null;
        projectId: number | null;
        type: import(".prisma/client").$Enums.OrientationPackageType;
        title: string;
        languages: string[];
        version: number;
        isPublished: boolean;
        createdById: number | null;
        updatedById: number | null;
        createdAt: Date;
        updatedAt: Date;
        archivedAt: Date | null;
    }>;
    aiGenerate(id: string, input: AiGenerateInput, userId?: number): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        };
        assignments: {
            id: string;
            packageId: string;
            scope: import(".prisma/client").$Enums.OrientationAssignmentScope;
            required: boolean;
            createdAt: Date;
        }[];
        _count: {
            workerProgress: number;
        };
        versions: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        }[];
        id: string;
        companyId: number | null;
        projectId: number | null;
        type: import(".prisma/client").$Enums.OrientationPackageType;
        title: string;
        languages: string[];
        version: number;
        isPublished: boolean;
        createdById: number | null;
        updatedById: number | null;
        createdAt: Date;
        updatedAt: Date;
        archivedAt: Date | null;
    }>;
    translatePackage(id: string, languages: string[]): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        };
        assignments: {
            id: string;
            packageId: string;
            scope: import(".prisma/client").$Enums.OrientationAssignmentScope;
            required: boolean;
            createdAt: Date;
        }[];
        _count: {
            workerProgress: number;
        };
        versions: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        }[];
        id: string;
        companyId: number | null;
        projectId: number | null;
        type: import(".prisma/client").$Enums.OrientationPackageType;
        title: string;
        languages: string[];
        version: number;
        isPublished: boolean;
        createdById: number | null;
        updatedById: number | null;
        createdAt: Date;
        updatedAt: Date;
        archivedAt: Date | null;
    }>;
    assign(id: string, scope: OrientationAssignmentScope): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        };
        assignments: {
            id: string;
            packageId: string;
            scope: import(".prisma/client").$Enums.OrientationAssignmentScope;
            required: boolean;
            createdAt: Date;
        }[];
        _count: {
            workerProgress: number;
        };
        versions: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        }[];
        id: string;
        companyId: number | null;
        projectId: number | null;
        type: import(".prisma/client").$Enums.OrientationPackageType;
        title: string;
        languages: string[];
        version: number;
        isPublished: boolean;
        createdById: number | null;
        updatedById: number | null;
        createdAt: Date;
        updatedAt: Date;
        archivedAt: Date | null;
    }>;
    listWorkers(id: string): Promise<({
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        packageId: string;
        workerId: number;
        versionNumber: number;
        languageCode: string;
        status: import(".prisma/client").$Enums.OrientationWorkerProgressStatus;
        startedAt: Date | null;
        completedAt: Date | null;
        quizScore: number | null;
        certificateId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    listVersions(id: string): Promise<{
        id: string;
        packageId: string;
        versionNumber: number;
        sections: Prisma.JsonValue;
        media: Prisma.JsonValue;
        quiz: Prisma.JsonValue;
        aiMetadata: Prisma.JsonValue | null;
        createdById: number | null;
        createdAt: Date;
    }[]>;
    rollback(id: string, versionNumber: number, userId?: number): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        };
        assignments: {
            id: string;
            packageId: string;
            scope: import(".prisma/client").$Enums.OrientationAssignmentScope;
            required: boolean;
            createdAt: Date;
        }[];
        _count: {
            workerProgress: number;
        };
        versions: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: Prisma.JsonValue;
            media: Prisma.JsonValue;
            quiz: Prisma.JsonValue;
            aiMetadata: Prisma.JsonValue | null;
            createdById: number | null;
            createdAt: Date;
        }[];
        id: string;
        companyId: number | null;
        projectId: number | null;
        type: import(".prisma/client").$Enums.OrientationPackageType;
        title: string;
        languages: string[];
        version: number;
        isPublished: boolean;
        createdById: number | null;
        updatedById: number | null;
        createdAt: Date;
        updatedAt: Date;
        archivedAt: Date | null;
    }>;
    startProgress(packageId: string, workerId: number): Promise<{
        id: string;
        packageId: string;
        workerId: number;
        versionNumber: number;
        languageCode: string;
        status: import(".prisma/client").$Enums.OrientationWorkerProgressStatus;
        startedAt: Date | null;
        completedAt: Date | null;
        quizScore: number | null;
        certificateId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    completeProgress(packageId: string, workerId: number, input: {
        quizScore?: number;
        languageCode?: string;
    }): Promise<{
        id: string;
        packageId: string;
        workerId: number;
        versionNumber: number;
        languageCode: string;
        status: import(".prisma/client").$Enums.OrientationWorkerProgressStatus;
        startedAt: Date | null;
        completedAt: Date | null;
        quizScore: number | null;
        certificateId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getComplianceForCompany(companyId: number): Promise<{
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
    getComplianceForProject(projectId: number): Promise<{
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
    getStats(packageId: string): Promise<{
        total: number;
        completed: number;
        pending: number;
        outdated: number;
        inProgress: number;
        completionRate: number;
    }>;
    requiredForWorker(workerId: number): Promise<({
        package: {
            id: string;
            companyId: number | null;
            projectId: number | null;
            type: import(".prisma/client").$Enums.OrientationPackageType;
            title: string;
            languages: string[];
            version: number;
            isPublished: boolean;
            createdById: number | null;
            updatedById: number | null;
            createdAt: Date;
            updatedAt: Date;
            archivedAt: Date | null;
        };
    } & {
        id: string;
        packageId: string;
        workerId: number;
        versionNumber: number;
        languageCode: string;
        status: import(".prisma/client").$Enums.OrientationWorkerProgressStatus;
        startedAt: Date | null;
        completedAt: Date | null;
        quizScore: number | null;
        certificateId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    private createVersion;
}
