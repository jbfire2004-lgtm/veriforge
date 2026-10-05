import { OrientationAssignmentScope, UserRole } from '@prisma/client';
import { OrientationService } from './orientation.service';
import { OrientationAccessService } from './orientation-access.service';
import { CreateOrientationDto } from './dto/create-orientation.dto';
import { AiGenerateOrientationDto } from './dto/ai-generate-orientation.dto';
type AuthReq = {
    user: {
        id: number;
        role: UserRole;
    };
};
export declare class OrientationController {
    private readonly orientation;
    private readonly access;
    constructor(orientation: OrientationService, access: OrientationAccessService);
    create(req: AuthReq, body: CreateOrientationDto): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
    companyCompliance(companyId: string): Promise<{
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
    projectCompliance(projectId: string): Promise<{
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
    listCompany(companyId: string): Promise<({
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
    listProject(projectId: string): Promise<({
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
    myRequired(req: AuthReq): Promise<({
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
    workerRequired(workerId: string): Promise<({
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
    workerAccess(workerId: string, companyId?: string, projectId?: string): Promise<import("./orientation-access.service").OrientationAccessResult>;
    stats(id: string): Promise<{
        total: number;
        completed: number;
        pending: number;
        outdated: number;
        inProgress: number;
        completionRate: number;
    }>;
    get(id: string): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
    update(req: AuthReq, id: string, body: Record<string, unknown>): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
    upload(req: AuthReq, id: string, uploaded: {
        files?: Express.Multer.File[];
    }): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
    aiGenerate(req: AuthReq, id: string, body: AiGenerateOrientationDto): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
    translate(id: string, body: {
        languages: string[];
    }): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
    assign(id: string, body: {
        scope: OrientationAssignmentScope;
    }): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
    workers(id: string): Promise<({
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
    versions(id: string): Promise<{
        id: string;
        packageId: string;
        versionNumber: number;
        sections: import(".prisma/client").Prisma.JsonValue;
        media: import(".prisma/client").Prisma.JsonValue;
        quiz: import(".prisma/client").Prisma.JsonValue;
        aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
        createdById: number | null;
        createdAt: Date;
    }[]>;
    rollback(req: AuthReq, id: string, body: {
        versionNumber: number;
    }): Promise<{
        currentVersion: {
            id: string;
            packageId: string;
            versionNumber: number;
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
            sections: import(".prisma/client").Prisma.JsonValue;
            media: import(".prisma/client").Prisma.JsonValue;
            quiz: import(".prisma/client").Prisma.JsonValue;
            aiMetadata: import(".prisma/client").Prisma.JsonValue | null;
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
    startProgress(id: string, body: {
        workerId: number;
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
    completeProgress(id: string, body: {
        workerId: number;
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
    myStart(req: AuthReq, id: string): Promise<{
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
    myComplete(req: AuthReq, id: string, body: {
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
}
export {};
