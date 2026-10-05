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
exports.InspectionCoreController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const roles_1 = require("../vera-core/roles");
const checklist_dto_1 = require("./dto/checklist.dto");
const create_inspection_dto_1 = require("./dto/create-inspection.dto");
const inspection_core_service_1 = require("./inspection-core.service");
let InspectionCoreController = class InspectionCoreController {
    constructor(inspections) {
        this.inspections = inspections;
    }
    dashboard(companyId) {
        return this.inspections.dashboard(companyId ? Number(companyId) : undefined);
    }
    listDue(companyId, withinDays) {
        return this.inspections.listDue(companyId ? Number(companyId) : undefined, withinDays ? Number(withinDays) : 7);
    }
    notifyDue(companyId, withinDays) {
        return this.inspections.notifyDueInspections(companyId ? Number(companyId) : undefined, withinDays ? Number(withinDays) : 7);
    }
    listChecklists(inspectionType, category, activeOnly) {
        return this.inspections.listChecklists({
            inspectionType,
            category,
            activeOnly: activeOnly !== 'false',
        });
    }
    createChecklist(dto) {
        return this.inspections.createChecklist(dto);
    }
    getChecklist(id) {
        return this.inspections.getChecklist(id);
    }
    updateChecklist(id, dto) {
        return this.inspections.updateChecklist(id, dto);
    }
    listForEquipment(equipmentId) {
        return this.inspections.listForEquipment(equipmentId);
    }
    unlock(equipmentId, body, req) {
        return this.inspections.unlockEquipment(equipmentId, req.user.id, body.notes);
    }
    submit(dto, req) {
        return this.inspections.submitInspection(dto, req.user.id);
    }
    getOne(id) {
        return this.inspections.getInspection(id);
    }
};
exports.InspectionCoreController = InspectionCoreController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InspectionCoreController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('due'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('withinDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InspectionCoreController.prototype, "listDue", null);
__decorate([
    (0, common_1.Post)('notify-due'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('withinDays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InspectionCoreController.prototype, "notifyDue", null);
__decorate([
    (0, common_1.Get)('checklists'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)('inspectionType')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], InspectionCoreController.prototype, "listChecklists", null);
__decorate([
    (0, common_1.Post)('checklists'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [checklist_dto_1.CreateChecklistDto]),
    __metadata("design:returntype", void 0)
], InspectionCoreController.prototype, "createChecklist", null);
__decorate([
    (0, common_1.Get)('checklists/:id(\\d+)'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InspectionCoreController.prototype, "getChecklist", null);
__decorate([
    (0, common_1.Put)('checklists/:id(\\d+)'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, checklist_dto_1.UpdateChecklistDto]),
    __metadata("design:returntype", void 0)
], InspectionCoreController.prototype, "updateChecklist", null);
__decorate([
    (0, common_1.Get)('equipment/:equipmentId'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InspectionCoreController.prototype, "listForEquipment", null);
__decorate([
    (0, common_1.Post)('equipment/:equipmentId/unlock'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_inspection_dto_1.UnlockAfterInspectionDto, Object]),
    __metadata("design:returntype", void 0)
], InspectionCoreController.prototype, "unlock", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES, client_1.UserRole.WORKER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_inspection_dto_1.CreateInspectionDto, Object]),
    __metadata("design:returntype", void 0)
], InspectionCoreController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)(':id(\\d+)'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InspectionCoreController.prototype, "getOne", null);
exports.InspectionCoreController = InspectionCoreController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/inspections`),
    __metadata("design:paramtypes", [inspection_core_service_1.InspectionCoreService])
], InspectionCoreController);
//# sourceMappingURL=inspection-core.controller.js.map