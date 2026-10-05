import { ProjectSafetyRoleType } from '@prisma/client';
import { ProjectSafetyRoleService } from './project-safety-role.service';
export declare class ProjectSafetyRoleController {
    private readonly roles;
    constructor(roles: ProjectSafetyRoleService);
    list(projectId: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    upsert(body: {
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
    remove(projectId: string, userId: string): Promise<{
        ok: boolean;
    }>;
}
