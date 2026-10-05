import { ProjectSafetyRoleType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class ProjectSafetyRoleService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listForProject(projectId: number): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            id: number;
            username: string;
            email: string;
        };
        company: {
            id: number;
            name: string;
        };
    } & {
        id: string;
        projectId: number;
        userId: number;
        companyId: number | null;
        role: import(".prisma/client").$Enums.ProjectSafetyRoleType;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    upsert(input: {
        projectId: number;
        userId: number;
        role: ProjectSafetyRoleType;
        companyId?: number;
    }): Promise<{
        user: {
            id: number;
            username: string;
        };
        company: {
            id: number;
            name: string;
        };
    } & {
        id: string;
        projectId: number;
        userId: number;
        companyId: number | null;
        role: import(".prisma/client").$Enums.ProjectSafetyRoleType;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(projectId: number, userId: number): Promise<{
        ok: boolean;
    }>;
    rolesForUser(userId: number, projectId?: number): Promise<{
        id: string;
        projectId: number;
        userId: number;
        companyId: number | null;
        role: import(".prisma/client").$Enums.ProjectSafetyRoleType;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
