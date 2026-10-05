"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcpModule = void 0;
const common_1 = require("@nestjs/common");
const acp_access_controller_1 = require("./acp-access.controller");
const acp_controller_1 = require("./acp.controller");
const acp_service_1 = require("./acp.service");
const acp_access_service_1 = require("./acp-access.service");
const acp_access_guard_1 = require("./acp-access.guard");
const vera_access_guard_1 = require("./vera-access.guard");
const vera_feature_guard_1 = require("./guards/vera-feature.guard");
const vera_module_guard_1 = require("./guards/vera-module.guard");
const vera_permission_guard_1 = require("./guards/vera-permission.guard");
const vera_tier_guard_1 = require("./guards/vera-tier.guard");
const vera_role_guard_1 = require("./guards/vera-role.guard");
const acp_seed_service_1 = require("./acp-seed.service");
let AcpModule = class AcpModule {
};
exports.AcpModule = AcpModule;
exports.AcpModule = AcpModule = __decorate([
    (0, common_1.Module)({
        controllers: [acp_controller_1.AcpController, acp_access_controller_1.AcpAccessController],
        providers: [
            acp_service_1.AcpService,
            acp_access_service_1.AcpAccessService,
            acp_access_guard_1.AcpAccessGuard,
            vera_access_guard_1.VeraAccessGuard,
            vera_permission_guard_1.VeraPermissionGuard,
            vera_feature_guard_1.VeraFeatureGuard,
            vera_tier_guard_1.VeraTierGuard,
            vera_module_guard_1.VeraModuleGuard,
            vera_role_guard_1.VeraRoleGuard,
            acp_seed_service_1.AcpSeedService,
        ],
        exports: [
            acp_access_service_1.AcpAccessService,
            acp_service_1.AcpService,
            vera_access_guard_1.VeraAccessGuard,
            acp_access_guard_1.AcpAccessGuard,
            vera_permission_guard_1.VeraPermissionGuard,
            vera_feature_guard_1.VeraFeatureGuard,
            vera_tier_guard_1.VeraTierGuard,
            vera_module_guard_1.VeraModuleGuard,
            vera_role_guard_1.VeraRoleGuard,
        ],
    })
], AcpModule);
//# sourceMappingURL=acp.module.js.map