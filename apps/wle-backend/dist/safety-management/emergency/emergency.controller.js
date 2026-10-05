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
exports.EmergencyController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const emergency_service_1 = require("./emergency.service");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let EmergencyController = class EmergencyController {
    constructor(emergency) {
        this.emergency = emergency;
    }
    listPlans(siteId) {
        return this.emergency.listPlans(parseInt(siteId, 10));
    }
    createPlan(body) {
        return this.emergency.createPlan(body);
    }
    triggerMuster(req, body) {
        var _a;
        return this.emergency.triggerMuster(Object.assign(Object.assign({}, body), { triggeredByUser: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId }));
    }
    activeMuster(siteId) {
        return this.emergency.getActiveMuster(parseInt(siteId, 10));
    }
    checkIn(id, body) {
        return this.emergency.checkIn({
            musterEventId: id,
            workerId: body.workerId,
            method: body.method,
        });
    }
    allClear(id) {
        return this.emergency.allClear(id);
    }
    history(siteId) {
        return this.emergency.listMusterHistory(parseInt(siteId, 10));
    }
};
exports.EmergencyController = EmergencyController;
__decorate([
    (0, common_1.Get)('plans'),
    __param(0, (0, common_1.Query)('siteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmergencyController.prototype, "listPlans", null);
__decorate([
    (0, common_1.Post)('plans'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmergencyController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Post)('muster/trigger'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EmergencyController.prototype, "triggerMuster", null);
__decorate([
    (0, common_1.Get)('muster/active'),
    __param(0, (0, common_1.Query)('siteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmergencyController.prototype, "activeMuster", null);
__decorate([
    (0, common_1.Post)('muster/:id/checkin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EmergencyController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)('muster/:id/all-clear'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmergencyController.prototype, "allClear", null);
__decorate([
    (0, common_1.Get)('muster/history'),
    __param(0, (0, common_1.Query)('siteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmergencyController.prototype, "history", null);
exports.EmergencyController = EmergencyController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety/emergency`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [emergency_service_1.EmergencyService])
], EmergencyController);
//# sourceMappingURL=emergency.controller.js.map