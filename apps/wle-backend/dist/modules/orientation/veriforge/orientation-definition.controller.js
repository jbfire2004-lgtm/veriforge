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
exports.OrientationDefinitionController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const throttler_1 = require("@nestjs/throttler");
const client_1 = require("@prisma/client");
const multer = require("multer");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const routes_1 = require("../../../config/routes");
const roles_1 = require("../../vera-core/roles");
const tenant_scope_service_1 = require("../../../security/tenant-scope.service");
const orientation_definition_service_1 = require("./orientation-definition.service");
const orientation_validation_1 = require("./orientation-validation");
let OrientationDefinitionController = class OrientationDefinitionController {
    constructor(definitions, tenant) {
        this.definitions = definitions;
        this.tenant = tenant;
    }
    create(req, body) {
        const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
        return this.definitions.create({
            companyId,
            title: body.title,
            type: body.type,
            contentMode: body.contentMode,
            contentBlocks: body.contentBlocks,
            createdByUserId: req.user.id,
            version: body.version,
            isPublished: body.isPublished,
            expiryRules: body.expiryRules,
            metadata: body.metadata,
        });
    }
    async upload(req, file, body) {
        var _a, _b;
        const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
        if (!file) {
            throw new common_1.BadRequestException('file is required');
        }
        (0, orientation_validation_1.assertOrientationUploadFile)(file);
        const sourceFileKey = (0, orientation_validation_1.buildSecureOrientationObjectKey)({
            companyId,
            originalName: file.originalname,
        });
        return this.definitions.createFromUpload({
            companyId,
            title: (_a = body.title) !== null && _a !== void 0 ? _a : file.originalname.replace(/\.[^.]+$/, ''),
            type: (_b = body.type) !== null && _b !== void 0 ? _b : 'company',
            createdByUserId: req.user.id,
            sourceFileKey,
            metadata: {
                mimeType: file.mimetype,
                size: file.size,
                originalName: file.originalname,
                storage: 'object',
            },
        });
    }
    list(req, companyIdRaw, projectIdRaw, type, isPublishedRaw) {
        const companyId = this.tenant.effectiveCompanyId(req.user, companyIdRaw ? parseInt(companyIdRaw, 10) : undefined);
        return this.definitions.list({
            companyId,
            projectId: projectIdRaw ? parseInt(projectIdRaw, 10) : undefined,
            type,
            isPublished: isPublishedRaw === 'true'
                ? true
                : isPublishedRaw === 'false'
                    ? false
                    : undefined,
        });
    }
    get(req, id, companyIdRaw) {
        const companyId = this.tenant.effectiveCompanyId(req.user, companyIdRaw ? parseInt(companyIdRaw, 10) : undefined);
        return this.definitions.get(id, { companyId });
    }
    update(id, req, body) {
        var _a;
        return this.definitions.update(id, {
            title: body.title,
            type: body.type,
            contentMode: body.contentMode,
            contentBlocks: body.contentBlocks,
            isPublished: body.isPublished,
            expiryRules: body.expiryRules,
            metadata: body.metadata,
            bumpVersion: body.bumpVersion,
        }, { id: req.user.id, companyId: (_a = req.user.companyId) !== null && _a !== void 0 ? _a : undefined });
    }
};
exports.OrientationDefinitionController = OrientationDefinitionController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrientationDefinitionController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER),
    (0, throttler_1.Throttle)(20, 60),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: multer.memoryStorage(),
        limits: { fileSize: orientation_validation_1.ORIENTATION_UPLOAD_MAX_BYTES },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], OrientationDefinitionController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES, client_1.UserRole.WORKER, client_1.UserRole.CONTRACTOR_USER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('isPublished')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], OrientationDefinitionController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES, client_1.UserRole.WORKER, client_1.UserRole.CONTRACTOR_USER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], OrientationDefinitionController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrientationDefinitionController.prototype, "update", null);
exports.OrientationDefinitionController = OrientationDefinitionController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/orientation-definitions`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [orientation_definition_service_1.OrientationDefinitionService,
        tenant_scope_service_1.TenantScopeService])
], OrientationDefinitionController);
//# sourceMappingURL=orientation-definition.controller.js.map