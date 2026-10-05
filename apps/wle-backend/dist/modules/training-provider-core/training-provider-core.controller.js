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
exports.TrainingProviderCoreController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const roles_guard_1 = require("../../auth/roles.guard");
const routes_1 = require("../../config/routes");
const public_rate_limit_decorator_1 = require("../../security/decorators/public-rate-limit.decorator");
const rbac_1 = require("../../security/rbac");
const roles_1 = require("../vera-core/roles");
const training_provider_dto_1 = require("./dto/training-provider.dto");
const training_provider_permissions_1 = require("./training-provider-permissions");
const training_provider_access_service_1 = require("./training-provider-access.service");
const training_provider_core_service_1 = require("./training-provider-core.service");
function portalUser(req) {
    return req.user;
}
let TrainingProviderCoreController = class TrainingProviderCoreController {
    constructor(svc, access) {
        this.svc = svc;
        this.access = access;
    }
    portalMe(req) {
        return this.access.getPortalContext(portalUser(req));
    }
    onboardProvider(dto) {
        return this.access.onboardProvider(dto);
    }
    onboardInstructor(providerId, dto, req) {
        return this.access.onboardInstructor(providerId, dto, portalUser(req));
    }
    listProviders() {
        return this.svc.listProviders();
    }
    createProvider(dto) {
        return this.svc.createProvider(dto);
    }
    async getProvider(id, req) {
        await this.svc.assertAccess(portalUser(req), id);
        return this.svc.getProvider(id);
    }
    async dashboard(req, providerId) {
        const pid = await this.access.resolveProviderId(portalUser(req), providerId ? Number(providerId) : undefined);
        return this.svc.dashboard(pid);
    }
    async updateProfile(id, dto, req) {
        await this.svc.assertAccess(portalUser(req), id);
        return this.svc.updateProfile(id, dto);
    }
    approvalStatus(id, req) {
        return this.access.getApprovalStatus(id, portalUser(req));
    }
    requestApproval(id, dto, req) {
        return this.access.requestApproval(id, dto, portalUser(req));
    }
    approve(id, dto, req) {
        return this.svc.approveProvider(id, dto, req.user.id);
    }
    async compliance(id, req) {
        await this.svc.assertAccess(portalUser(req), id);
        return this.svc.getComplianceHistory(id);
    }
    async assessCompliance(id, notes, req) {
        await this.svc.assertAccess(portalUser(req), id);
        return this.svc.assessCompliance(id, notes);
    }
    async listCourses(providerId, req) {
        await this.svc.assertAccess(portalUser(req), providerId);
        return this.svc.listCourses(providerId);
    }
    async addCourse(providerId, dto, req) {
        await this.svc.assertAccess(portalUser(req), providerId);
        return this.svc.addCourse(providerId, dto);
    }
    async listInstructors(providerId, req) {
        await this.svc.assertAccess(portalUser(req), providerId);
        return this.svc.listInstructors(providerId);
    }
    async addInstructor(providerId, dto, req) {
        await this.svc.assertAccess(portalUser(req), providerId);
        return this.svc.addInstructor(providerId, dto);
    }
    instructorMe(req) {
        return this.access.instructorProfile(portalUser(req));
    }
    validateInstructor(id) {
        return this.svc.validateInstructorQualification(id);
    }
    uploadTraining(providerId, dto, req) {
        return this.access.uploadTrainingForActor(providerId, dto, portalUser(req));
    }
    uploadClassList(providerId, dto, req) {
        return this.access.uploadClassList(providerId, dto, portalUser(req));
    }
    async issueCertificate(providerId, dto, req) {
        await this.svc.assertAccess(portalUser(req), providerId);
        return this.svc.issueCertificate(providerId, dto, req.user.id);
    }
    attachCertificate(recordId, dto, req) {
        this.access.requirePermission(portalUser(req), training_provider_permissions_1.TrainingProviderPermission.UPLOAD_CERTIFICATES);
        return this.svc.attachCertificateUrl(recordId, dto.certificateUrl);
    }
    signCertificate(recordId, dto, req) {
        return this.access.signCertificate(recordId, dto, portalUser(req));
    }
    validateCertificate(token) {
        return this.svc.validateCertificate(token);
    }
    certificateBundle(recordId) {
        return this.svc.certificateBundle(recordId);
    }
    history(providerId, limit, req) {
        return this.access.trainingHistoryForActor(providerId, portalUser(req), limit ? Number(limit) : 50);
    }
};
exports.TrainingProviderCoreController = TrainingProviderCoreController;
__decorate([
    (0, common_1.Get)('portal/me'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_INSTRUCTOR_ROLES),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "portalMe", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(10, 60000),
    (0, common_1.Post)('onboarding/provider'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [training_provider_dto_1.ProviderOnboardingDto]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "onboardProvider", null);
__decorate([
    (0, common_1.Post)('onboarding/provider/:providerId/instructor'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_PROVIDER_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, training_provider_dto_1.InstructorOnboardingDto, Object]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "onboardInstructor", null);
__decorate([
    (0, common_1.Get)('providers'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPER_ADMIN_ROLES, ...roles_1.COMPANY_ADMIN_ROLES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "listProviders", null);
__decorate([
    (0, common_1.Post)('providers'),
    (0, roles_decorator_1.Roles)(...roles_1.SUPER_ADMIN_ROLES),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [training_provider_dto_1.CreateTrainingProviderDto]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "createProvider", null);
__decorate([
    (0, common_1.Get)('providers/:id'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_INSTRUCTOR_ROLES, ...roles_1.COMPANY_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TrainingProviderCoreController.prototype, "getProvider", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_INSTRUCTOR_ROLES, ...roles_1.SUPER_ADMIN_ROLES),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('providerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TrainingProviderCoreController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Patch)('providers/:id/profile'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_PROVIDER_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, training_provider_dto_1.UpdateTrainingProviderProfileDto, Object]),
    __metadata("design:returntype", Promise)
], TrainingProviderCoreController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('providers/:id/approval-status'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_PROVIDER_ADMIN_ROLES, ...roles_1.COMPANY_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "approvalStatus", null);
__decorate([
    (0, common_1.Post)('providers/:id/request-approval'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_PROVIDER_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, training_provider_dto_1.RequestApprovalDto, Object]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "requestApproval", null);
__decorate([
    (0, common_1.Post)('providers/:id/approve'),
    (0, roles_decorator_1.Roles)(...roles_1.COMPANY_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, training_provider_dto_1.ProviderApprovalDto, Object]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "approve", null);
__decorate([
    (0, common_1.Get)('providers/:id/compliance'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_PROVIDER_ADMIN_ROLES, ...roles_1.COMPANY_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TrainingProviderCoreController.prototype, "compliance", null);
__decorate([
    (0, common_1.Post)('providers/:id/compliance/assess'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_PROVIDER_ADMIN_ROLES, ...roles_1.COMPANY_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('notes')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], TrainingProviderCoreController.prototype, "assessCompliance", null);
__decorate([
    (0, common_1.Get)('providers/:providerId/courses'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_INSTRUCTOR_ROLES),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TrainingProviderCoreController.prototype, "listCourses", null);
__decorate([
    (0, common_1.Post)('providers/:providerId/courses'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_PROVIDER_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, training_provider_dto_1.CreateTrainingCourseDto, Object]),
    __metadata("design:returntype", Promise)
], TrainingProviderCoreController.prototype, "addCourse", null);
__decorate([
    (0, common_1.Get)('providers/:providerId/instructors'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_PROVIDER_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TrainingProviderCoreController.prototype, "listInstructors", null);
__decorate([
    (0, common_1.Post)('providers/:providerId/instructors'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_PROVIDER_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, training_provider_dto_1.CreateTrainingInstructorDto, Object]),
    __metadata("design:returntype", Promise)
], TrainingProviderCoreController.prototype, "addInstructor", null);
__decorate([
    (0, common_1.Get)('instructor/me'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TRAINING_INSTRUCTOR, ...roles_1.SUPER_ADMIN_ROLES),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "instructorMe", null);
__decorate([
    (0, common_1.Post)('instructors/:id/validate-qualification'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_PROVIDER_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "validateInstructor", null);
__decorate([
    (0, common_1.Post)('providers/:providerId/training/upload'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_INSTRUCTOR_ROLES),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, training_provider_dto_1.UploadTrainingDto, Object]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "uploadTraining", null);
__decorate([
    (0, common_1.Post)('providers/:providerId/class-lists/upload'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_INSTRUCTOR_ROLES),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, training_provider_dto_1.UploadClassListDto, Object]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "uploadClassList", null);
__decorate([
    (0, common_1.Post)('providers/:providerId/certificates/issue'),
    (0, roles_decorator_1.Roles)(...(0, rbac_1.rolesFor)('issueCredentials')),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, training_provider_dto_1.IssueCertificateDto, Object]),
    __metadata("design:returntype", Promise)
], TrainingProviderCoreController.prototype, "issueCertificate", null);
__decorate([
    (0, common_1.Post)('records/:recordId/certificate-upload'),
    (0, roles_decorator_1.Roles)(...(0, rbac_1.rolesFor)('issueCredentials')),
    __param(0, (0, common_1.Param)('recordId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, training_provider_dto_1.CertificateUploadDto, Object]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "attachCertificate", null);
__decorate([
    (0, common_1.Post)('records/:recordId/sign'),
    (0, roles_decorator_1.Roles)(...(0, rbac_1.rolesFor)('issueCredentials')),
    __param(0, (0, common_1.Param)('recordId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, training_provider_dto_1.SignCertificateDto, Object]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "signCertificate", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(30, 60000),
    (0, common_1.Get)('certificates/validate/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "validateCertificate", null);
__decorate([
    (0, common_1.Get)('records/:recordId/certificate'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_INSTRUCTOR_ROLES, ...roles_1.SUPER_ADMIN_ROLES),
    __param(0, (0, common_1.Param)('recordId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "certificateBundle", null);
__decorate([
    (0, common_1.Get)('providers/:providerId/history'),
    (0, roles_decorator_1.Roles)(...roles_1.TRAINING_INSTRUCTOR_ROLES),
    __param(0, (0, common_1.Param)('providerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], TrainingProviderCoreController.prototype, "history", null);
exports.TrainingProviderCoreController = TrainingProviderCoreController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/training-providers`),
    __metadata("design:paramtypes", [training_provider_core_service_1.TrainingProviderCoreService,
        training_provider_access_service_1.TrainingProviderAccessService])
], TrainingProviderCoreController);
//# sourceMappingURL=training-provider-core.controller.js.map