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
exports.PmEquipmentController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_equipment_safety_service_1 = require("./pm-equipment-safety.service");
const pm_equipment_cail_intelligence_service_1 = require("./pm-equipment-cail-intelligence.service");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
const SUPERVISOR_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let PmEquipmentController = class PmEquipmentController {
    constructor(equipment, cail) {
        this.equipment = equipment;
        this.cail = cail;
    }
    offlineSync(body, req) {
        return this.equipment.applyOfflineSync(body.projectId, body, req.user.id);
    }
    register(body, req) {
        return this.equipment.registerEquipment(body, req.user.id);
    }
    score(id, projectId) {
        return this.equipment.getEquipmentScore(id, projectId ? parseInt(projectId, 10) : undefined);
    }
    predict(id) {
        return this.cail.equipmentRiskPrediction(id);
    }
    inspection(id, body, req) {
        return this.equipment.recordEquipmentInspection(Object.assign(Object.assign({}, body), { equipmentId: id, inspectorUserId: req.user.id }));
    }
    certification(id, body, req) {
        return this.equipment.createCertification(Object.assign(Object.assign({}, body), { equipmentId: id }), req.user.id);
    }
    authorize(id, body, req) {
        return this.equipment.grantAuthorization(Object.assign(Object.assign({}, body), { equipmentId: id }), req.user.id);
    }
    lockout(id, body, req) {
        return this.equipment.createLoto(Object.assign(Object.assign({}, body), { equipmentId: id }), req.user.id);
    }
    unlock(id, req) {
        return this.equipment.unlockEquipment(id, req.user.id);
    }
    get(id) {
        return this.equipment.getProfile(id);
    }
};
exports.PmEquipmentController = PmEquipmentController;
__decorate([
    (0, common_1.Post)('offline/sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)(30, 60),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmEquipmentController.prototype, "offlineSync", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmEquipmentController.prototype, "register", null);
__decorate([
    (0, common_1.Get)(':id/score'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], PmEquipmentController.prototype, "score", null);
__decorate([
    (0, common_1.Get)(':id/predict'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmEquipmentController.prototype, "predict", null);
__decorate([
    (0, common_1.Post)(':id/inspection'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], PmEquipmentController.prototype, "inspection", null);
__decorate([
    (0, common_1.Post)(':id/certification'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], PmEquipmentController.prototype, "certification", null);
__decorate([
    (0, common_1.Post)(':id/authorize'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], PmEquipmentController.prototype, "authorize", null);
__decorate([
    (0, common_1.Post)(':id/lockout'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], PmEquipmentController.prototype, "lockout", null);
__decorate([
    (0, common_1.Post)(':id/unlock'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PmEquipmentController.prototype, "unlock", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmEquipmentController.prototype, "get", null);
exports.PmEquipmentController = PmEquipmentController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/equipment`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_equipment_safety_service_1.PmEquipmentSafetyService,
        pm_equipment_cail_intelligence_service_1.PmEquipmentCailIntelligenceService])
], PmEquipmentController);
//# sourceMappingURL=pm-equipment.controller.js.map