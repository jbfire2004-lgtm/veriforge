"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEngineModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const notifications_module_1 = require("../../notifications/notifications.module");
const prisma_module_1 = require("../../prisma/prisma.module");
const domain_event_bus_module_1 = require("../api-platform/events/domain-event-bus.module");
const equipment_compliance_module_1 = require("../equipment-compliance/equipment-compliance.module");
const inspection_core_module_1 = require("../inspection-core/inspection-core.module");
const maintenance_calibration_core_module_1 = require("../maintenance-calibration-core/maintenance-calibration-core.module");
const tools_ppe_core_module_1 = require("../tools-ppe-core/tools-ppe-core.module");
const notification_engine_controller_1 = require("./notification-engine.controller");
const notification_scheduler_cron_1 = require("./notification-scheduler.cron");
const notification_scheduler_service_1 = require("./notification-scheduler.service");
let NotificationEngineModule = class NotificationEngineModule {
};
exports.NotificationEngineModule = NotificationEngineModule;
exports.NotificationEngineModule = NotificationEngineModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            notifications_module_1.NotificationsModule,
            domain_event_bus_module_1.DomainEventBusModule,
            equipment_compliance_module_1.EquipmentComplianceModule,
            inspection_core_module_1.InspectionCoreModule,
            maintenance_calibration_core_module_1.MaintenanceCalibrationCoreModule,
            tools_ppe_core_module_1.ToolsPpeCoreModule,
        ],
        controllers: [notification_engine_controller_1.NotificationEngineController],
        providers: [notification_scheduler_service_1.NotificationSchedulerService, notification_scheduler_cron_1.NotificationSchedulerCron],
        exports: [notification_scheduler_service_1.NotificationSchedulerService, notifications_module_1.NotificationsModule],
    })
], NotificationEngineModule);
//# sourceMappingURL=notification-engine.module.js.map