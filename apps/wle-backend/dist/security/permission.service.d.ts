import { PrismaService } from '../prisma/prisma.service';
import { type PermissionKey, type SecurityActor } from './security.types';
import { TenantScopeService } from './tenant-scope.service';
export declare class PermissionService {
    private readonly prisma;
    private readonly tenant;
    constructor(prisma: PrismaService, tenant: TenantScopeService);
    hasPermission(actor: SecurityActor, permission: PermissionKey): boolean;
    assertPermission(actor: SecurityActor, permission: PermissionKey): void;
    canViewWorker(actor: SecurityActor, workerId: number): Promise<boolean>;
    assertCanViewWorker(actor: SecurityActor, workerId: number): Promise<void>;
    assertCanEditWorker(actor: SecurityActor, workerId: number): Promise<void>;
    canViewInspection(actor: SecurityActor, inspectionId: string): Promise<boolean>;
    assertCanViewInspection(actor: SecurityActor, inspectionId: string): Promise<void>;
    assertCanEditInspection(actor: SecurityActor, inspectionId: string): Promise<void>;
    assertCanSubmitInspection(actor: SecurityActor, inspectionId: string): Promise<void>;
    assertCanViewCompanyReadiness(actor: SecurityActor, companyId?: number): Promise<void>;
    assertPmModuleAccess(actor: SecurityActor): Promise<void>;
    loadWorkerCompanyId(workerId: number): Promise<number | null>;
    loadInspectionCompanyId(inspectionId: string): Promise<number>;
}
