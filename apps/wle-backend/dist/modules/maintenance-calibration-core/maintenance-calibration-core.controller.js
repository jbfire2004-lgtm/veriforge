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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceCalibrationCoreController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const roles_1 = require("../vera-core/roles");
const maintenance_calibration_dto_1 = require("./dto/maintenance-calibration.dto");
const maintenance_calibration_core_service_1 = require("./maintenance-calibration-core.service");
let MaintenanceCalibrationCoreController = class MaintenanceCalibrationCoreController {
    constructor(svc) {
        this.svc = svc;
    }
    dashboard(companyId) {
        return this.svc.dashboard(companyId ? Number(companyId) : undefined);
    }
    notifyDue(companyId, withinDays) {
        return this.svc.notifyDue(companyId ? Number(companyId) : undefined, withinDays ? Number(withinDays) : 14);
    }
    listMaintenanceRecords(equipmentId, companyId) {
        return this.svc.listMaintenanceRecords(equipmentId ? Number(equipmentId) : undefined, companyId ? Number(companyId) : undefined);
    }
    createMaintenanceRecord(dto, req) {
        return this.svc.createMaintenanceRecord(dto, req.user.id);
    }
    listMaintenanceSchedules(equipmentId, companyId) {
        return this.svc.listMaintenanceSchedules(equipmentId ? Number(equipmentId) : undefined, companyId ? Number(companyId) : undefined);
    }
    createMaintenanceSchedule(dto) {
        return this.svc.createMaintenanceSchedule(dto);
    }
    listCalibrationRecords(equipmentId, companyId) {
        return this.svc.listCalibrationRecords(equipmentId ? Number(equipmentId) : undefined, companyId ? Number(companyId) : undefined);
    }
    createCalibrationRecord(dto, req) {
        return this.svc.createCalibrationRecord(dto, req.user.id);
    }
    listCalibrationSchedules(equipmentId, companyId) {
        return this.svc.listCalibrationSchedules(equipmentId ? Number(equipmentId) : undefined, companyId ? Number(companyId) : undefined);
    }
    createCalibrationSchedule(dto) {
        return this.svc.createCalibrationSchedule(dto);
    }
    equipmentSummary(equipmentId) {
        return this.svc.getEquipmentSummary(equipmentId);
    }
};
exports.MaintenanceCalibrationCoreController = MaintenanceCalibrationCoreController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaintenanceCalibrationCoreController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Post)('notify-due'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('withinDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MaintenanceCalibrationCoreController.prototype, "notifyDue", null);
__decorate([
    (0, common_1.Get)('maintenance-records'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)('equipmentId')),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MaintenanceCalibrationCoreController.prototype, "listMaintenanceRecords", null);
__decorate([
    (0, common_1.Post)('maintenance-records'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [maintenance_calibration_dto_1.CreateMaintenanceRecordDto, Object]),
    __metadata("design:returntype", void 0)
], MaintenanceCalibrationCoreController.prototype, "createMaintenanceRecord", null);
__decorate([
    (0, common_1.Get)('maintenance-schedules'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)('equipmentId')),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MaintenanceCalibrationCoreController.prototype, "listMaintenanceSchedules", null);
__decorate([
    (0, common_1.Post)('maintenance-schedules'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [maintenance_calibration_dto_1.CreateMaintenanceScheduleDto]),
    __metadata("design:returntype", void 0)
], MaintenanceCalibrationCoreController.prototype, "createMaintenanceSchedule", null);
__decorate([
    (0, common_1.Get)('calibration-records'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)('equipmentId')),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MaintenanceCalibrationCoreController.prototype, "listCalibrationRecords", null);
__decorate([
    (0, common_1.Post)('calibration-records'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [maintenance_calibration_dto_1.CreateCalibrationRecordDto, Object]),
    __metadata("design:returntype", void 0)
], MaintenanceCalibrationCoreController.prototype, "createCalibrationRecord", null);
__decorate([
    (0, common_1.Get)('calibration-schedules'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)('equipmentId')),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MaintenanceCalibrationCoreController.prototype, "listCalibrationSchedules", null);
__decorate([
    (0, common_1.Post)('calibration-schedules'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [maintenance_calibration_dto_1.CreateCalibrationScheduleDto]),
    __metadata("design:returntype", void 0)
], MaintenanceCalibrationCoreController.prototype, "createCalibrationSchedule", null);
__decorate([
    (0, common_1.Get)('equipment/:equipmentId/summary'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MaintenanceCalibrationCoreController.prototype, "equipmentSummary", null);
exports.MaintenanceCalibrationCoreController = MaintenanceCalibrationCoreController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/maintenance-calibration`),
    __metadata("design:paramtypes", [maintenance_calibration_core_service_1.MaintenanceCalibrationCoreService])
], MaintenanceCalibrationCoreController);
//# sourceMappingURL=maintenance-calibration-core.controller.js.map