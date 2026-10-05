import { AcpAccessService } from './acp-access.service';
import { AcpService } from './acp.service';
export declare class AcpController {
    private readonly acp;
    private readonly access;
    constructor(acp: AcpService, access: AcpAccessService);
    listTenants(): import(".prisma/client").Prisma.PrismaPromise<({
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
                limitsJson: import(".prisma/client").Prisma.JsonValue;
                featuresJson: import(".prisma/client").Prisma.JsonValue;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            tenantId: string;
            tierId: string;
            status: import(".prisma/client").$Enums.AcpSubscriptionStatus;
            seatsPurchased: number;
            modulesEnabled: import(".prisma/client").Prisma.JsonValue;
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
        metadata: import(".prisma/client").Prisma.JsonValue;
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
                limitsJson: import(".prisma/client").Prisma.JsonValue;
                featuresJson: import(".prisma/client").Prisma.JsonValue;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            tenantId: string;
            tierId: string;
            status: import(".prisma/client").$Enums.AcpSubscriptionStatus;
            seatsPurchased: number;
            modulesEnabled: import(".prisma/client").Prisma.JsonValue;
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
        metadata: import(".prisma/client").Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createTenant(body: {
        slug: string;
        name: string;
        companyId?: number;
        status?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
                limitsJson: import(".prisma/client").Prisma.JsonValue;
                featuresJson: import(".prisma/client").Prisma.JsonValue;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            tenantId: string;
            tierId: string;
            status: import(".prisma/client").$Enums.AcpSubscriptionStatus;
            seatsPurchased: number;
            modulesEnabled: import(".prisma/client").Prisma.JsonValue;
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
        metadata: import(".prisma/client").Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateTenant(id: string, body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
                limitsJson: import(".prisma/client").Prisma.JsonValue;
                featuresJson: import(".prisma/client").Prisma.JsonValue;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            tenantId: string;
            tierId: string;
            status: import(".prisma/client").$Enums.AcpSubscriptionStatus;
            seatsPurchased: number;
            modulesEnabled: import(".prisma/client").Prisma.JsonValue;
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
        metadata: import(".prisma/client").Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteTenant(id: string, req: {
        user: {
            id: number;
        };
    }): Promise<{
        ok: boolean;
    }>;
    listUsers(tenantId?: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    createUser(body: {
        email: string;
        username: string;
        password: string;
        role?: string;
        acpTenantId?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        username: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        acpTenantId: string;
        active: boolean;
    }>;
    getUser(userId: string): Promise<{
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
    deleteUser(userId: string, req: {
        user: {
            id: number;
        };
    }): Promise<{
        ok: boolean;
    }>;
    updateUser(userId: string, body: {
        role?: string;
        acpTenantId?: string | null;
        active?: boolean;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
    assignUserTenant(userId: string, body: {
        tenantId: string | null;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
    setUserActive(userId: string, body: {
        active: boolean;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
    listRoles(tenantId?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    createRole(body: {
        key: string;
        name: string;
        description?: string;
        tenantId?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        key: string;
        name: string;
        description: string | null;
        tenantId: string | null;
        isSystem: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRole(id: string, body: {
        name?: string;
        description?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        key: string;
        name: string;
        description: string | null;
        tenantId: string | null;
        isSystem: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteRole(id: string, req: {
        user: {
            id: number;
        };
    }): Promise<{
        ok: boolean;
    }>;
    assignRole(userId: string, body: {
        roleId: string;
        tenantId?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
    removeRole(userId: string, roleId: string, tenantId: string | undefined, req: {
        user: {
            id: number;
        };
    }): Promise<{
        ok: boolean;
    }>;
    listPermissions(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        key: string;
        module: string;
        action: string;
        description: string | null;
        createdAt: Date;
    }[]>;
    permissionMatrix(): Promise<{
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
    setRolePermissions(roleId: string, body: {
        permissionIds: string[];
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
    listTiers(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        key: string;
        name: string;
        description: string | null;
        sortOrder: number;
        limitsJson: import(".prisma/client").Prisma.JsonValue;
        featuresJson: import(".prisma/client").Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    assignSubscription(tenantId: string, body: {
        tierId: string;
        status?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        tier: {
            id: string;
            key: string;
            name: string;
            description: string | null;
            sortOrder: number;
            limitsJson: import(".prisma/client").Prisma.JsonValue;
            featuresJson: import(".prisma/client").Prisma.JsonValue;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        tenantId: string;
        tierId: string;
        status: import(".prisma/client").$Enums.AcpSubscriptionStatus;
        seatsPurchased: number;
        modulesEnabled: import(".prisma/client").Prisma.JsonValue;
        renewalDate: Date | null;
        startsAt: Date;
        endsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignAddons(tenantId: string, body: {
        featureKeys: string[];
        enabled?: boolean;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<any[]>;
    setTenantModules(tenantId: string, body: {
        featureKeys: string[];
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        updated: number;
        featureKeys: string[];
    }>;
    listFeatures(): import(".prisma/client").Prisma.PrismaPromise<{
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
    toggleTenantFeature(tenantId: string, featureFlagId: string, body: {
        enabled: boolean;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
    updateFeatureDefault(id: string, body: {
        defaultEnabled: boolean;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
    auditLogs(tenantId?: string, limit?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
        metadata: import(".prisma/client").Prisma.JsonValue;
        ip: string | null;
        createdAt: Date;
    })[]>;
}
