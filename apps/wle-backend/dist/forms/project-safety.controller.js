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
exports.ProjectSafetyController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const routes_1 = require("../config/routes");
const roles_1 = require("../modules/vera-core/roles");
const safety_workflow_engine_service_1 = require("./workflows/safety-workflow-engine.service");
let ProjectSafetyController = class ProjectSafetyController {
    constructor(engine) {
        this.engine = engine;
    }
    listProjectForms(projectId, formType, workerId, awaitingReview) {
        const wid = workerId ? parseInt(workerId, 10) : undefined;
        return this.engine.listForms({
            projectId,
            formType,
            workerId: Number.isFinite(wid) ? wid : undefined,
            awaitingReview: awaitingReview === 'true',
        });
    }
    createProjectForm(projectId, body, req) {
        return this.engine.createForm(Object.assign(Object.assign({}, body), { projectId }), { id: req.user.id, role: req.user.role });
    }
};
exports.ProjectSafetyController = ProjectSafetyController;
__decorate([
    (0, common_1.Get)(':projectId/safety/forms'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('formType')),
    __param(2, (0, common_1.Query)('workerId')),
    __param(3, (0, common_1.Query)('awaitingReview')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", void 0)
], ProjectSafetyController.prototype, "listProjectForms", null);
__decorate([
    (0, common_1.Post)(':projectId/safety/forms'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ProjectSafetyController.prototype, "createProjectForm", null);
exports.ProjectSafetyController = ProjectSafetyController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES, client_1.UserRole.WORKER),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/projects`),
    __metadata("design:paramtypes", [safety_workflow_engine_service_1.SafetyWorkflowEngineService])
], ProjectSafetyController);
//# sourceMappingURL=project-safety.controller.js.map