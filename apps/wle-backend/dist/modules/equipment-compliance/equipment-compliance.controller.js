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
exports.EquipmentComplianceController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const roles_1 = require("../vera-core/roles");
const equipment_compliance_service_1 = require("./equipment-compliance.service");
let EquipmentComplianceController = class EquipmentComplianceController {
    constructor(compliance) {
        this.compliance = compliance;
    }
    dashboard(companyId) {
        return this.compliance.dashboard(companyId ? Number(companyId) : undefined);
    }
    recalculate(equipmentId) {
        return this.compliance.recalculate(equipmentId, {
            trigger: 'MANUAL',
            notes: 'Manual compliance recalculation',
        });
    }
};
exports.EquipmentComplianceController = EquipmentComplianceController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EquipmentComplianceController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Post)('equipment/:equipmentId/recalculate'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EquipmentComplianceController.prototype, "recalculate", null);
exports.EquipmentComplianceController = EquipmentComplianceController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/equipment-compliance`),
    __metadata("design:paramtypes", [equipment_compliance_service_1.EquipmentComplianceService])
], EquipmentComplianceController);
//# sourceMappingURL=equipment-compliance.controller.js.map