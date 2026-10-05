"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiPlatformModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const workers_module_1 = require("../../workers/workers.module");
const companies_module_1 = require("../../companies/companies.module");
const vera_core_module_1 = require("../vera-core/vera-core.module");
const equipment_core_module_1 = require("../equipment-core/equipment-core.module");
const inspection_core_module_1 = require("../inspection-core/inspection-core.module");
const reporting_core_module_1 = require("../reporting-core/reporting-core.module");
const verification_module_1 = require("../../verification/verification.module");
const qr_module_1 = require("../../qr/qr.module");
const field_sync_module_1 = require("../field-sync/field-sync.module");
const dashboard_widgets_module_1 = require("../dashboard-widgets/dashboard-widgets.module");
const analytics_module_1 = require("../../analytics/analytics.module");
const offline_sync_middleware_1 = require("./middleware/offline-sync.middleware");
const domain_event_bus_module_1 = require("./events/domain-event-bus.module");
const compliance_event_handler_1 = require("./events/handlers/compliance-event.handler");
const notification_event_handler_1 = require("./events/handlers/notification-event.handler");
const repositories_1 = require("./repositories");
const services_1 = require("./services");
const workers_api_controller_1 = require("./controllers/workers-api.controller");
const equipment_api_controller_1 = require("./controllers/equipment-api.controller");
const compliance_api_controller_1 = require("./controllers/compliance-api.controller");
const sync_api_controller_1 = require("./controllers/sync-api.controller");
const projects_api_controller_1 = require("./controllers/projects-api.controller");
const companies_api_controller_1 = require("./controllers/companies-api.controller");
const qr_api_controller_1 = require("./controllers/qr-api.controller");
const contracts_api_controller_1 = require("./controllers/contracts-api.controller");
const api_platform_scheduler_1 = require("./jobs/api-platform.scheduler");
const company_scope_guard_1 = require("./guards/company-scope.guard");
const project_scope_guard_1 = require("./guards/project-scope.guard");
const project_compliance_module_1 = require("../project-compliance/project-compliance.module");
let ApiPlatformModule = class ApiPlatformModule {
    configure(consumer) {
        consumer.apply(offline_sync_middleware_1.OfflineSyncMiddleware).forRoutes('api/v1/*');
    }
};
exports.ApiPlatformModule = ApiPlatformModule;
exports.ApiPlatformModule = ApiPlatformModule = __decorate([
    (0, common_1.Module)({
        imports: [
            domain_event_bus_module_1.DomainEventBusModule,
            prisma_module_1.PrismaModule,
            (0, common_1.forwardRef)(() => workers_module_1.WorkersModule),
            companies_module_1.CompaniesModule,
            (0, common_1.forwardRef)(() => vera_core_module_1.VeraCoreModule),
            (0, common_1.forwardRef)(() => equipment_core_module_1.EquipmentCoreModule),
            (0, common_1.forwardRef)(() => inspection_core_module_1.InspectionCoreModule),
            (0, common_1.forwardRef)(() => reporting_core_module_1.ReportingCoreModule),
            (0, common_1.forwardRef)(() => verification_module_1.VerificationModule),
            (0, common_1.forwardRef)(() => qr_module_1.QrModule),
            (0, common_1.forwardRef)(() => field_sync_module_1.FieldSyncModule),
            dashboard_widgets_module_1.DashboardWidgetsModule,
            analytics_module_1.AnalyticsModule,
            project_compliance_module_1.ProjectComplianceModule,
        ],
        controllers: [
            workers_api_controller_1.WorkersApiController,
            equipment_api_controller_1.EquipmentApiController,
            compliance_api_controller_1.ComplianceApiController,
            sync_api_controller_1.SyncApiController,
            sync_api_controller_1.DashboardApiController,
            projects_api_controller_1.ProjectsApiController,
            companies_api_controller_1.CompaniesApiController,
            qr_api_controller_1.QrApiController,
            contracts_api_controller_1.ContractsApiController,
        ],
        providers: [
            compliance_event_handler_1.ComplianceEventHandler,
            notification_event_handler_1.NotificationEventHandler,
            repositories_1.WorkerRepository,
            repositories_1.EquipmentRepository,
            repositories_1.CompanyRepository,
            repositories_1.ProjectRepository,
            repositories_1.TrainingRepository,
            repositories_1.InspectionRepository,
            repositories_1.ComplianceRepository,
            services_1.WorkerApiService,
            services_1.EquipmentApiService,
            services_1.ComplianceApiService,
            services_1.SyncApiService,
            services_1.ProjectApiService,
            services_1.CompanyApiService,
            services_1.QrApiService,
            api_platform_scheduler_1.ApiPlatformScheduler,
            company_scope_guard_1.CompanyScopeGuard,
            project_scope_guard_1.ProjectScopeGuard,
        ],
        exports: [
            domain_event_bus_module_1.DomainEventBusModule,
            services_1.WorkerApiService,
            services_1.EquipmentApiService,
            services_1.ComplianceApiService,
        ],
    })
], ApiPlatformModule);
//# sourceMappingURL=api-platform.module.js.map