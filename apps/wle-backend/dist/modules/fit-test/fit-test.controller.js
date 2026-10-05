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
exports.FitTestController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const roles_guard_1 = require("../../auth/roles.guard");
const roles_decorator_1 = require("../../auth/roles.decorator");
const routes_1 = require("../../config/routes");
const fit_test_service_1 = require("./fit-test.service");
const STAFF = [
    client_1.UserRole.SUPERVISOR,
    client_1.UserRole.ADMIN,
    client_1.UserRole.SUPER_ADMIN,
    client_1.UserRole.COMPANY_ADMIN,
    client_1.UserRole.PROJECT_MANAGER,
];
let FitTestController = class FitTestController {
    constructor(fitTests) {
        this.fitTests = fitTests;
    }
    evaluate(body) {
        var _a, _b, _c, _d;
        return this.fitTests.evaluate({
            result: (_b = (_a = body.result) !== null && _a !== void 0 ? _a : body.outcome) !== null && _b !== void 0 ? _b : 'CONDITIONAL',
            performedAt: (_c = body.performedAt) !== null && _c !== void 0 ? _c : body.testedAt,
            expiresAt: (_d = body.expiresAt) !== null && _d !== void 0 ? _d : body.nextDueAt,
            validityYears: body.validityYears,
        });
    }
    list(workerId) {
        return this.fitTests.listHistory(parseInt(workerId, 10));
    }
    latest(workerId) {
        return this.fitTests.summary(parseInt(workerId, 10));
    }
    async exportPdf(workerId, res) {
        const buf = await this.fitTests.exportPdf(parseInt(workerId, 10));
        res.setHeader('Content-Disposition', `attachment; filename="fit-test-${workerId}.pdf"`);
        return res.send(buf);
    }
    companySummary(companyId) {
        return this.fitTests.companySummary(parseInt(companyId, 10));
    }
    record(workerId, req, body) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return this.fitTests.run(parseInt(workerId, 10), {
            tenantId: (_a = body.tenantId) !== null && _a !== void 0 ? _a : body.companyId,
            testType: (_b = body.testType) !== null && _b !== void 0 ? _b : body.respiratorType,
            testMethod: body.testMethod,
            result: (_d = (_c = body.result) !== null && _c !== void 0 ? _c : body.outcome) !== null && _d !== void 0 ? _d : 'CONDITIONAL',
            performedAt: ((_e = body.performedAt) !== null && _e !== void 0 ? _e : body.testedAt)
                ? new Date((_f = body.performedAt) !== null && _f !== void 0 ? _f : body.testedAt)
                : undefined,
            expiresAt: ((_g = body.expiresAt) !== null && _g !== void 0 ? _g : body.nextDueAt) === null
                ? null
                : ((_h = body.expiresAt) !== null && _h !== void 0 ? _h : body.nextDueAt)
                    ? new Date((_j = body.expiresAt) !== null && _j !== void 0 ? _j : body.nextDueAt)
                    : undefined,
            notes: (_k = body.notes) !== null && _k !== void 0 ? _k : body.evidenceNotes,
            evidenceFilesJson: body.evidenceFilesJson,
            validityYears: body.validityYears,
            createdById: (_l = req.user) === null || _l === void 0 ? void 0 : _l.userId,
        });
    }
};
exports.FitTestController = FitTestController;
__decorate([
    (0, common_1.Post)('evaluate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FitTestController.prototype, "evaluate", null);
__decorate([
    (0, common_1.Get)('worker/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FitTestController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('worker/:workerId/latest'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FitTestController.prototype, "latest", null);
__decorate([
    (0, common_1.Get)('worker/:workerId/export.pdf'),
    (0, common_1.Header)('Content-Type', 'application/pdf'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FitTestController.prototype, "exportPdf", null);
__decorate([
    (0, common_1.Get)('company/:companyId/summary'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FitTestController.prototype, "companySummary", null);
__decorate([
    (0, common_1.Post)('worker/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], FitTestController.prototype, "record", null);
exports.FitTestController = FitTestController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/fit-tests`),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(...STAFF),
    __metadata("design:paramtypes", [fit_test_service_1.FitTestService])
], FitTestController);
//# sourceMappingURL=fit-test.controller.js.map