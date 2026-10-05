"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardWidgetsModule = void 0;
const common_1 = require("@nestjs/common");
const analytics_module_1 = require("../../analytics/analytics.module");
const assignment_dashboard_module_1 = require("../../assignment-dashboard/assignment-dashboard.module");
const prisma_module_1 = require("../../prisma/prisma.module");
const reporting_core_module_1 = require("../reporting-core/reporting-core.module");
const dashboard_widgets_controller_1 = require("./dashboard-widgets.controller");
const dashboard_widgets_service_1 = require("./dashboard-widgets.service");
const dispatch_pipeline_1 = require("./pipelines/dispatch.pipeline");
const equipment_compliance_pipeline_1 = require("./pipelines/equipment-compliance.pipeline");
const project_readiness_pipeline_1 = require("./pipelines/project-readiness.pipeline");
const provider_approval_pipeline_1 = require("./pipelines/provider-approval.pipeline");
const training_expiry_pipeline_1 = require("./pipelines/training-expiry.pipeline");
const worker_compliance_pipeline_1 = require("./pipelines/worker-compliance.pipeline");
let DashboardWidgetsModule = class DashboardWidgetsModule {
};
exports.DashboardWidgetsModule = DashboardWidgetsModule;
exports.DashboardWidgetsModule = DashboardWidgetsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            reporting_core_module_1.ReportingCoreModule,
            analytics_module_1.AnalyticsModule,
            assignment_dashboard_module_1.AssignmentDashboardModule,
        ],
        controllers: [dashboard_widgets_controller_1.DashboardWidgetsController],
        providers: [
            dashboard_widgets_service_1.DashboardWidgetsService,
            worker_compliance_pipeline_1.WorkerCompliancePipeline,
            equipment_compliance_pipeline_1.EquipmentCompliancePipeline,
            training_expiry_pipeline_1.TrainingExpiryPipeline,
            project_readiness_pipeline_1.ProjectReadinessPipeline,
            provider_approval_pipeline_1.ProviderApprovalPipeline,
            dispatch_pipeline_1.DispatchPipeline,
        ],
        exports: [dashboard_widgets_service_1.DashboardWidgetsService],
    })
], DashboardWidgetsModule);
//# sourceMappingURL=dashboard-widgets.module.js.map