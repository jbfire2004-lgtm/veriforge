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
exports.SafetyContextController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const project_safety_context_service_1 = require("./project-safety-context.service");
const worker_safety_profile_service_1 = require("./worker-safety-profile.service");
const PM_ROLES = [
    client_1.UserRole.WORKER,
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let SafetyContextController = class SafetyContextController {
    constructor(projectContext, workerProfile) {
        this.projectContext = projectContext;
        this.workerProfile = workerProfile;
    }
    project(projectId) {
        return this.projectContext.getContext(parseInt(projectId, 10));
    }
    worker(workerId, projectId) {
        return this.workerProfile.getProfile(parseInt(workerId, 10), projectId ? parseInt(projectId, 10) : undefined);
    }
};
exports.SafetyContextController = SafetyContextController;
__decorate([
    (0, common_1.Get)('project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SafetyContextController.prototype, "project", null);
__decorate([
    (0, common_1.Get)('worker/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SafetyContextController.prototype, "worker", null);
exports.SafetyContextController = SafetyContextController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety/context`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...PM_ROLES),
    __metadata("design:paramtypes", [project_safety_context_service_1.ProjectSafetyContextService,
        worker_safety_profile_service_1.WorkerSafetyProfileService])
], SafetyContextController);
//# sourceMappingURL=safety-context.controller.js.map