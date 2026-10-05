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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsApiController = void 0;
const common_1 = require("@nestjs/common");
const api_contract_1 = require("@vera/api-contract");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_1 = require("../../vera-core/roles");
const routes_1 = require("../../../config/routes");
const api_success_decorator_1 = require("../decorators/api-success.decorator");
const api_response_1 = require("../responses/api-response");
let ContractsApiController = class ContractsApiController {
    list() {
        return (0, api_response_1.apiOk)(api_contract_1.API_CONTRACT_REGISTRY, {
            count: api_contract_1.API_CONTRACT_REGISTRY.length,
        });
    }
};
exports.ContractsApiController = ContractsApiController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(...roles_1.SUPER_ADMIN_ROLES),
    (0, api_success_decorator_1.ApiSuccess)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContractsApiController.prototype, "list", null);
exports.ContractsApiController = ContractsApiController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/contracts`)
], ContractsApiController);
//# sourceMappingURL=contracts-api.controller.js.map