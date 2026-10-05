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
exports.ToolsPpeCoreController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const roles_1 = require("../vera-core/roles");
const tools_ppe_dto_1 = require("./dto/tools-ppe.dto");
const tools_ppe_core_service_1 = require("./tools-ppe-core.service");
let ToolsPpeCoreController = class ToolsPpeCoreController {
    constructor(toolsPpe) {
        this.toolsPpe = toolsPpe;
    }
    dashboard(companyId) {
        return this.toolsPpe.dashboard(companyId ? Number(companyId) : undefined);
    }
    processExpiry(companyId) {
        return this.toolsPpe.processPpeExpiry(companyId ? Number(companyId) : undefined);
    }
    listTools(companyId) {
        return this.toolsPpe.listTools(companyId ? Number(companyId) : undefined);
    }
    createTool(dto) {
        return this.toolsPpe.createTool(dto);
    }
    getTool(id) {
        return this.toolsPpe.getTool(id);
    }
    updateTool(id, dto) {
        return this.toolsPpe.updateTool(id, dto);
    }
    inspectTool(id, dto, req) {
        return this.toolsPpe.inspectTool(id, dto, req.user.id);
    }
    assignToolWorker(id, dto, req) {
        return this.toolsPpe.assignToolToWorker(id, dto, req.user.id);
    }
    assignToolProject(id, dto, req) {
        return this.toolsPpe.assignToolToProject(id, dto, req.user.id);
    }
    returnTool(id) {
        return this.toolsPpe.returnTool(id);
    }
    listPpe(companyId) {
        return this.toolsPpe.listPpe(companyId ? Number(companyId) : undefined);
    }
    createPpe(dto) {
        return this.toolsPpe.createPpe(dto);
    }
    getPpe(id) {
        return this.toolsPpe.getPpe(id);
    }
    inspectPpe(id, dto, req) {
        return this.toolsPpe.inspectPpe(id, dto, req.user.id);
    }
    assignPpeWorker(id, dto, req) {
        return this.toolsPpe.assignPpeToWorker(id, dto, req.user.id);
    }
    assignPpeProject(id, dto, req) {
        return this.toolsPpe.assignPpeToProject(id, dto, req.user.id);
    }
    returnPpe(id) {
        return this.toolsPpe.returnPpe(id);
    }
    workerAssignments(workerId) {
        return this.toolsPpe.getWorkerToolsPpe(workerId);
    }
};
exports.ToolsPpeCoreController = ToolsPpeCoreController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Post)('ppe/process-expiry'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "processExpiry", null);
__decorate([
    (0, common_1.Get)('tools'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "listTools", null);
__decorate([
    (0, common_1.Post)('tools'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tools_ppe_dto_1.CreateToolDto]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "createTool", null);
__decorate([
    (0, common_1.Get)('tools/:id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "getTool", null);
__decorate([
    (0, common_1.Patch)('tools/:id'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, tools_ppe_dto_1.UpdateToolDto]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "updateTool", null);
__decorate([
    (0, common_1.Post)('tools/:id/inspect'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES, client_1.UserRole.WORKER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, tools_ppe_dto_1.ToolInspectDto, Object]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "inspectTool", null);
__decorate([
    (0, common_1.Post)('tools/:id/assign-worker'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, tools_ppe_dto_1.AssignToWorkerDto, Object]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "assignToolWorker", null);
__decorate([
    (0, common_1.Post)('tools/:id/assign-project'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, tools_ppe_dto_1.AssignToProjectDto, Object]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "assignToolProject", null);
__decorate([
    (0, common_1.Post)('tools/:id/return'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "returnTool", null);
__decorate([
    (0, common_1.Get)('ppe'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "listPpe", null);
__decorate([
    (0, common_1.Post)('ppe'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tools_ppe_dto_1.CreatePpeDto]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "createPpe", null);
__decorate([
    (0, common_1.Get)('ppe/:id'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "getPpe", null);
__decorate([
    (0, common_1.Post)('ppe/:id/inspect'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES, client_1.UserRole.WORKER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, tools_ppe_dto_1.PpeInspectDto, Object]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "inspectPpe", null);
__decorate([
    (0, common_1.Post)('ppe/:id/assign-worker'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, tools_ppe_dto_1.AssignToWorkerDto, Object]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "assignPpeWorker", null);
__decorate([
    (0, common_1.Post)('ppe/:id/assign-project'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, tools_ppe_dto_1.AssignToProjectDto, Object]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "assignPpeProject", null);
__decorate([
    (0, common_1.Post)('ppe/:id/return'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "returnPpe", null);
__decorate([
    (0, common_1.Get)('workers/:workerId/assignments'),
    (0, roles_decorator_1.Roles)(...roles_1.STAFF_ROLES),
    __param(0, (0, common_1.Param)('workerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ToolsPpeCoreController.prototype, "workerAssignments", null);
exports.ToolsPpeCoreController = ToolsPpeCoreController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/tools-ppe`),
    __metadata("design:paramtypes", [tools_ppe_core_service_1.ToolsPpeCoreService])
], ToolsPpeCoreController);
//# sourceMappingURL=tools-ppe-core.controller.js.map