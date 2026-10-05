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
exports.PmInspectionAutomationConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_inspections_constants_1 = require("./pm-inspections.constants");
let PmInspectionAutomationConfigService = class PmInspectionAutomationConfigService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async isAutoFailureMeetingEnabled(companyId) {
        return this.isTenantFeatureEnabled(companyId, pm_inspections_constants_1.PM_INSPECTION_AUTO_FAILURE_MEETING_FLAG);
    }
    async isTenantFeatureEnabled(companyId, featureKey) {
        var _a;
        const flag = await this.prisma.acpFeatureFlag.findUnique({
            where: { key: featureKey },
        });
        if (!flag)
            return true;
        const tenant = await this.prisma.acpTenant.findFirst({
            where: { companyId },
            include: {
                tenantFeatureFlags: {
                    where: { featureFlagId: flag.id },
                    take: 1,
                },
            },
        });
        if (!tenant) {
            return flag.defaultEnabled;
        }
        const override = tenant.tenantFeatureFlags[0];
        return (_a = override === null || override === void 0 ? void 0 : override.enabled) !== null && _a !== void 0 ? _a : flag.defaultEnabled;
    }
};
exports.PmInspectionAutomationConfigService = PmInspectionAutomationConfigService;
exports.PmInspectionAutomationConfigService = PmInspectionAutomationConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmInspectionAutomationConfigService);
//# sourceMappingURL=pm-inspection-automation-config.service.js.map