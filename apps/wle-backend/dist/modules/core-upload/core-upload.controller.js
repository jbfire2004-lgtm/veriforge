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
exports.CoreUploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer = require("multer");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const core_upload_service_1 = require("./core-upload.service");
const core_upload_config_1 = require("./core-upload.config");
const complete_upload_dto_1 = require("./dto/complete-upload.dto");
const multipart_fields_dto_1 = require("./dto/multipart-fields.dto");
const presign_dto_1 = require("./dto/presign.dto");
const multer_exception_filter_1 = require("./filters/multer-exception.filter");
const memoryUpload = () => (0, platform_express_1.FileInterceptor)('file', {
    storage: multer.memoryStorage(),
    limits: { fileSize: (0, core_upload_config_1.getCoreUploadConfig)().maxBytes },
    fileFilter: (_req, file, cb) => {
        const { allowedMimeTypes } = (0, core_upload_config_1.getCoreUploadConfig)();
        if (!allowedMimeTypes.has(file.mimetype)) {
            return cb(new common_1.BadRequestException(`File type not allowed: ${file.mimetype || '(empty)'}. Allowed: ${[
                ...allowedMimeTypes,
            ].join(', ')}`), false);
        }
        cb(null, true);
    },
});
let CoreUploadController = class CoreUploadController {
    constructor(coreUpload) {
        this.coreUpload = coreUpload;
    }
    ownershipFrom(req, companyIdOverride, projectId) {
        var _a, _b, _c, _d;
        return {
            userId: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
            companyId: (_d = companyIdOverride !== null && companyIdOverride !== void 0 ? companyIdOverride : (_c = req.user) === null || _c === void 0 ? void 0 : _c.companyId) !== null && _d !== void 0 ? _d : null,
            projectId: projectId !== null && projectId !== void 0 ? projectId : null,
        };
    }
    config() {
        return this.coreUpload.getPublicConfig();
    }
    purposes() {
        return this.coreUpload.listPurposes();
    }
    presign(dto, req) {
        return this.coreUpload.createPresignedUpload(dto, this.ownershipFrom(req, dto.companyId, dto.projectId));
    }
    complete(dto) {
        return this.coreUpload.completeDirectUpload(dto.id);
    }
    abandon(id) {
        return this.coreUpload.abandonDirectUpload(id);
    }
    upload(file, body, req) {
        if (!file)
            throw new common_1.BadRequestException('file is required');
        return this.coreUpload.handleMultipartUpload(file, body.purpose, this.ownershipFrom(req, body.companyId, body.projectId));
    }
    getOne(id) {
        return this.coreUpload.findOne(id);
    }
};
exports.CoreUploadController = CoreUploadController;
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CoreUploadController.prototype, "config", null);
__decorate([
    (0, common_1.Get)('purposes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CoreUploadController.prototype, "purposes", null);
__decorate([
    (0, common_1.Post)('presign'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [presign_dto_1.PresignDto, Object]),
    __metadata("design:returntype", void 0)
], CoreUploadController.prototype, "presign", null);
__decorate([
    (0, common_1.Post)('complete'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [complete_upload_dto_1.CompleteUploadDto]),
    __metadata("design:returntype", void 0)
], CoreUploadController.prototype, "complete", null);
__decorate([
    (0, common_1.Post)('abandon/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CoreUploadController.prototype, "abandon", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)(memoryUpload()),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, multipart_fields_dto_1.MultipartFieldsDto, Object]),
    __metadata("design:returntype", void 0)
], CoreUploadController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CoreUploadController.prototype, "getOne", null);
exports.CoreUploadController = CoreUploadController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPERVISOR, client_1.UserRole.PROJECT_MANAGER, client_1.UserRole.WORKER, client_1.UserRole.COMPANY_ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/core/uploads`),
    (0, common_1.UseFilters)(multer_exception_filter_1.MulterExceptionFilter),
    __metadata("design:paramtypes", [core_upload_service_1.CoreUploadService])
], CoreUploadController);
//# sourceMappingURL=core-upload.controller.js.map