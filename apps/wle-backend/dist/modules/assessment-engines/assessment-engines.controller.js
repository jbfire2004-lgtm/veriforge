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
exports.AssessmentEnginesController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const assessment_engines_service_1 = require("./assessment-engines.service");
const assessment_export_service_1 = require("./assessment-export.service");
const fit_test_service_1 = require("../fit-test/fit-test.service");
const STAFF_ROLES = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let AssessmentEnginesController = class AssessmentEnginesController {
    constructor(engines, exportPdf, fitTests) {
        this.engines = engines;
        this.exportPdf = exportPdf;
        this.fitTests = fitTests;
    }
    runTraining(workerId, projectId, req) {
        var _a;
        return this.engines.runTrainingAssessment(parseInt(workerId, 10), (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, projectId ? parseInt(projectId, 10) : undefined);
    }
    latestTraining(workerId) {
        return this.engines.getLatestTrainingAssessment(parseInt(workerId, 10));
    }
    runSpce(companyId, req, body) {
        var _a;
        return this.engines.runSafetyProgramCompliance(parseInt(companyId, 10), (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, body);
    }
    latestSpce(companyId) {
        return this.engines.getLatestByEngine(client_1.VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE, { companyId: parseInt(companyId, 10) });
    }
    spceHistory(companyId, limit) {
        return this.engines.listHistoryByEngine(client_1.VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE, { companyId: parseInt(companyId, 10) }, limit ? parseInt(limit, 10) : undefined);
    }
    runSmartGap(companyId, hiringClientId, projectId, req) {
        var _a;
        return this.engines.runSmartGapAnalysis(parseInt(companyId, 10), parseInt(hiringClientId, 10) || parseInt(companyId, 10), (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, projectId ? parseInt(projectId, 10) : undefined);
    }
    async exportTraining(workerId, res) {
        const buf = await this.exportPdf.trainingPdf(parseInt(workerId, 10));
        res.setHeader('Content-Disposition', `attachment; filename="training-assessment-${workerId}.pdf"`);
        return res.send(buf);
    }
    async exportSpce(companyId, res) {
        const buf = await this.exportPdf.spcePdf(parseInt(companyId, 10));
        res.setHeader('Content-Disposition', `attachment; filename="spce-${companyId}.pdf"`);
        return res.send(buf);
    }
    async exportSmartGapPdf(companyId, projectId, res) {
        const buf = await this.exportPdf.smartGapPdf(parseInt(companyId, 10), projectId ? parseInt(projectId, 10) : undefined);
        res.setHeader('Content-Disposition', `attachment; filename="smart-gap-${companyId}.pdf"`);
        return res.send(buf);
    }
    latestSmartGap(companyId, projectId) {
        return this.engines.getLatestByEngine(client_1.VeraAssessmentEngine.SMART_GAP_ANALYSIS, {
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        });
    }
    smartGapHistory(companyId, limit, projectId) {
        return this.engines.listHistoryByEngine(client_1.VeraAssessmentEngine.SMART_GAP_ANALYSIS, {
            companyId: parseInt(companyId, 10),
            projectId: projectId ? parseInt(projectId, 10) : undefined,
        }, limit ? parseInt(limit, 10) : undefined);
    }
    runFitTest(workerId, req, body) {
        var _a;
        return this.fitTests.run(parseInt(workerId, 10), {
            tenantId: body.tenantId,
            testType: body.testType,
            testMethod: body.testMethod,
            result: body.result,
            performedAt: body.performedAt ? new Date(body.performedAt) : undefined,
            expiresAt: body.expiresAt === null
                ? null
                : body.expiresAt
                    ? new Date(body.expiresAt)
                    : undefined,
            notes: body.notes,
            evidenceFilesJson: body.evidenceFilesJson,
            validityYears: body.validityYears,
            createdById: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
        });
    }
    latestFitTest(workerId) {
        return this.fitTests.summary(parseInt(workerId, 10));
    }
    fitTestHistory(workerId) {
        return this.fitTests.listHistory(parseInt(workerId, 10));
    }
    async exportFitTestPdf(workerId, res) {
        const buf = await this.fitTests.exportPdf(parseInt(workerId, 10));
        res.setHeader('Content-Disposition', `attachment; filename="fit-test-${workerId}.pdf"`);
        return res.send(buf);
    }
};
exports.AssessmentEnginesController = AssessmentEnginesController;
__decorate([
    (0, common_1.Post)('training/worker/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AssessmentEnginesController.prototype, "runTraining", null);
__decorate([
    (0, common_1.Get)('training/worker/:workerId/latest'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssessmentEnginesController.prototype, "latestTraining", null);
__decorate([
    (0, common_1.Post)('safety-program/company/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AssessmentEnginesController.prototype, "runSpce", null);
__decorate([
    (0, common_1.Get)('safety-program/company/:companyId/latest'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssessmentEnginesController.prototype, "latestSpce", null);
__decorate([
    (0, common_1.Get)('safety-program/company/:companyId/history'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AssessmentEnginesController.prototype, "spceHistory", null);
__decorate([
    (0, common_1.Post)('smart-gap/company/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('hiringClientId')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], AssessmentEnginesController.prototype, "runSmartGap", null);
__decorate([
    (0, common_1.Get)('training/worker/:workerId/export.pdf'),
    (0, common_1.Header)('Content-Type', 'application/pdf'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssessmentEnginesController.prototype, "exportTraining", null);
__decorate([
    (0, common_1.Get)('safety-program/company/:companyId/export.pdf'),
    (0, common_1.Header)('Content-Type', 'application/pdf'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssessmentEnginesController.prototype, "exportSpce", null);
__decorate([
    (0, common_1.Get)('smart-gap/company/:companyId/export.pdf'),
    (0, common_1.Header)('Content-Type', 'application/pdf'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AssessmentEnginesController.prototype, "exportSmartGapPdf", null);
__decorate([
    (0, common_1.Get)('smart-gap/company/:companyId/latest'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AssessmentEnginesController.prototype, "latestSmartGap", null);
__decorate([
    (0, common_1.Get)('smart-gap/company/:companyId/history'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AssessmentEnginesController.prototype, "smartGapHistory", null);
__decorate([
    (0, common_1.Post)('fit-test/worker/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AssessmentEnginesController.prototype, "runFitTest", null);
__decorate([
    (0, common_1.Get)('fit-test/worker/:workerId/latest'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssessmentEnginesController.prototype, "latestFitTest", null);
__decorate([
    (0, common_1.Get)('fit-test/worker/:workerId/history'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssessmentEnginesController.prototype, "fitTestHistory", null);
__decorate([
    (0, common_1.Get)('fit-test/worker/:workerId/export.pdf'),
    (0, common_1.Header)('Content-Type', 'application/pdf'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssessmentEnginesController.prototype, "exportFitTestPdf", null);
exports.AssessmentEnginesController = AssessmentEnginesController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/assessment-engines`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...STAFF_ROLES),
    __metadata("design:paramtypes", [assessment_engines_service_1.AssessmentEnginesService,
        assessment_export_service_1.AssessmentExportService,
        fit_test_service_1.FitTestService])
], AssessmentEnginesController);
//# sourceMappingURL=assessment-engines.controller.js.map