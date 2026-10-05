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
exports.OrientationAiController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/roles.guard");
const roles_decorator_1 = require("../../../auth/roles.decorator");
const routes_1 = require("../../../config/routes");
const roles_1 = require("../../vera-core/roles");
const tenant_scope_service_1 = require("../../../security/tenant-scope.service");
const orientation_ai_generate_service_1 = require("./orientation-ai-generate.service");
let OrientationAiController = class OrientationAiController {
    constructor(ai, tenant) {
        this.ai = ai;
        this.tenant = tenant;
    }
    generateFromText(req, body) {
        const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
        return this.ai.generateFromText({
            companyId,
            title: body.title,
            text: body.text,
            type: body.type,
        });
    }
    generateFromFile(req, body) {
        const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
        return this.ai.generateFromFile({
            companyId,
            title: body.title,
            fileName: body.fileName,
            mimeType: body.mimeType,
            textExtract: body.textExtract,
        });
    }
    generateQuiz(req, body) {
        const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
        return this.ai.generateQuiz({
            companyId,
            topic: body.topic,
            contentBlocks: body.contentBlocks,
            questionCount: body.questionCount,
        });
    }
    improveBlock(req, body) {
        const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
        return this.ai.improveBlock({
            companyId,
            block: body.block,
            instruction: body.instruction,
        });
    }
};
exports.OrientationAiController = OrientationAiController;
__decorate([
    (0, common_1.Post)('generate-from-text'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)(10, 60),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrientationAiController.prototype, "generateFromText", null);
__decorate([
    (0, common_1.Post)('generate-from-file'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)(10, 60),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrientationAiController.prototype, "generateFromFile", null);
__decorate([
    (0, common_1.Post)('generate-quiz'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)(10, 60),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrientationAiController.prototype, "generateQuiz", null);
__decorate([
    (0, common_1.Post)('improve-block'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)(20, 60),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrientationAiController.prototype, "improveBlock", null);
exports.OrientationAiController = OrientationAiController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/ai/orientation`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...roles_1.SUPERVISOR_ROLES),
    __metadata("design:paramtypes", [orientation_ai_generate_service_1.OrientationAiGenerateService,
        tenant_scope_service_1.TenantScopeService])
], OrientationAiController);
//# sourceMappingURL=orientation-ai.controller.js.map