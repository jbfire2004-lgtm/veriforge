import { Prisma, AcpTenantStatus, AcpSubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
export declare class AcpService {
    private readonly prisma;
    private readonly auditLog;
    constructor(prisma: PrismaService, auditLog: AuditLogService);
    private audit;
    listTenants(): Prisma.PrismaPromise<({
        _count: {
            users: number;
        };
        subscription: {
            tier: {
                id: string;
                key: string;
                name: string;
                description: string | null;
                sortOrder: number;
                limitsJson: Prisma.JsonValue;
                featuresJson: Prisma.JsonValue;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            tenantId: string;
            tierId: string;
            status: import(".prisma/client").$Enums.AcpSubscriptionStatus;
            seatsPurchased: number;
            modulesEnabled: Prisma.JsonValue;
            renewalDate: Date | null;
            startsAt: Date;
            endsAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        slug: string;
        name: string;
        companyId: number | null;
        status: import(".prisma/client").$Enums.AcpTenantStatus;
        metadata: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getTenant(id: string): Promise<{
        users: {
            id: number;
            username: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        subscription: {
            tier: {
                id: string;
                key: string;
                name: string;
                description: string | null;
                sortOrder: number;
                limitsJson: Prisma.JsonValue;
                featuresJson: Prisma.JsonValue;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            tenantId: string;
            tierId: string;
            status: import(".prisma/client").$Enums.AcpSubscriptionStatus;
            seatsPurchased: number;
            modulesEnabled: Prisma.JsonValue;
            renewalDate: Date | null;
            startsAt: Date;
            endsAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        tenantFeatureFlags: ({
            featureFlag: {
                id: string;
                key: string;
                name: string;
                description: string | null;
                defaultEnabled: boolean;
                requiredTierKey: string | null;
                module: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            tenantId: string;
            featureFlagId: string;
            enabled: boolean;
        })[];
    } & {
        id: string;
        slug: string;
        name: string;
        companyId: number | null;
        status: import(".prisma/client").$Enums.AcpTenantStatus;
        metadata: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createTenant(data: {
        slug: string;
        name: string;
        companyId?: number;
        status?: AcpTenantStatus;
    }, actorId?: number): Promise<{
        users: {
            id: number;
            username: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        subscription: {
            tier: {
                id: string;
                key: string;
                name: string;
                description: string | null;
                sortOrder: number;
                limitsJson: Prisma.JsonValue;
                featuresJson: Prisma.JsonValue;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            tenantId: string;
            tierId: string;
            status: import(".prisma/client").$Enums.AcpSubscriptionStatus;
            seatsPurchased: number;
            modulesEnabled: Prisma.JsonValue;
            renewalDate: Date | null;
            startsAt: Date;
            endsAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        tenantFeatureFlags: ({
            featureFlag: {
                id: string;
                key: string;
                name: string;
                description: string | null;
                defaultEnabled: boolean;
                requiredTierKey: string | null;
                module: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            tenantId: string;
            featureFlagId: string;
            enabled: boolean;
        })[];
    } & {
        id: string;
        slug: string;
        name: string;
        companyId: number | null;
        status: import(".prisma/client").$Enums.AcpTenantStatus;
        metadata: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateTenant(id: string, data: Partial<{
        name: string;
        slug: string;
        status: AcpTenantStatus;
        companyId: number | null;
    }>, actorId?: number): Promise<{
        users: {
            id: number;
            username: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        }[];
        subscription: {
            tier: {
                id: string;
                key: string;
                name: string;
                description: string | null;
                sortOrder: number;
                limitsJson: Prisma.JsonValue;
                featuresJson: Prisma.JsonValue;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            tenantId: string;
            tierId: string;
            status: import(".prisma/client").$Enums.AcpSubscriptionStatus;
            seatsPurchased: number;
            modulesEnabled: Prisma.JsonValue;
            renewalDate: Date | null;
            startsAt: Date;
            endsAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        tenantFeatureFlags: ({
            featureFlag: {
                id: string;
                key: string;
                name: string;
                description: string | null;
                defaultEnabled: boolean;
                requiredTierKey: string | null;
                module: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            tenantId: string;
            featureFlagId: string;
            enabled: boolean;
        })[];
    } & {
        id: string;
        slug: string;
        name: string;
        companyId: number | null;
        status: import(".prisma/client").$Enums.AcpTenantStatus;
        metadata: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteTenant(id: string, actorId?: number): Promise<{
        ok: boolean;
    }>;
    listUsers(tenantId?: string): Prisma.PrismaPromise<{
        id: number;
        username: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        acpTenantId: string;
        active: boolean;
        createdAt: Date;
        acpUserRoles: ({
            role: {
                id: string;
                name: string;
                key: string;
            };
        } & {
            id: string;
            userId: number;
            roleId: string;
            tenantId: string | null;
            createdAt: Date;
        })[];
    }[]>;
    createUser(data: {
        email: string;
        username: string;
        password: string;
        role?: string;
        acpTenantId?: string;
    }, actorId?: number): Promise<{
        id: number;
        username: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        acpTenantId: string;
        active: boolean;
    }>;
    deleteUser(userId: number, actorId?: number): Promise<{
        ok: boolean;
    }>;
    getUser(userId: number): Promise<{
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        id: number;
        username: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        companyId: number;
        acpTenantId: string;
        active: boolean;
        createdAt: Date;
        acpUserRoles: ({
            role: {
                id: string;
                name: string;
                key: string;
            };
        } & {
            id: string;
            userId: number;
            roleId: string;
            tenantId: string | null;
            createdAt: Date;
        })[];
    }>;
    updateUser(userId: number, data: {
        role?: string;
        acpTenantId?: string | null;
        active?: boolean;
    }, actorId?: number): Promise<{
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        id: number;
        username: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        companyId: number;
        acpTenantId: string;
        active: boolean;
        createdAt: Date;
        acpUserRoles: ({
            role: {
                id: string;
                name: string;
                key: string;
            };
        } & {
            id: string;
            userId: number;
            roleId: string;
            tenantId: string | null;
            createdAt: Date;
        })[];
    }>;
    setUserActive(userId: number, active: boolean, actorId?: number): Promise<{
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        id: number;
        username: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        companyId: number;
        acpTenantId: string;
        active: boolean;
        createdAt: Date;
        acpUserRoles: ({
            role: {
                id: string;
                name: string;
                key: string;
            };
        } & {
            id: string;
            userId: number;
            roleId: string;
            tenantId: string | null;
            createdAt: Date;
        })[];
    }>;
    assignUserTenant(userId: number, tenantId: string | null, actorId?: number): Promise<{
        id: number;
        username: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        companyId: number | null;
        unionHallId: number | null;
        trainingProviderId: number | null;
        acpTenantId: string | null;
        active: boolean;
        createdAt: Date;
    }>;
    setTenantFeatureKeys(tenantId: string, featureKeys: string[], enabled: boolean, actorId?: number): Promise<any[]>;
    setTenantModules(tenantId: string, featureKeys: string[], actorId?: number): Promise<{
        updated: number;
        featureKeys: string[];
    }>;
    listRoles(tenantId?: string): Prisma.PrismaPromise<({
        _count: {
            userRoles: number;
        };
        permissions: ({
            permission: {
                id: string;
                key: string;
                module: string;
                action: string;
                description: string | null;
                createdAt: Date;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        key: string;
        name: string;
        description: string | null;
        tenantId: string | null;
        isSystem: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createRole(data: {
        key: string;
        name: string;
        description?: string;
        tenantId?: string;
    }, actorId?: number): Promise<{
        id: string;
        key: string;
        name: string;
        description: string | null;
        tenantId: string | null;
        isSystem: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRole(id: string, data: Partial<{
        name: string;
        description: string;
    }>, actorId?: number): Promise<{
        id: string;
        key: string;
        name: string;
        description: string | null;
        tenantId: string | null;
        isSystem: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteRole(id: string, actorId?: number): Promise<{
        ok: boolean;
    }>;
    assignUserRole(userId: number, roleId: string, tenantId?: string, actorId?: number): Promise<{
        role: {
            id: string;
            key: string;
            name: string;
            description: string | null;
            tenantId: string | null;
            isSystem: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        userId: number;
        roleId: string;
        tenantId: string | null;
        createdAt: Date;
    }>;
    removeUserRole(userId: number, roleId: string, tenantId?: string, actorId?: number): Promise<{
        ok: boolean;
    }>;
    listPermissions(): Prisma.PrismaPromise<{
        id: string;
        key: string;
        module: string;
        action: string;
        description: string | null;
        createdAt: Date;
    }[]>;
    getPermissionMatrix(): Promise<{
        roles: ({
            _count: {
                userRoles: number;
            };
            permissions: ({
                permission: {
                    id: string;
                    key: string;
                    module: string;
                    action: string;
                    description: string | null;
                    createdAt: Date;
                };
            } & {
                roleId: string;
                permissionId: string;
            })[];
        } & {
            id: string;
            key: string;
            name: string;
            description: string | null;
            tenantId: string | null;
            isSystem: boolean;
            createdAt: Date;
            updatedAt: Date;
        })[];
        permissions: {
            id: string;
            key: string;
            module: string;
            action: string;
            description: string | null;
            createdAt: Date;
        }[];
    }>;
    setRolePermissions(roleId: string, permissionIds: string[], actorId?: number): Promise<{
        permissions: ({
            permission: {
                id: string;
                key: string;
                module: string;
                action: string;
                description: string | null;
                createdAt: Date;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        key: string;
        name: string;
        description: string | null;
        tenantId: string | null;
        isSystem: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listTiers(): Prisma.PrismaPromise<{
        id: string;
        key: string;
        name: string;
        description: string | null;
        sortOrder: number;
        limitsJson: Prisma.JsonValue;
        featuresJson: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    assignTenantSubscription(tenantId: string, tierId: string, status?: AcpSubscriptionStatus, actorId?: number): Promise<{
        tier: {
            id: string;
            key: string;
            name: string;
            description: string | null;
            sortOrder: number;
            limitsJson: Prisma.JsonValue;
            featuresJson: Prisma.JsonValue;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        tenantId: string;
        tierId: string;
        status: import(".prisma/client").$Enums.AcpSubscriptionStatus;
        seatsPurchased: number;
        modulesEnabled: Prisma.JsonValue;
        renewalDate: Date | null;
        startsAt: Date;
        endsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listFeatureFlags(): Prisma.PrismaPromise<{
        id: string;
        key: string;
        name: string;
        description: string | null;
        defaultEnabled: boolean;
        requiredTierKey: string | null;
        module: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    setTenantFeatureFlag(tenantId: string, featureFlagId: string, enabled: boolean, actorId?: number): Promise<{
        featureFlag: {
            id: string;
            key: string;
            name: string;
            description: string | null;
            defaultEnabled: boolean;
            requiredTierKey: string | null;
            module: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        tenantId: string;
        featureFlagId: string;
        enabled: boolean;
    }>;
    updateFeatureFlagDefault(id: string, defaultEnabled: boolean, actorId?: number): Promise<{
        id: string;
        key: string;
        name: string;
        description: string | null;
        defaultEnabled: boolean;
        requiredTierKey: string | null;
        module: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listAuditLogs(params?: {
        tenantId?: string;
        limit?: number;
    }): Prisma.PrismaPromise<({
        actor: {
            id: number;
            email: string;
        };
    } & {
        id: string;
        tenantId: string | null;
        actorUserId: number | null;
        action: string;
        entityType: string;
        entityId: string | null;
        metadata: Prisma.JsonValue;
        ip: string | null;
        createdAt: Date;
    })[]>;
}
