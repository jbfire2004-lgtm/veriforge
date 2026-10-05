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
exports.AcpAccessController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const routes_1 = require("../config/routes");
const acp_access_service_1 = require("./acp-access.service");
let AcpAccessController = class AcpAccessController {
    constructor(access) {
        this.access = access;
    }
    getMyAccess(req) {
        return this.access.resolveContext(req.user.id);
    }
    checkAccess(req, body) {
        return this.access.check(Object.assign({ userId: req.user.id }, body));
    }
    hubModules(req) {
        return this.access.hubModulesForUser(req.user.id);
    }
    moduleCards(req) {
        return this.access.getModuleCardsForUser(req.user.id);
    }
};
exports.AcpAccessController = AcpAccessController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AcpAccessController.prototype, "getMyAccess", null);
__decorate([
    (0, common_1.Post)('check'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AcpAccessController.prototype, "checkAccess", null);
__decorate([
    (0, common_1.Get)('hub-modules'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AcpAccessController.prototype, "hubModules", null);
__decorate([
    (0, common_1.Get)('modules'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AcpAccessController.prototype, "moduleCards", null);
exports.AcpAccessController = AcpAccessController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/access`),
    __metadata("design:paramtypes", [acp_access_service_1.AcpAccessService])
], AcpAccessController);
//# sourceMappingURL=acp-access.controller.js.map