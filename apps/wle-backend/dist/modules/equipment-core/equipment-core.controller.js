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
exports.EquipmentCoreController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const roles_1 = require("../vera-core/roles");
const equipment_core_service_1 = require("./equipment-core.service");
const create_equipment_core_dto_1 = require("./dto/create-equipment-core.dto");
const update_equipment_core_dto_1 = require("./dto/update-equipment-core.dto");
const create_maintenance_dto_1 = require("./dto/create-maintenance.dto");
const create_calibration_dto_1 = require("./dto/create-calibration.dto");
const create_attachment_dto_1 = require("./dto/create-attachment.dto");
const lockout_equipment_dto_1 = require("./dto/lockout-equipment.dto");
const assign_project_dto_1 = require("./dto/assign-project.dto");
const assign_worker_dto_1 = require("./dto/assign-worker.dto");
const scan_qr_dto_1 = require("./dto/scan-qr.dto");
let EquipmentCoreController = class EquipmentCoreController {
    constructor(equipment) {
        this.equipment = equipment;
    }
    list(companyId, q, activeOnly, limit, complianceStatus, compliant) {
        return this.equipment.list({
            companyId: companyId ? Number(companyId) : undefined,
            q,
            activeOnly: activeOnly !== 'false',
            limit: limit ? Number(limit) : undefined,
            complianceStatus,
            compliant: compliant === 'true' ? true : compliant === 'false' ? false : undefined,
        });
    }
    dashboard(companyId) {
        return this.equipment.dashboard(companyId ? Number(companyId) : undefined);
    }
    search(q, serial, assetTag, qr, limit) {
        return this.equipment.search({
            q,
            serial,
            assetTag,
            qr,
            limit: limit ? Number(limit) : undefined,
        });
    }
    categories() {
        return this.equipment.listCategories();
    }
    create(dto, req) {
        return this.equipment.create(dto, req.user.id);
    }
    scanQr(dto) {
        return this.equipment.scanQr(dto.qrToken, dto.companyId);
    }
    findOne(id) {
        return this.equipment.findOne(id);
    }
    update(id, dto) {
        return this.equipment.update(id, dto);
    }
    timeline(id) {
        return this.equipment.getTimeline(id);
    }
    qr(id) {
        return this.equipment.getQr(id);
    }
    linkCompany(id, body) {
        return this.equipment.linkToCompany(id, body.companyId);
    }
    endCompany(id, body) {
        return this.equipment.endCompanyAssignment(id, body.companyId);
    }
    assignProject(id, dto, req) {
        return this.equipment.assignToProject(id, dto.projectId, req.user.id);
    }
    removeProject(id, dto) {
        return this.equipment.removeFromProject(id, dto.projectId);
    }
    assignWorker(id, dto) {
        return this.equipment.assignWorker(id, dto.workerId, dto.companyId);
    }
    removeWorker(id, dto) {
        return this.equipment.removeWorker(id, dto.workerId, dto.companyId);
    }
    lockout(id, dto, req) {
        return this.equipment.lockout(id, dto, req.user.id);
    }
    unlock(id, body, req) {
        return this.equipment.unlock(id, req.user.id, body.notes);
    }
    maintenance(id, dto) {
        return this.equipment.addMaintenance(id, dto);
    }
    calibration(id, dto) {
        return this.equipment.addCalibration(id, dto);
    }
    attachment(id, dto) {
        return this.equipment.addAttachment(id, dto);
    }
};
exports.EquipmentCoreController = EquipmentCoreController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('q')),
    __param(2, (0, common_1.Query)('activeOnly')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('complianceStatus')),
    __param(5, (0, common_1.Query)('compliant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('serial')),
    __param(2, (0, common_1.Query)('assetTag')),
    __param(3, (0, common_1.Query)('qr')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "categories", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_equipment_core_dto_1.CreateEquipmentCoreDto, Object]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('scan'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scan_qr_dto_1.ScanEquipmentQrDto]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "scanQr", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_equipment_core_dto_1.UpdateEquipmentCoreDto]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id/timeline'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "timeline", null);
__decorate([
    (0, common_1.Get)(':id/qr'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "qr", null);
__decorate([
    (0, common_1.Post)(':id/link-company'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "linkCompany", null);
__decorate([
    (0, common_1.Post)(':id/end-company'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "endCompany", null);
__decorate([
    (0, common_1.Post)(':id/assign-project'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, assign_project_dto_1.AssignProjectDto, Object]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "assignProject", null);
__decorate([
    (0, common_1.Post)(':id/remove-project'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, assign_project_dto_1.AssignProjectDto]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "removeProject", null);
__decorate([
    (0, common_1.Post)(':id/assign-worker'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, assign_worker_dto_1.AssignWorkerDto]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "assignWorker", null);
__decorate([
    (0, common_1.Post)(':id/remove-worker'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, assign_worker_dto_1.AssignWorkerDto]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "removeWorker", null);
__decorate([
    (0, common_1.Post)(':id/lockout'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, lockout_equipment_dto_1.LockoutEquipmentDto, Object]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "lockout", null);
__decorate([
    (0, common_1.Post)(':id/unlock'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "unlock", null);
__decorate([
    (0, common_1.Post)(':id/maintenance'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_maintenance_dto_1.CreateMaintenanceDto]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "maintenance", null);
__decorate([
    (0, common_1.Post)(':id/calibration'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_calibration_dto_1.CreateCalibrationDto]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "calibration", null);
__decorate([
    (0, common_1.Post)(':id/attachments'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_attachment_dto_1.CreateAttachmentDto]),
    __metadata("design:returntype", void 0)
], EquipmentCoreController.prototype, "attachment", null);
exports.EquipmentCoreController = EquipmentCoreController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/equipment`),
    __metadata("design:paramtypes", [equipment_core_service_1.EquipmentCoreService])
], EquipmentCoreController);
//# sourceMappingURL=equipment-core.controller.js.map