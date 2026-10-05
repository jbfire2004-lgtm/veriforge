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
exports.CailMigrationController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const core_action_cail_backfill_service_1 = require("./core-action-cail-backfill.service");
class BackfillBodyDto {
}
let CailMigrationController = class CailMigrationController {
    constructor(backfill) {
        this.backfill = backfill;
    }
    async backfillCoreActions(body) {
        var _a, _b;
        return this.backfill.backfillFromSafetyFormActions({
            dryRun: (_a = body.dryRun) !== null && _a !== void 0 ? _a : false,
            limit: (_b = body.limit) !== null && _b !== void 0 ? _b : 500,
        });
    }
};
exports.CailMigrationController = CailMigrationController;
__decorate([
    (0, common_1.Post)('backfill-core-actions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BackfillBodyDto]),
    __metadata("design:returntype", Promise)
], CailMigrationController.prototype, "backfillCoreActions", null);
exports.CailMigrationController = CailMigrationController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety-intelligence/admin`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [core_action_cail_backfill_service_1.CoreActionCailBackfillService])
], CailMigrationController);
//# sourceMappingURL=cail-migration.controller.js.map