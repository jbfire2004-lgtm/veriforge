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
exports.AcpSeedService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const acp_constants_1 = require("./acp.constants");
let AcpSeedService = class AcpSeedService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.seedCatalog();
    }
    async seedCatalog() {
        for (const p of acp_constants_1.ACP_PERMISSIONS) {
            await this.prisma.acpPermission.upsert({
                where: { key: p.key },
                create: {
                    key: p.key,
                    module: p.module,
                    action: p.action,
                    description: p.description,
                },
                update: {
                    module: p.module,
                    action: p.action,
                    description: p.description,
                },
            });
        }
        for (const t of acp_constants_1.ACP_SUBSCRIPTION_TIERS) {
            await this.prisma.acpSubscriptionTier.upsert({
                where: { key: t.key },
                create: {
                    key: t.key,
                    name: t.name,
                    sortOrder: t.sortOrder,
                    limitsJson: t.limitsJson,
                    featuresJson: t.featuresJson,
                },
                update: {
                    name: t.name,
                    sortOrder: t.sortOrder,
                    limitsJson: t.limitsJson,
                    featuresJson: t.featuresJson,
                },
            });
        }
        for (const f of acp_constants_1.ACP_FEATURE_FLAGS) {
            await this.prisma.acpFeatureFlag.upsert({
                where: { key: f.key },
                create: {
                    key: f.key,
                    name: f.name,
                    module: f.module,
                    requiredTierKey: f.requiredTierKey,
                    defaultEnabled: f.defaultEnabled,
                },
                update: {
                    name: f.name,
                    module: f.module,
                    requiredTierKey: f.requiredTierKey,
                    defaultEnabled: f.defaultEnabled,
                },
            });
        }
        await this.ensurePlatformAdminRole();
        await this.ensureCompanyAdminRole();
        await this.assignPlatformAdminToLegacyAdmins();
    }
    async ensureCompanyAdminRole() {
        let role = await this.prisma.acpRole.findFirst({
            where: { key: 'company_admin', tenantId: null },
        });
        if (!role) {
            role = await this.prisma.acpRole.create({
                data: {
                    key: 'company_admin',
                    name: 'Company Administrator',
                    description: 'Full Hub, Core, and PM access for a tenant',
                    isSystem: true,
                },
            });
        }
        const keys = [
            'hub.dashboard',
            'core.access',
            'pm.access',
            'pm.safety_hub',
            'pm.inspections',
            'pm.incidents',
            'pm.capa',
            'pm.sms',
            'pm.safety_forms',
            'pm.substance_testing',
            'contractor.portal',
            'admin.workers',
            'admin.equipment',
            'admin.training',
        ];
        const perms = await this.prisma.acpPermission.findMany({
            where: { key: { in: keys } },
        });
        for (const p of perms) {
            await this.prisma.acpRolePermission.upsert({
                where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
                create: { roleId: role.id, permissionId: p.id },
                update: {},
            });
        }
    }
    async ensurePlatformAdminRole() {
        let role = await this.prisma.acpRole.findFirst({
            where: { key: 'platform_admin', tenantId: null },
        });
        if (!role) {
            role = await this.prisma.acpRole.create({
                data: {
                    key: 'platform_admin',
                    name: 'Platform Administrator',
                    description: 'Full platform access via ACP',
                    isSystem: true,
                },
            });
        }
        const perms = await this.prisma.acpPermission.findMany();
        for (const p of perms) {
            await this.prisma.acpRolePermission.upsert({
                where: {
                    roleId_permissionId: { roleId: role.id, permissionId: p.id },
                },
                create: { roleId: role.id, permissionId: p.id },
                update: {},
            });
        }
    }
    async assignPlatformAdminToLegacyAdmins() {
        const role = await this.prisma.acpRole.findFirst({
            where: { key: 'platform_admin', tenantId: null },
        });
        if (!role)
            return;
        const admins = await this.prisma.user.findMany({
            where: { role: { in: [client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN] } },
            select: { id: true },
        });
        for (const user of admins) {
            await this.ensureUserRoleAssignment(user.id, role.id, null);
        }
    }
    async ensureUserRoleAssignment(userId, roleId, tenantId) {
        const existing = await this.prisma.acpUserRole.findFirst({
            where: { userId, roleId, tenantId },
        });
        if (existing)
            return;
        await this.prisma.acpUserRole.create({
            data: { userId, roleId, tenantId },
        });
    }
};
exports.AcpSeedService = AcpSeedService;
exports.AcpSeedService = AcpSeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AcpSeedService);
//# sourceMappingURL=acp-seed.service.js.map