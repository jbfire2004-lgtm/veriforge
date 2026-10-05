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
exports.SafetyKnowledgeController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const safety_knowledge_service_1 = require("./safety-knowledge.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const STAFF_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let SafetyKnowledgeController = class SafetyKnowledgeController {
    constructor(safetyKnowledge, prisma) {
        this.safetyKnowledge = safetyKnowledge;
        this.prisma = prisma;
    }
    evaluate(workerId, req) {
        var _a;
        return this.safetyKnowledge.evaluateAndPersist(parseInt(workerId, 10), (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    }
    latest(workerId) {
        return this.safetyKnowledge.getLatest(parseInt(workerId, 10));
    }
    history(workerId) {
        return this.safetyKnowledge.listHistory(parseInt(workerId, 10));
    }
    async exportPdf(workerId, res) {
        var _a;
        const wid = parseInt(workerId, 10);
        const run = await this.safetyKnowledge.getLatest(wid);
        const worker = await this.prisma.worker.findUnique({
            where: { id: wid },
            select: { firstName: true, lastName: true },
        });
        const result = ((_a = run === null || run === void 0 ? void 0 : run.resultJson) !== null && _a !== void 0 ? _a : null);
        if (!result) {
            const { result: fresh } = await this.safetyKnowledge.evaluateAndPersist(wid);
            const buf = this.safetyKnowledge.buildPdf(fresh, worker ? `${worker.firstName} ${worker.lastName}` : `Worker ${wid}`);
            res.setHeader('Content-Disposition', `attachment; filename="safety-knowledge-${wid}.pdf"`);
            return res.send(buf);
        }
        const buf = this.safetyKnowledge.buildPdf(result, worker ? `${worker.firstName} ${worker.lastName}` : `Worker ${wid}`);
        res.setHeader('Content-Disposition', `attachment; filename="safety-knowledge-${wid}.pdf"`);
        return res.send(buf);
    }
};
exports.SafetyKnowledgeController = SafetyKnowledgeController;
__decorate([
    (0, common_1.Post)('worker/:workerId/evaluate'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SafetyKnowledgeController.prototype, "evaluate", null);
__decorate([
    (0, common_1.Get)('worker/:workerId/latest'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SafetyKnowledgeController.prototype, "latest", null);
__decorate([
    (0, common_1.Get)('worker/:workerId/history'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SafetyKnowledgeController.prototype, "history", null);
__decorate([
    (0, common_1.Get)('worker/:workerId/export.pdf'),
    (0, common_1.Header)('Content-Type', 'application/pdf'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SafetyKnowledgeController.prototype, "exportPdf", null);
exports.SafetyKnowledgeController = SafetyKnowledgeController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/safety-knowledge`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...STAFF_ROLES),
    __metadata("design:paramtypes", [safety_knowledge_service_1.SafetyKnowledgeService,
        prisma_service_1.PrismaService])
], SafetyKnowledgeController);
//# sourceMappingURL=safety-knowledge.controller.js.map