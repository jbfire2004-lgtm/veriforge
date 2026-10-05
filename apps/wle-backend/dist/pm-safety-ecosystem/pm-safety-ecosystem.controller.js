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
exports.PmSafetyEcosystemController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const safety_hub_constants_1 = require("../pm-safety-hub/safety-hub.constants");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
    client_1.UserRole.CONTRACTOR_ADMIN,
];
let PmSafetyEcosystemController = class PmSafetyEcosystemController {
    status() {
        return {
            version: '1.0.0',
            integration: 'unified',
            eventBus: 'in-process',
            pillars: [
                'dashboard',
                'notifications',
                'evidence',
                'corrective_actions',
                'analytics',
            ],
            modules: [
                {
                    id: 'inspections',
                    api: '/api/v1/pm/inspections',
                    ui: '/pm/inspections',
                    capabilities: [
                        'photo_pipeline',
                        'auto_findings',
                        'auto_capa',
                        'contractor_dispatch',
                    ],
                },
                {
                    id: 'investigations',
                    api: '/api/v1/pm/incidents',
                    ui: '/pm/incidents',
                    capabilities: [
                        'taproot_rca',
                        'guided_flow',
                        'capa_bridge',
                        'pdf_report',
                    ],
                },
                {
                    id: 'substance_testing',
                    api: '/api/v1/pm/substance-testing',
                    ui: '/pm/substance-testing',
                    capabilities: ['custody', 'results', 'compliance', 'incident_link'],
                },
                {
                    id: 'predictive_analytics',
                    api: '/api/v1/pm/predictive-safety-analytics',
                    ui: '/pm/predictive-safety-analytics',
                    capabilities: ['weekly_forecast', 'risk_scoring', 'alerts'],
                },
                {
                    id: 'contractor_portal',
                    api: '/api/v1/pm/contractor-portal',
                    ui: '/contractor',
                    capabilities: ['inbox', 'findings', 'compliance', 'messaging'],
                },
                {
                    id: 'safety_hub',
                    api: '/api/v1/pm/safety-hub',
                    ui: '/pm/safety-hub',
                    capabilities: ['aggregate_dashboard', 'evidence_library', 'timeline'],
                },
                {
                    id: 'unified_capa',
                    api: '/api/v1/pm/unified-corrective-action',
                    ui: '/pm/unified-corrective-action',
                    capabilities: ['cross_module_generation', 'publish', 'verification'],
                },
                {
                    id: 'unified_intelligence',
                    api: '/api/v1/pm/unified-safety-intelligence',
                    ui: '/pm/unified-safety-intelligence',
                    capabilities: ['cail_scores', 'recommendations', 'explainability'],
                },
            ],
            domainLinks: safety_hub_constants_1.SAFETY_HUB_MODULE_LINKS,
            offlineSyncTypes: [
                'pmInspections.sync',
                'pmInspectionPhoto.capture',
                'pmIncidents.sync',
                'pmCapa.sync',
                'pmUnifiedCorrectiveAction.sync',
                'pmUnifiedSafetyIntelligence.sync',
            ],
        };
    }
};
exports.PmSafetyEcosystemController = PmSafetyEcosystemController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PmSafetyEcosystemController.prototype, "status", null);
exports.PmSafetyEcosystemController = PmSafetyEcosystemController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety-ecosystem`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES)
], PmSafetyEcosystemController);
//# sourceMappingURL=pm-safety-ecosystem.controller.js.map