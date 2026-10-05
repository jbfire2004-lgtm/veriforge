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
exports.OrientationController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer = require("multer");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const orientation_service_1 = require("./orientation.service");
const orientation_access_service_1 = require("./orientation-access.service");
const create_orientation_dto_1 = require("./dto/create-orientation.dto");
const ai_generate_orientation_dto_1 = require("./dto/ai-generate-orientation.dto");
const uploadStorage = multer.memoryStorage();
let OrientationController = class OrientationController {
    constructor(orientation, access) {
        this.orientation = orientation;
        this.access = access;
    }
    create(req, body) {
        return this.orientation.create({
            companyId: body.companyId,
            projectId: body.projectId,
            type: body.type,
            title: body.title,
            languages: body.languages,
            userId: req.user.id,
        });
    }
    companyCompliance(companyId) {
        return this.orientation.getComplianceForCompany(parseInt(companyId, 10));
    }
    projectCompliance(projectId) {
        return this.orientation.getComplianceForProject(parseInt(projectId, 10));
    }
    listCompany(companyId) {
        return this.orientation.listForCompany(parseInt(companyId, 10));
    }
    listProject(projectId) {
        return this.orientation.listForProject(parseInt(projectId, 10));
    }
    async myRequired(req) {
        const workerId = await this.access.resolveWorkerIdForUser(req.user.id);
        if (!workerId)
            return [];
        return this.orientation.requiredForWorker(workerId);
    }
    workerRequired(workerId) {
        return this.orientation.requiredForWorker(parseInt(workerId, 10));
    }
    workerAccess(workerId, companyId, projectId) {
        return this.access.evaluateWorker(parseInt(workerId, 10), {
            companyId: companyId ? parseInt(companyId, 10) : undefined,
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        });
    }
    stats(id) {
        return this.orientation.getStats(id);
    }
    get(id) {
        return this.orientation.getById(id);
    }
    update(req, id, body) {
        return this.orientation.update(id, {
            title: body.title,
            languages: body.languages,
            isPublished: body.isPublished,
        }, req.user.id);
    }
    archive(id) {
        return this.orientation.archive(id);
    }
    upload(req, id, uploaded) {
        var _a;
        const files = ((_a = uploaded.files) !== null && _a !== void 0 ? _a : []).map((f) => ({
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size,
            buffer: f.buffer,
        }));
        return this.orientation.uploadContent(id, files, req.user.id);
    }
    aiGenerate(req, id, body) {
        return this.orientation.aiGenerate(id, body, req.user.id);
    }
    translate(id, body) {
        var _a;
        return this.orientation.translatePackage(id, (_a = body.languages) !== null && _a !== void 0 ? _a : []);
    }
    assign(id, body) {
        return this.orientation.assign(id, body.scope);
    }
    workers(id) {
        return this.orientation.listWorkers(id);
    }
    versions(id) {
        return this.orientation.listVersions(id);
    }
    rollback(req, id, body) {
        return this.orientation.rollback(id, body.versionNumber, req.user.id);
    }
    startProgress(id, body) {
        return this.orientation.startProgress(id, body.workerId);
    }
    completeProgress(id, body) {
        return this.orientation.completeProgress(id, body.workerId, body);
    }
    async myStart(req, id) {
        const workerId = await this.access.resolveWorkerIdForUser(req.user.id);
        if (!workerId) {
            throw new common_1.BadRequestException('No worker profile linked to this account');
        }
        return this.orientation.startProgress(id, workerId);
    }
    async myComplete(req, id, body) {
        const workerId = await this.access.resolveWorkerIdForUser(req.user.id);
        if (!workerId) {
            throw new common_1.BadRequestException('No worker profile linked to this account');
        }
        return this.orientation.completeProgress(id, workerId, body);
    }
};
exports.OrientationController = OrientationController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.COMPANY_ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_orientation_dto_1.CreateOrientationDto]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('companies/:companyId/compliance'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "companyCompliance", null);
__decorate([
    (0, common_1.Get)('projects/:projectId/compliance'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "projectCompliance", null);
__decorate([
    (0, common_1.Get)('companies/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "listCompany", null);
__decorate([
    (0, common_1.Get)('projects/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "listProject", null);
__decorate([
    (0, common_1.Get)('me/required'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrientationController.prototype, "myRequired", null);
__decorate([
    (0, common_1.Get)('worker/:workerId/required'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "workerRequired", null);
__decorate([
    (0, common_1.Get)('worker/:workerId/access'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "workerAccess", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.COMPANY_ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.COMPANY_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/upload'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.COMPANY_ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([{ name: 'files', maxCount: 10 }], {
        storage: uploadStorage,
        limits: { fileSize: 50 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)(':id/ai-generate'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPER_ADMIN, client_1.UserRole.COMPANY_ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, ai_generate_orientation_dto_1.AiGenerateOrientationDto]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "aiGenerate", null);
__decorate([
    (0, common_1.Post)(':id/translate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "translate", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "assign", null);
__decorate([
    (0, common_1.Get)(':id/workers'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "workers", null);
__decorate([
    (0, common_1.Get)(':id/versions'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "versions", null);
__decorate([
    (0, common_1.Post)(':id/version/rollback'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "rollback", null);
__decorate([
    (0, common_1.Post)(':id/progress/start'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "startProgress", null);
__decorate([
    (0, common_1.Post)(':id/progress/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrientationController.prototype, "completeProgress", null);
__decorate([
    (0, common_1.Post)('me/:id/progress/start'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], OrientationController.prototype, "myStart", null);
__decorate([
    (0, common_1.Post)('me/:id/progress/complete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], OrientationController.prototype, "myComplete", null);
exports.OrientationController = OrientationController = __decorate([
    (0, common_1.Controller)('api/v1/orientation'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [orientation_service_1.OrientationService,
        orientation_access_service_1.OrientationAccessService])
], OrientationController);
//# sourceMappingURL=orientation.controller.js.map