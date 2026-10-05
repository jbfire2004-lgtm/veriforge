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
exports.DashboardWidgetsService = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("../../analytics/analytics.service");
const assignment_dashboard_service_1 = require("../../assignment-dashboard/assignment-dashboard.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const dispatch_pipeline_1 = require("./pipelines/dispatch.pipeline");
const equipment_compliance_pipeline_1 = require("./pipelines/equipment-compliance.pipeline");
const project_readiness_pipeline_1 = require("./pipelines/project-readiness.pipeline");
const provider_approval_pipeline_1 = require("./pipelines/provider-approval.pipeline");
const training_expiry_pipeline_1 = require("./pipelines/training-expiry.pipeline");
const worker_compliance_pipeline_1 = require("./pipelines/worker-compliance.pipeline");
let DashboardWidgetsService = class DashboardWidgetsService {
    constructor(prisma, analytics, assignments, workerCompliance, equipmentCompliance, trainingExpiry, projectReadiness, providerApproval, dispatch) {
        this.prisma = prisma;
        this.analytics = analytics;
        this.assignments = assignments;
        this.workerCompliance = workerCompliance;
        this.equipmentCompliance = equipmentCompliance;
        this.trainingExpiry = trainingExpiry;
        this.projectReadiness = projectReadiness;
        this.providerApproval = providerApproval;
        this.dispatch = dispatch;
    }
    async getBundle(scope) {
        const tasks = [];
        const bundle = {
            generatedAt: new Date().toISOString(),
        };
        if (scope.includeWorkerCompliance) {
            tasks.push(this.workerCompliance.run(scope.companyId).then((data) => {
                bundle.workerCompliance = data;
            }));
        }
        if (scope.includeEquipmentCompliance) {
            tasks.push(this.equipmentCompliance.run(scope.companyId).then((data) => {
                bundle.equipmentCompliance = data;
            }));
        }
        if (scope.includeTrainingExpiry) {
            tasks.push(this.trainingExpiry.run(scope.companyId).then((data) => {
                bundle.trainingExpiry = data;
            }));
        }
        if (scope.includeProjectReadiness) {
            tasks.push(this.projectReadiness.run(scope.companyId).then((data) => {
                bundle.projectReadiness = data;
            }));
        }
        if (scope.includeProviderApprovals) {
            tasks.push(this.providerApproval.run().then((data) => {
                bundle.providerApprovals = data;
            }));
        }
        if (scope.includeUnionDispatch) {
            tasks.push(this.dispatch.run(scope.unionHallId, scope.companyId).then((data) => {
                bundle.unionDispatch = data;
            }));
        }
        if (scope.includeSystemHealth) {
            tasks.push(this.buildSystemHealth().then((data) => {
                bundle.systemHealth = data;
            }));
        }
        if (scope.includeAssignments) {
            tasks.push(this.buildAssignments().then((data) => {
                bundle.assignments = data;
            }));
        }
        await Promise.all(tasks);
        return bundle;
    }
    async buildSystemHealth() {
        const [overview, openIncidents] = await Promise.all([
            this.analytics.overview(),
            this.prisma.incident.count({
                where: { status: { not: 'CLOSED' } },
            }),
        ]);
        const status = openIncidents > 10
            ? 'critical'
            : openIncidents > 3
                ? 'degraded'
                : 'healthy';
        return {
            workers: overview.workers,
            equipment: overview.equipment,
            companies: overview.companies,
            trainingRecords: overview.trainingRecords,
            openIncidents,
            status,
        };
    }
    async buildAssignments() {
        const overview = await this.assignments.overview();
        const active = await this.assignments.activeAssignments();
        const atRisk = active.filter((a) => a.risk.expiredTraining ||
            a.risk.openIncidents > 0 ||
            a.risk.equipmentUnsafe).length;
        return {
            activeAssignments: overview.activeAssignments,
            atRisk,
            totalWorkers: overview.totalWorkers,
        };
    }
};
exports.DashboardWidgetsService = DashboardWidgetsService;
exports.DashboardWidgetsService = DashboardWidgetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        analytics_service_1.AnalyticsService,
        assignment_dashboard_service_1.AssignmentDashboardService,
        worker_compliance_pipeline_1.WorkerCompliancePipeline,
        equipment_compliance_pipeline_1.EquipmentCompliancePipeline,
        training_expiry_pipeline_1.TrainingExpiryPipeline,
        project_readiness_pipeline_1.ProjectReadinessPipeline,
        provider_approval_pipeline_1.ProviderApprovalPipeline,
        dispatch_pipeline_1.DispatchPipeline])
], DashboardWidgetsService);
//# sourceMappingURL=dashboard-widgets.service.js.map