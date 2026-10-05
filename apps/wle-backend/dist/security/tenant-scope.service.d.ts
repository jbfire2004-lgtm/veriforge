import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { SecurityActor } from './security.types';
export declare class TenantScopeService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    bypassesTenant(actor: SecurityActor): boolean;
    resolveCompanyId(actor: SecurityActor, requestedCompanyId?: number | null): number | null;
    assertCompanyAccess(actor: SecurityActor, companyId: number): void;
    effectiveCompanyId(actor: SecurityActor, requestedCompanyId?: number): number;
    assertWorkerInTenant(actor: SecurityActor, workerId: number): Promise<void>;
    assertInspectionInTenant(actor: SecurityActor, inspectionId: string): Promise<void>;
    assertEquipmentInTenant(actor: SecurityActor, equipmentId: number): Promise<void>;
    companyWhere<T extends {
        companyId?: number;
    }>(actor: SecurityActor, requestedCompanyId?: number): Prisma.IntFilter | number | undefined;
}
