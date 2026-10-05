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
exports.SdsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const sds_service_1 = require("./sds.service");
const PM_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let SdsController = class SdsController {
    constructor(sds) {
        this.sds = sds;
    }
    list(companyId, q) {
        return this.sds.listDocuments(parseInt(companyId, 10), q);
    }
    create(body) {
        return this.sds.createDocument(body);
    }
    get(id) {
        return this.sds.getDocument(id);
    }
    addInventory(body) {
        return this.sds.addInventoryItem(body);
    }
    listPolicies(companyId) {
        return this.sds.listPolicies(parseInt(companyId, 10));
    }
    createPolicy(body) {
        return this.sds.createPolicy(body);
    }
    acknowledge(body) {
        return this.sds.acknowledgePolicy(body);
    }
};
exports.SdsController = SdsController;
__decorate([
    (0, common_1.Get)('documents'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SdsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('documents'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SdsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('documents/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SdsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)('inventory'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SdsController.prototype, "addInventory", null);
__decorate([
    (0, common_1.Get)('policies'),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SdsController.prototype, "listPolicies", null);
__decorate([
    (0, common_1.Post)('policies'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SdsController.prototype, "createPolicy", null);
__decorate([
    (0, common_1.Post)('policies/acknowledge'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SdsController.prototype, "acknowledge", null);
exports.SdsController = SdsController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety/sds`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [sds_service_1.SdsService])
], SdsController);
//# sourceMappingURL=sds.controller.js.map