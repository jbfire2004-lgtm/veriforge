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
exports.PmSafetyWorkflowController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/roles.guard");
const routes_1 = require("../config/routes");
const create_pm_safety_workflow_dto_1 = require("./dto/create-pm-safety-workflow.dto");
const sign_pm_safety_worker_dto_1 = require("./dto/sign-pm-safety-worker.dto");
const transition_pm_safety_workflow_dto_1 = require("./dto/transition-pm-safety-workflow.dto");
const pm_safety_workflow_service_1 = require("./pm-safety-workflow.service");
const STATUS_FILTER = [
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'CLOSED',
    'CANCELLED',
];
const ACTOR_ROLES = [
    'ADMIN',
    'SUPERVISOR',
    'PROJECT_MANAGER',
    'WORKER',
];
let PmSafetyWorkflowController = class PmSafetyWorkflowController {
    constructor(pmSafety) {
        this.pmSafety = pmSafety;
    }
    definition() {
        return this.pmSafety.getDefinition();
    }
    list(companyId, status) {
        const cidRaw = companyId != null && companyId !== '' ? parseInt(companyId, 10) : NaN;
        const st = status && STATUS_FILTER.includes(status)
            ? status
            : undefined;
        return this.pmSafety.list({
            companyId: Number.isFinite(cidRaw) ? cidRaw : undefined,
            status: st,
        });
    }
    create(dto) {
        return this.pmSafety.create(dto);
    }
    findOne(id) {
        return this.pmSafety.findOne(id);
    }
    state(id) {
        return this.pmSafety.getState(id);
    }
    signWorker(id, dto, actorUserId, actorRole) {
        const actor = this.parseActorRequired(actorUserId, actorRole);
        return this.pmSafety.signWorker(id, dto, actor);
    }
    transition(id, dto, actorUserId, actorRole) {
        const actor = this.parseActorRequired(actorUserId, actorRole);
        return this.pmSafety.transition(id, dto.action, actor, dto.note);
    }
    events(id) {
        return this.pmSafety.listEvents(id);
    }
    async exportPdf(id) {
        const buf = await this.pmSafety.exportPdfBuffer(id);
        return new common_1.StreamableFile(new Uint8Array(buf), {
            type: 'application/pdf',
            disposition: `attachment; filename="pm-safety-workflow-${id}.pdf"`,
        });
    }
    parseActorRequired(userIdHeader, roleHeader) {
        if (userIdHeader == null ||
            userIdHeader === '' ||
            roleHeader == null ||
            roleHeader === '') {
            throw new common_1.HttpException('Actor headers x-pm-actor-user-id and x-pm-actor-role are required', common_1.HttpStatus.UNAUTHORIZED);
        }
        return this.parseActorCore(userIdHeader, roleHeader);
    }
    parseActorCore(userIdHeader, roleHeader) {
        const userId = parseInt(userIdHeader, 10);
        if (!Number.isFinite(userId)) {
            throw new common_1.HttpException('x-pm-actor-user-id must be a positive integer', common_1.HttpStatus.BAD_REQUEST);
        }
        const role = roleHeader;
        if (!ACTOR_ROLES.includes(role)) {
            throw new common_1.HttpException('x-pm-actor-role must be ADMIN, SUPERVISOR, PROJECT_MANAGER, or WORKER', common_1.HttpStatus.BAD_REQUEST);
        }
        return { userId, role };
    }
};
exports.PmSafetyWorkflowController = PmSafetyWorkflowController;
__decorate([
    (0, common_1.Get)('definition'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PmSafetyWorkflowController.prototype, "definition", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyWorkflowController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPERVISOR, client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pm_safety_workflow_dto_1.CreatePmSafetyWorkflowDto]),
    __metadata("design:returntype", void 0)
], PmSafetyWorkflowController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmSafetyWorkflowController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/state'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmSafetyWorkflowController.prototype, "state", null);
__decorate([
    (0, common_1.Post)(':id/sign-worker'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-pm-actor-user-id')),
    __param(3, (0, common_1.Headers)('x-pm-actor-role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, sign_pm_safety_worker_dto_1.SignPmSafetyWorkerDto, String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyWorkflowController.prototype, "signWorker", null);
__decorate([
    (0, common_1.Post)(':id/transition'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.WORKER, client_1.UserRole.SUPERVISOR, client_1.UserRole.ADMIN, client_1.UserRole.PROJECT_MANAGER),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-pm-actor-user-id')),
    __param(3, (0, common_1.Headers)('x-pm-actor-role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, transition_pm_safety_workflow_dto_1.TransitionPmSafetyWorkflowDto, String, String]),
    __metadata("design:returntype", void 0)
], PmSafetyWorkflowController.prototype, "transition", null);
__decorate([
    (0, common_1.Get)(':id/events'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PmSafetyWorkflowController.prototype, "events", null);
__decorate([
    (0, common_1.Get)(':id/export/pdf'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PmSafetyWorkflowController.prototype, "exportPdf", null);
exports.PmSafetyWorkflowController = PmSafetyWorkflowController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.WORKER, client_1.UserRole.SUPERVISOR, client_1.UserRole.ADMIN, client_1.UserRole.PROJECT_MANAGER),
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/pm/safety-workflows`),
    __metadata("design:paramtypes", [pm_safety_workflow_service_1.PmSafetyWorkflowService])
], PmSafetyWorkflowController);
//# sourceMappingURL=pm-safety-workflow.controller.js.map