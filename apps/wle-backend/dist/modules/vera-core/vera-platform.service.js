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
exports.VeraPlatformService = void 0;
const common_1 = require("@nestjs/common");
const reporting_core_service_1 = require("../reporting-core/reporting-core.service");
const equipment_compliance_service_1 = require("../equipment-compliance/equipment-compliance.service");
const inspection_core_service_1 = require("../inspection-core/inspection-core.service");
const competency_service_1 = require("../competency/competency.service");
const tools_ppe_core_service_1 = require("../tools-ppe-core/tools-ppe-core.service");
const maintenance_calibration_core_service_1 = require("../maintenance-calibration-core/maintenance-calibration-core.service");
const notification_scheduler_service_1 = require("../notification-engine/notification-scheduler.service");
let VeraPlatformService = class VeraPlatformService {
    constructor(reporting, equipmentCompliance, inspections, competency, toolsPpe, maintenanceCalibration, notificationScheduler) {
        this.reporting = reporting;
        this.equipmentCompliance = equipmentCompliance;
        this.inspections = inspections;
        this.competency = competency;
        this.toolsPpe = toolsPpe;
        this.maintenanceCalibration = maintenanceCalibration;
        this.notificationScheduler = notificationScheduler;
    }
    async getPlatformSummary(companyId) {
        const [reportingOverview, equipment, inspections, competency, toolsPpe, maintenance,] = await Promise.all([
            this.reporting.overview(companyId),
            this.equipmentCompliance.dashboard(companyId),
            this.inspections.dashboard(companyId),
            this.competency.dashboard(companyId),
            this.toolsPpe.dashboard(companyId),
            this.maintenanceCalibration.dashboard(companyId),
        ]);
        return {
            companyId: companyId !== null && companyId !== void 0 ? companyId : null,
            generatedAt: new Date().toISOString(),
            modules: {
                reporting: reportingOverview,
                equipment: {
                    total: equipment.total,
                    compliant: equipment.compliant,
                    needsAttention: equipment.needsAttention,
                    nonCompliant: equipment.nonCompliant,
                    lockedOut: equipment.lockedOut,
                    overdueInspection: equipment.overdueInspection,
                },
                inspections: {
                    total: inspections.totalInspections,
                    passed: inspections.passed,
                    failed: inspections.failed,
                    dueWithin7Days: inspections.dueWithin7Days,
                },
                competency: {
                    totalEvaluations: competency.totalEvaluations,
                    passing: competency.passing,
                    expiringSoon: competency.expiringSoon,
                    expired: competency.expired,
                },
                toolsPpe: toolsPpe,
                maintenanceCalibration: maintenance,
            },
            links: {
                equipmentCompliance: '/admin/equipment/compliance',
                inspections: '/admin/inspections',
                competency: '/admin/equipment/competency',
                toolsPpe: '/admin/tools-ppe',
                maintenance: '/admin/maintenance-calibration',
                reporting: '/admin/reporting',
                notifications: '/admin/notifications',
            },
        };
    }
    async runScheduledNotifications(companyId) {
        return this.notificationScheduler.runAll(companyId);
    }
};
exports.VeraPlatformService = VeraPlatformService;
exports.VeraPlatformService = VeraPlatformService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reporting_core_service_1.ReportingCoreService,
        equipment_compliance_service_1.EquipmentComplianceService,
        inspection_core_service_1.InspectionCoreService,
        competency_service_1.CompetencyService,
        tools_ppe_core_service_1.ToolsPpeCoreService,
        maintenance_calibration_core_service_1.MaintenanceCalibrationCoreService,
        notification_scheduler_service_1.NotificationSchedulerService])
], VeraPlatformService);
//# sourceMappingURL=vera-platform.service.js.map