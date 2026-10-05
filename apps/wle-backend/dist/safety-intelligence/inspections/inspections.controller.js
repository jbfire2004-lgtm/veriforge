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
exports.SafetyInspectionsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const cail_scope_service_1 = require("../cail/cail-scope.service");
const inspections_service_1 = require("./inspections.service");
const create_safety_inspection_dto_1 = require("../dto/create-safety-inspection.dto");
const create_inspection_item_dto_1 = require("../dto/create-inspection-item.dto");
const classify_photo_dto_1 = require("../dto/classify-photo.dto");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let SafetyInspectionsController = class SafetyInspectionsController {
    constructor(inspections, scope) {
        this.inspections = inspections;
        this.scope = scope;
    }
    async list(req, projectId) {
        const actor = await this.scope.resolveActor(req.user.id, req.user.role);
        return this.inspections.list(actor, projectId ? parseInt(projectId, 10) : undefined);
    }
    async getOne(id, req) {
        const actor = await this.scope.resolveActor(req.user.id, req.user.role);
        return this.inspections.getById(id, actor);
    }
    async create(dto, req) {
        const actor = await this.scope.resolveActor(req.user.id, req.user.role);
        return this.inspections.create(dto, actor);
    }
    async aiSuggest(dto) {
        return this.inspections.classifyPhoto(dto);
    }
    async addItem(id, dto, req) {
        const actor = await this.scope.resolveActor(req.user.id, req.user.role);
        return this.inspections.addItem(id, dto, actor);
    }
    async complete(id, req) {
        const actor = await this.scope.resolveActor(req.user.id, req.user.role);
        return this.inspections.complete(id, actor);
    }
};
exports.SafetyInspectionsController = SafetyInspectionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SafetyInspectionsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SafetyInspectionsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_safety_inspection_dto_1.CreateSafetyInspectionDto, Object]),
    __metadata("design:returntype", Promise)
], SafetyInspectionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('ai/classify-photo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [classify_photo_dto_1.ClassifyPhotoDto]),
    __metadata("design:returntype", Promise)
], SafetyInspectionsController.prototype, "aiSuggest", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_inspection_item_dto_1.CreateInspectionItemDto, Object]),
    __metadata("design:returntype", Promise)
], SafetyInspectionsController.prototype, "addItem", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SafetyInspectionsController.prototype, "complete", null);
exports.SafetyInspectionsController = SafetyInspectionsController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety-intelligence/inspections`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [inspections_service_1.SafetyInspectionsService,
        cail_scope_service_1.CailScopeService])
], SafetyInspectionsController);
//# sourceMappingURL=inspections.controller.js.map