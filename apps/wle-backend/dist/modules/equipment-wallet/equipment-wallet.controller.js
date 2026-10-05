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
exports.EquipmentWalletController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const roles_1 = require("../vera-core/roles");
const equipment_wallet_service_1 = require("./equipment-wallet.service");
let EquipmentWalletController = class EquipmentWalletController {
    constructor(wallet) {
        this.wallet = wallet;
    }
    full(equipmentId) {
        return this.wallet.getFullWallet(equipmentId);
    }
    qr(equipmentId) {
        return this.wallet.getQr(equipmentId);
    }
    inspections(equipmentId) {
        return this.wallet.getInspectionHistory(equipmentId);
    }
    competency(equipmentId) {
        return this.wallet.getCompetencyRequirements(equipmentId);
    }
    workers(equipmentId) {
        return this.wallet.getAssignedWorkers(equipmentId);
    }
    projects(equipmentId) {
        return this.wallet.getAssignedProjects(equipmentId);
    }
    compliance(equipmentId) {
        return this.wallet.getComplianceStatus(equipmentId);
    }
    maintenance(equipmentId) {
        return this.wallet.getMaintenanceCalibration(equipmentId);
    }
};
exports.EquipmentWalletController = EquipmentWalletController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EquipmentWalletController.prototype, "full", null);
__decorate([
    (0, common_1.Get)('qr'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EquipmentWalletController.prototype, "qr", null);
__decorate([
    (0, common_1.Get)('inspections'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EquipmentWalletController.prototype, "inspections", null);
__decorate([
    (0, common_1.Get)('competency-requirements'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EquipmentWalletController.prototype, "competency", null);
__decorate([
    (0, common_1.Get)('assigned-workers'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EquipmentWalletController.prototype, "workers", null);
__decorate([
    (0, common_1.Get)('assigned-projects'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EquipmentWalletController.prototype, "projects", null);
__decorate([
    (0, common_1.Get)('compliance'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EquipmentWalletController.prototype, "compliance", null);
__decorate([
    (0, common_1.Get)('maintenance'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EquipmentWalletController.prototype, "maintenance", null);
exports.EquipmentWalletController = EquipmentWalletController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/equipment/:equipmentId/wallet`),
    __metadata("design:paramtypes", [equipment_wallet_service_1.EquipmentWalletService])
], EquipmentWalletController);
//# sourceMappingURL=equipment-wallet.controller.js.map