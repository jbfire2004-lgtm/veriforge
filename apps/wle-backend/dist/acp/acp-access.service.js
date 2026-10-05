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
exports.AcpAccessService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const acp_constants_1 = require("./acp.constants");
const acp_module_catalog_1 = require("./acp-module-catalog");
const TIER_RANK = {
    free: 0,
    basic: 1,
    pro: 2,
    professional: 3,
    pm: 4,
    predictive: 5,
    autonomous: 6,
    marketplace: 7,
    command_center: 8,
    global_intelligence: 9,
    enterprise: 10,
};
let AcpAccessService = class AcpAccessService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    isLegacyPlatformAdmin(role) {
        return role === client_1.UserRole.SUPER_ADMIN || role === client_1.UserRole.ADMIN;
    }
    async resolveContext(userId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
                acpTenantId: true,
                acpUserRoles: {
                    include: {
                        role: {
                            include: {
                                permissions: { include: { permission: true } },
                            },
                        },
                    },
                },
                acpTenant: {
                    include: {
                        subscription: { include: { tier: true } },
                        tenantFeatureFlags: { include: { featureFlag: true } },
                    },
                },
            },
        });
        if (!user) {
            return {
                userId,
                tenantId: null,
                legacyRole: client_1.UserRole.WORKER,
                permissions: [],
                features: [],
                subscriptionTierKey: null,
                subscriptionStatus: null,
                isPlatformAdmin: false,
            };
        }
        const isPlatformAdmin = this.isLegacyPlatformAdmin(user.role);
        const permissionSet = new Set();
        for (const ur of user.acpUserRoles) {
            for (const rp of ur.role.permissions) {
                permissionSet.add(rp.permission.key);
            }
        }
        if (isPlatformAdmin) {
            permissionSet.add('acp.manage');
            permissionSet.add('*');
        }
        const tierKey = (_d = (_c = (_b = (_a = user.acpTenant) === null || _a === void 0 ? void 0 : _a.subscription) === null || _b === void 0 ? void 0 : _b.tier) === null || _c === void 0 ? void 0 : _c.key) !== null && _d !== void 0 ? _d : null;
        const tierFeatures = (_h = (_g = (_f = (_e = user.acpTenant) === null || _e === void 0 ? void 0 : _e.subscription) === null || _f === void 0 ? void 0 : _f.tier) === null || _g === void 0 ? void 0 : _g.featuresJson) !== null && _h !== void 0 ? _h : [];
        const featureSet = new Set();
        const flags = await this.prisma.acpFeatureFlag.findMany();
        for (const flag of flags) {
            const override = (_j = user.acpTenant) === null || _j === void 0 ? void 0 : _j.tenantFeatureFlags.find((t) => t.featureFlagId === flag.id);
            const enabled = (_k = override === null || override === void 0 ? void 0 : override.enabled) !== null && _k !== void 0 ? _k : flag.defaultEnabled;
            if (!enabled)
                continue;
            if (flag.requiredTierKey && tierKey) {
                const req = (_l = TIER_RANK[flag.requiredTierKey]) !== null && _l !== void 0 ? _l : 0;
                const cur = (_m = TIER_RANK[tierKey]) !== null && _m !== void 0 ? _m : 0;
                if (cur < req)
                    continue;
            }
            featureSet.add(flag.key);
        }
        for (const f of tierFeatures)
            featureSet.add(f);
        return {
            userId: user.id,
            tenantId: user.acpTenantId,
            legacyRole: user.role,
            permissions: [...permissionSet],
            features: [...featureSet],
            subscriptionTierKey: tierKey,
            subscriptionStatus: (_q = (_p = (_o = user.acpTenant) === null || _o === void 0 ? void 0 : _o.subscription) === null || _p === void 0 ? void 0 : _p.status) !== null && _q !== void 0 ? _q : null,
            isPlatformAdmin,
        };
    }
    async check(input) {
        var _a, _b, _c, _d, _e;
        const ctx = await this.resolveContext(input.userId);
        if (ctx.isPlatformAdmin)
            return { allowed: true };
        if (input.permission) {
            const has = ctx.permissions.includes('*') ||
                ctx.permissions.includes(input.permission);
            if (!has) {
                return {
                    allowed: false,
                    reason: `Missing permission: ${input.permission}`,
                };
            }
        }
        if (input.feature) {
            if (!ctx.features.includes(input.feature)) {
                return { allowed: false, reason: `Feature disabled: ${input.feature}` };
            }
        }
        if (input.module) {
            const gate = acp_constants_1.HUB_MODULE_GATES[input.module];
            if (gate === null || gate === void 0 ? void 0 : gate.permission) {
                const r = await this.check({
                    userId: input.userId,
                    permission: gate.permission,
                });
                if (!r.allowed)
                    return r;
            }
            if (gate === null || gate === void 0 ? void 0 : gate.feature) {
                const r = await this.check({
                    userId: input.userId,
                    feature: gate.feature,
                });
                if (!r.allowed)
                    return r;
            }
            const minTier = (_a = input.minTier) !== null && _a !== void 0 ? _a : gate === null || gate === void 0 ? void 0 : gate.minTier;
            if (minTier && ctx.subscriptionTierKey) {
                const req = (_b = TIER_RANK[minTier]) !== null && _b !== void 0 ? _b : 0;
                const cur = (_c = TIER_RANK[ctx.subscriptionTierKey]) !== null && _c !== void 0 ? _c : 0;
                if (cur < req) {
                    return {
                        allowed: false,
                        reason: `Subscription tier ${minTier} required`,
                    };
                }
            }
        }
        if (input.minTier && ctx.subscriptionTierKey) {
            const req = (_d = TIER_RANK[input.minTier]) !== null && _d !== void 0 ? _d : 0;
            const cur = (_e = TIER_RANK[ctx.subscriptionTierKey]) !== null && _e !== void 0 ? _e : 0;
            if (cur < req) {
                return {
                    allowed: false,
                    reason: `Subscription tier ${input.minTier} required`,
                };
            }
        }
        return { allowed: true };
    }
    async hubModulesForUser(userId) {
        const ctx = await this.resolveContext(userId);
        return Object.keys(acp_constants_1.HUB_MODULE_GATES).map((moduleId) => {
            var _a, _b;
            if (ctx.isPlatformAdmin)
                return { moduleId, allowed: true };
            const gate = acp_constants_1.HUB_MODULE_GATES[moduleId];
            if (gate.permission &&
                !ctx.permissions.includes(gate.permission) &&
                !ctx.permissions.includes('*')) {
                return { moduleId, allowed: false, reason: 'permission' };
            }
            if (gate.feature && !ctx.features.includes(gate.feature)) {
                return { moduleId, allowed: false, reason: 'feature' };
            }
            if (gate.minTier && ctx.subscriptionTierKey) {
                const req = (_a = TIER_RANK[gate.minTier]) !== null && _a !== void 0 ? _a : 0;
                const cur = (_b = TIER_RANK[ctx.subscriptionTierKey]) !== null && _b !== void 0 ? _b : 0;
                if (cur < req)
                    return { moduleId, allowed: false, reason: 'tier' };
            }
            return { moduleId, allowed: true };
        });
    }
    async getModuleCardsForUser(userId) {
        const ctx = await this.resolveContext(userId);
        const hubModules = await this.hubModulesForUser(userId);
        const hubMap = new Map(hubModules.map((m) => [m.moduleId, m.allowed]));
        return acp_module_catalog_1.VERA_MODULE_CATALOG.map((mod) => {
            const features = [];
            let allowed = true;
            let reason;
            const permission = 'permission' in mod ? mod.permission : undefined;
            const feature = 'feature' in mod ? mod.feature : undefined;
            const hubGateId = 'hubGateId' in mod ? mod.hubGateId : undefined;
            if (permission)
                features.push(permission);
            if (feature)
                features.push(feature);
            if (ctx.isPlatformAdmin) {
                return {
                    key: mod.key,
                    title: mod.title,
                    description: mod.description,
                    href: mod.href,
                    allowed: true,
                    features,
                };
            }
            if (permission &&
                !ctx.permissions.includes(permission) &&
                !ctx.permissions.includes('*')) {
                allowed = false;
                reason = 'permission';
            }
            if (feature && !ctx.features.includes(feature)) {
                allowed = false;
                reason = reason !== null && reason !== void 0 ? reason : 'feature';
            }
            if (hubGateId && hubMap.get(hubGateId) === false) {
                allowed = false;
                reason = reason !== null && reason !== void 0 ? reason : 'permission';
            }
            if (mod.key === 'addons')
                allowed = true;
            return {
                key: mod.key,
                title: mod.title,
                description: mod.description,
                href: mod.href,
                allowed,
                reason,
                features,
            };
        });
    }
};
exports.AcpAccessService = AcpAccessService;
exports.AcpAccessService = AcpAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AcpAccessService);
//# sourceMappingURL=acp-access.service.js.map