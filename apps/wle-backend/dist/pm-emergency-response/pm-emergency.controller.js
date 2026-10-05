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
exports.PmEmergencyController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const routes_1 = require("../config/routes");
const pm_emergency_response_service_1 = require("./pm-emergency-response.service");
const pm_emergency_cail_intelligence_service_1 = require("./pm-emergency-cail-intelligence.service");
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
let PmEmergencyController = class PmEmergencyController {
    constructor(emergency, cail) {
        this.emergency = emergency;
        this.cail = cail;
    }
    offlineSync(body, req) {
        return this.emergency.applyOfflineSync(body.projectId, body, req.user.id);
    }
    createPlan(body, req) {
        return this.emergency.createPlan(body, req.user.id);
    }
    createEquipment(body) {
        return this.emergency.createEmergencyEquipment(body);
    }
    declare(body, req) {
        return this.emergency.declareEmergency(body, req.user.id);
    }
    status(id) {
        return this.emergency.getEventStatus(id);
    }
    predict(id) {
        return this.cail.predictEmergencyRisk(id);
    }
    allClear(id, req, body) {
        return this.emergency.allClearEmergency(id, req.user.id, body === null || body === void 0 ? void 0 : body.force);
    }
    close(id, req, body) {
        return this.emergency.closeEmergency(id, req.user.id, body === null || body === void 0 ? void 0 : body.force);
    }
    startMuster(id, body, req) {
        return this.emergency.startMusterForEvent(id, body, req.user.id);
    }
    checkIn(id, body) {
        return this.emergency.musterCheckInForEvent(id, body);
    }
};
exports.PmEmergencyController = PmEmergencyController;
__decorate([
    (0, common_1.Post)('offline/sync'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyController.prototype, "offlineSync", null);
__decorate([
    (0, common_1.Post)('plan'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Post)('equipment'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyController.prototype, "createEquipment", null);
__decorate([
    (0, common_1.Post)('declare'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyController.prototype, "declare", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmEmergencyController.prototype, "status", null);
__decorate([
    (0, common_1.Get)(':id/predict'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PmEmergencyController.prototype, "predict", null);
__decorate([
    (0, common_1.Post)(':id/all_clear'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyController.prototype, "allClear", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyController.prototype, "close", null);
__decorate([
    (0, common_1.Post)(':id/muster/start'),
    (0, roles_decorator_1.Roles)(...SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyController.prototype, "startMuster", null);
__decorate([
    (0, common_1.Post)(':id/muster/checkin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PmEmergencyController.prototype, "checkIn", null);
exports.PmEmergencyController = PmEmergencyController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/emergency`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [pm_emergency_response_service_1.PmEmergencyResponseService,
        pm_emergency_cail_intelligence_service_1.PmEmergencyCailIntelligenceService])
], PmEmergencyController);
//# sourceMappingURL=pm-emergency.controller.js.map