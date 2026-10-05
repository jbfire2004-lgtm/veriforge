import { ProjectSafetyRoleType, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export type CailActor = {
    id: number;
    role: UserRole;
    companyId?: number | null;
    projectRoles?: Array<{
        projectId: number;
        role: ProjectSafetyRoleType;
    }>;
};
export declare class CailScopeService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    resolveActor(userId: number, role: UserRole, projectId?: number): Promise<CailActor>;
    isPrime(actor: CailActor): boolean;
    isClientReadonly(actor: CailActor, projectId?: number): boolean;
    buildListWhere(actor: CailActor, filters: {
        projectId?: number;
        status?: string;
        sourceType?: string;
        ownerCompanyId?: number;
    }): Record<string, unknown>;
    canVerify(actor: CailActor, projectId?: number): boolean;
    canAccessEntry(actor: CailActor, entry: {
        ownerCompanyId: number;
        projectId: number;
        assignedUserId?: number | null;
    }): boolean;
}
