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
exports.CompetencyController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const roles_1 = require("../vera-core/roles");
const competency_service_1 = require("./competency.service");
const evaluate_competency_dto_1 = require("./dto/evaluate-competency.dto");
let CompetencyController = class CompetencyController {
    constructor(competency) {
        this.competency = competency;
    }
    dashboard(companyId) {
        return this.competency.dashboard(companyId ? Number(companyId) : undefined);
    }
    evaluate(dto, req) {
        return this.competency.evaluate(Object.assign(Object.assign({}, dto), { evaluatorUserId: req.user.id, evaluationDate: dto.evaluationDate
                ? new Date(dto.evaluationDate)
                : undefined }));
    }
    check(dto) {
        return this.competency.checkWorkerEquipment(dto.workerId, dto.equipmentId);
    }
    workerHistory(workerId) {
        return this.competency.listForWorker(workerId);
    }
    equipmentEvaluations(equipmentId) {
        return this.competency.listForEquipment(equipmentId);
    }
    equipmentRequirements(equipmentId) {
        return this.competency.getEquipmentRequirements(equipmentId);
    }
    upsertEquipmentRequirements(equipmentId, dto) {
        return this.competency.upsertEquipmentRequirement(equipmentId, dto);
    }
    upsertTypeRequirements(typeId, dto) {
        return this.competency.upsertTypeRequirement(typeId, dto);
    }
};
exports.CompetencyController = CompetencyController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompetencyController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Post)('evaluate'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [evaluate_competency_dto_1.EvaluateCompetencyDto, Object]),
    __metadata("design:returntype", void 0)
], CompetencyController.prototype, "evaluate", null);
__decorate([
    (0, common_1.Post)('check'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [evaluate_competency_dto_1.CheckCompetencyDto]),
    __metadata("design:returntype", void 0)
], CompetencyController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('workers/:workerId'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('workerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CompetencyController.prototype, "workerHistory", null);
__decorate([
    (0, common_1.Get)('equipment/:equipmentId'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CompetencyController.prototype, "equipmentEvaluations", null);
__decorate([
    (0, common_1.Get)('equipment/:equipmentId/requirements'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CompetencyController.prototype, "equipmentRequirements", null);
__decorate([
    (0, common_1.Put)('equipment/:equipmentId/requirements'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR),
    __param(0, (0, common_1.Param)('equipmentId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, evaluate_competency_dto_1.UpsertCompetencyRequirementDto]),
    __metadata("design:returntype", void 0)
], CompetencyController.prototype, "upsertEquipmentRequirements", null);
__decorate([
    (0, common_1.Put)('types/:typeId/requirements'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('typeId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, evaluate_competency_dto_1.UpsertCompetencyRequirementDto]),
    __metadata("design:returntype", void 0)
], CompetencyController.prototype, "upsertTypeRequirements", null);
exports.CompetencyController = CompetencyController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/competency`),
    __metadata("design:paramtypes", [competency_service_1.CompetencyService])
], CompetencyController);
//# sourceMappingURL=competency.controller.js.map