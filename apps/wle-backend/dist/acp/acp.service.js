"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcpService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_log_service_1 = require("../audit/audit-log.service");
const audit_actions_1 = require("../audit/audit-actions");
let AcpService = class AcpService {
    constructor(prisma, auditLog) {
        this.prisma = prisma;
        this.auditLog = auditLog;
    }
    async audit(actorUserId, action, entityType, entityId, tenantId, metadata) {
        await this.prisma.acpAuditLog.create({
            data: {
                actorUserId,
                tenantId: tenantId !== null && tenantId !== void 0 ? tenantId : undefined,
                action,
                entityType,
                entityId,
                metadata: (metadata !== null && metadata !== void 0 ? metadata : {}),
            },
        });
        const centralAction = mapAcpActionToCentral(action);
        if (centralAction) {
            await this.auditLog.logAudit({ id: actorUserId !== null && actorUserId !== void 0 ? actorUserId : null }, centralAction, {
                type: entityType,
                id: entityId !== null && entityId !== void 0 ? entityId : 'unknown',
            }, Object.assign(Object.assign({}, metadata), { acpTenantId: tenantId !== null && tenantId !== void 0 ? tenantId : null }));
        }
    }
    listTenants() {
        return this.prisma.acpTenant.findMany({
            include: {
                subscription: { include: { tier: true } },
                _count: { select: { users: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async getTenant(id) {
        const row = await this.prisma.acpTenant.findUnique({
            where: { id },
            include: {
                subscription: { include: { tier: true } },
                tenantFeatureFlags: { include: { featureFlag: true } },
                users: {
                    select: { id: true, email: true, username: true, role: true },
                },
            },
        });
        if (!row)
            throw new common_1.NotFoundException('Tenant not found');
        return row;
    }
    async createTenant(data, actorId) {
        var _a, _b;
        const row = await this.prisma.acpTenant.create({
            data: {
                slug: data.slug,
                name: data.name,
                companyId: data.companyId,
                status: (_a = data.status) !== null && _a !== void 0 ? _a : client_1.AcpTenantStatus.ACTIVE,
            },
        });
        const tier = (_b = (await this.prisma.acpSubscriptionTier.findUnique({
            where: { key: 'basic' },
        }))) !== null && _b !== void 0 ? _b : (await this.prisma.acpSubscriptionTier.findUnique({
            where: { key: 'free' },
        }));
        if (tier) {
            await this.prisma.acpTenantSubscription.create({
                data: {
                    tenantId: row.id,
                    tierId: tier.id,
                    status: client_1.AcpSubscriptionStatus.ACTIVE,
                },
            });
        }
        await this.audit(actorId, 'tenant.created', 'tenant', row.id, row.id);
        return this.getTenant(row.id);
    }
    async updateTenant(id, data, actorId) {
        await this.getTenant(id);
        await this.prisma.acpTenant.update({ where: { id }, data });
        await this.audit(actorId, 'tenant.updated', 'tenant', id, id, data);
        return this.getTenant(id);
    }
    async deleteTenant(id, actorId) {
        await this.getTenant(id);
        await this.prisma.acpTenant.delete({ where: { id } });
        await this.audit(actorId, 'tenant.deleted', 'tenant', id, id);
        return { ok: true };
    }
    listUsers(tenantId) {
        return this.prisma.user.findMany({
            where: tenantId ? { acpTenantId: tenantId } : undefined,
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                active: true,
                acpTenantId: true,
                createdAt: true,
                acpUserRoles: {
                    include: { role: { select: { id: true, key: true, name: true } } },
                },
            },
            orderBy: { email: 'asc' },
            take: 500,
        });
    }
    async createUser(data, actorId) {
        var _a;
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing)
            throw new common_1.BadRequestException('Email already registered');
        const hash = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                password: hash,
                role: (_a = data.role) !== null && _a !== void 0 ? _a : client_1.UserRole.WORKER,
                acpTenantId: data.acpTenantId,
                active: true,
            },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                active: true,
                acpTenantId: true,
            },
        });
        await this.audit(actorId, 'user.created', 'user', String(user.id), data.acpTenantId, {
            email: data.email,
            role: user.role,
        });
        return user;
    }
    async deleteUser(userId, actorId) {
        var _a;
        const user = await this.getUser(userId);
        await this.prisma.user.delete({ where: { id: userId } });
        await this.audit(actorId, 'user.deleted', 'user', String(userId), (_a = user.acpTenantId) !== null && _a !== void 0 ? _a : undefined);
        return { ok: true };
    }
    async getUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                active: true,
                acpTenantId: true,
                companyId: true,
                createdAt: true,
                acpUserRoles: {
                    include: { role: { select: { id: true, key: true, name: true } } },
                },
                worker: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateUser(userId, data, actorId) {
        var _a;
        await this.getUser(userId);
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: Object.assign(Object.assign(Object.assign({}, (data.role ? { role: data.role } : {})), (data.acpTenantId !== undefined
                ? { acpTenantId: data.acpTenantId }
                : {})), (data.active !== undefined ? { active: data.active } : {})),
        });
        await this.audit(actorId, 'user.updated', 'user', String(userId), (_a = user.acpTenantId) !== null && _a !== void 0 ? _a : undefined, data);
        return this.getUser(userId);
    }
    async setUserActive(userId, active, actorId) {
        return this.updateUser(userId, { active }, actorId);
    }
    async assignUserTenant(userId, tenantId, actorId) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: { acpTenantId: tenantId },
        });
        await this.audit(actorId, 'user.tenant_assigned', 'user', String(userId), tenantId !== null && tenantId !== void 0 ? tenantId : undefined, {
            tenantId,
        });
        return user;
    }
    async setTenantFeatureKeys(tenantId, featureKeys, enabled, actorId) {
        await this.getTenant(tenantId);
        const flags = await this.prisma.acpFeatureFlag.findMany({
            where: { key: { in: featureKeys } },
        });
        const results = [];
        for (const flag of flags) {
            results.push(await this.setTenantFeatureFlag(tenantId, flag.id, enabled, actorId));
        }
        await this.audit(actorId, 'tenant.addons_updated', 'tenant', tenantId, tenantId, {
            featureKeys,
            enabled,
        });
        return results;
    }
    async setTenantModules(tenantId, featureKeys, actorId) {
        await this.getTenant(tenantId);
        const flags = await this.prisma.acpFeatureFlag.findMany();
        const results = [];
        for (const flag of flags) {
            const on = featureKeys.includes(flag.key);
            results.push(await this.setTenantFeatureFlag(tenantId, flag.id, on, actorId));
        }
        await this.audit(actorId, 'tenant.modules_updated', 'tenant', tenantId, tenantId, {
            featureKeys,
        });
        return { updated: results.length, featureKeys };
    }
    listRoles(tenantId) {
        return this.prisma.acpRole.findMany({
            where: tenantId !== undefined ? { tenantId } : {},
            include: {
                permissions: { include: { permission: true } },
                _count: { select: { userRoles: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async createRole(data, actorId) {
        const row = await this.prisma.acpRole.create({
            data: {
                key: data.key,
                name: data.name,
                description: data.description,
                tenantId: data.tenantId,
            },
        });
        await this.audit(actorId, 'role.created', 'role', row.id, data.tenantId);
        return row;
    }
    async updateRole(id, data, actorId) {
        var _a;
        const row = await this.prisma.acpRole.update({ where: { id }, data });
        await this.audit(actorId, 'role.updated', 'role', id, (_a = row.tenantId) !== null && _a !== void 0 ? _a : undefined);
        return row;
    }
    async deleteRole(id, actorId) {
        var _a;
        const row = await this.prisma.acpRole.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Role not found');
        if (row.isSystem)
            throw new common_1.BadRequestException('Cannot delete system role');
        await this.prisma.acpRole.delete({ where: { id } });
        await this.audit(actorId, 'role.deleted', 'role', id, (_a = row.tenantId) !== null && _a !== void 0 ? _a : undefined);
        return { ok: true };
    }
    async assignUserRole(userId, roleId, tenantId, actorId) {
        const row = await this.prisma.acpUserRole.create({
            data: { userId, roleId, tenantId },
            include: { role: true },
        });
        await this.audit(actorId, 'user.role_assigned', 'user_role', row.id, tenantId, {
            userId,
            roleId,
        });
        return row;
    }
    async removeUserRole(userId, roleId, tenantId, actorId) {
        const existing = await this.prisma.acpUserRole.findFirst({
            where: { userId, roleId, tenantId: tenantId !== null && tenantId !== void 0 ? tenantId : null },
        });
        if (!existing)
            throw new common_1.NotFoundException('User role assignment not found');
        await this.prisma.acpUserRole.delete({ where: { id: existing.id } });
        await this.audit(actorId, 'user.role_removed', 'user_role', existing.id, tenantId, {
            userId,
            roleId,
        });
        return { ok: true };
    }
    listPermissions() {
        return this.prisma.acpPermission.findMany({
            orderBy: [{ module: 'asc' }, { key: 'asc' }],
        });
    }
    async getPermissionMatrix() {
        const [roles, permissions] = await Promise.all([
            this.listRoles(),
            this.listPermissions(),
        ]);
        return { roles, permissions };
    }
    async setRolePermissions(roleId, permissionIds, actorId) {
        var _a;
        await this.prisma.acpRolePermission.deleteMany({ where: { roleId } });
        if (permissionIds.length) {
            await this.prisma.acpRolePermission.createMany({
                data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
                skipDuplicates: true,
            });
        }
        const role = await this.prisma.acpRole.findUnique({
            where: { id: roleId },
            include: { permissions: { include: { permission: true } } },
        });
        await this.audit(actorId, 'role.permissions_updated', 'role', roleId, (_a = role === null || role === void 0 ? void 0 : role.tenantId) !== null && _a !== void 0 ? _a : undefined, {
            permissionIds,
        });
        return role;
    }
    listTiers() {
        return this.prisma.acpSubscriptionTier.findMany({
            orderBy: { sortOrder: 'asc' },
        });
    }
    async assignTenantSubscription(tenantId, tierId, status, actorId) {
        await this.getTenant(tenantId);
        const row = await this.prisma.acpTenantSubscription.upsert({
            where: { tenantId },
            create: {
                tenantId,
                tierId,
                status: status !== null && status !== void 0 ? status : client_1.AcpSubscriptionStatus.ACTIVE,
            },
            update: { tierId, status: status !== null && status !== void 0 ? status : client_1.AcpSubscriptionStatus.ACTIVE },
            include: { tier: true },
        });
        await this.audit(actorId, 'subscription.assigned', 'tenant_subscription', row.id, tenantId, {
            tierId,
        });
        return row;
    }
    listFeatureFlags() {
        return this.prisma.acpFeatureFlag.findMany({ orderBy: { key: 'asc' } });
    }
    async setTenantFeatureFlag(tenantId, featureFlagId, enabled, actorId) {
        const row = await this.prisma.acpTenantFeatureFlag.upsert({
            where: { tenantId_featureFlagId: { tenantId, featureFlagId } },
            create: { tenantId, featureFlagId, enabled },
            update: { enabled },
            include: { featureFlag: true },
        });
        await this.audit(actorId, 'feature_flag.toggled', 'tenant_feature_flag', featureFlagId, tenantId, {
            enabled,
        });
        return row;
    }
    async updateFeatureFlagDefault(id, defaultEnabled, actorId) {
        const row = await this.prisma.acpFeatureFlag.update({
            where: { id },
            data: { defaultEnabled },
        });
        await this.audit(actorId, 'feature_flag.default_updated', 'feature_flag', id);
        return row;
    }
    listAuditLogs(params) {
        var _a;
        return this.prisma.acpAuditLog.findMany({
            where: (params === null || params === void 0 ? void 0 : params.tenantId) ? { tenantId: params.tenantId } : undefined,
            include: { actor: { select: { id: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            take: (_a = params === null || params === void 0 ? void 0 : params.limit) !== null && _a !== void 0 ? _a : 100,
        });
    }
};
exports.AcpService = AcpService;
exports.AcpService = AcpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], AcpService);
function mapAcpActionToCentral(action) {
    switch (action) {
        case 'role.created':
            return audit_actions_1.AuditAction.ACP_ROLE_CREATED;
        case 'role.updated':
            return audit_actions_1.AuditAction.ACP_ROLE_UPDATED;
        case 'role.deleted':
            return audit_actions_1.AuditAction.ACP_ROLE_DELETED;
        case 'user.role_assigned':
            return audit_actions_1.AuditAction.ACP_USER_ROLE_ASSIGNED;
        case 'user.role_removed':
            return audit_actions_1.AuditAction.ACP_USER_ROLE_REMOVED;
        case 'role.permissions_updated':
            return audit_actions_1.AuditAction.ACP_PERMISSIONS_UPDATED;
        default:
            return null;
    }
}
//# sourceMappingURL=acp.service.js.map