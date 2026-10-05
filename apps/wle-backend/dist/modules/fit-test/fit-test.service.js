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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIT_TEST_DEFAULT_VALIDITY_YEARS = exports.FitTestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const build_text_pdf_1 = require("../../common/pdf/build-text-pdf");
const fit_test_engine_1 = require("./fit-test.engine");
Object.defineProperty(exports, "FIT_TEST_DEFAULT_VALIDITY_YEARS", { enumerable: true, get: function () { return fit_test_engine_1.FIT_TEST_DEFAULT_VALIDITY_YEARS; } });
const audit_log_service_1 = require("../../audit/audit-log.service");
const audit_actions_1 = require("../../audit/audit-actions");
let FitTestService = class FitTestService {
    constructor(prisma, auditLog) {
        this.prisma = prisma;
        this.auditLog = auditLog;
    }
    evaluate(input) {
        var _a, _b;
        const performedAt = input.performedAt instanceof Date
            ? input.performedAt
            : input.performedAt
                ? new Date(input.performedAt)
                : new Date();
        const expiresAt = input.expiresAt === null
            ? null
            : input.expiresAt
                ? input.expiresAt instanceof Date
                    ? input.expiresAt
                    : new Date(input.expiresAt)
                : undefined;
        const validityYears = (0, fit_test_engine_1.resolveFitTestValidityYears)(input.validityYears);
        const evaluation = (0, fit_test_engine_1.evaluateFitTest)({
            result: input.result,
            performedAt,
            expiresAt,
            validityYears,
        });
        return {
            evaluation: Object.assign(Object.assign({}, evaluation), { expiresAt: (_b = (_a = evaluation.expiresAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null }),
            validityYears,
        };
    }
    async listHistory(workerId) {
        const rows = await this.prisma.fitTestRun.findMany({
            where: { workerId },
            orderBy: { performedAt: 'desc' },
            take: 50,
        });
        return rows.map((row) => this.toDto(row));
    }
    async listForWorker(workerId) {
        return this.listHistory(workerId);
    }
    async getLatest(workerId) {
        return this.prisma.fitTestRun.findFirst({
            where: { workerId },
            orderBy: { performedAt: 'desc' },
        });
    }
    async run(workerId, data) {
        var _a, _b, _c, _d, _e, _f;
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            select: { id: true, companyId: true, firstName: true, lastName: true },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const performedAt = (_a = data.performedAt) !== null && _a !== void 0 ? _a : new Date();
        const validityYears = (0, fit_test_engine_1.resolveFitTestValidityYears)(data.validityYears);
        const evaluation = (0, fit_test_engine_1.evaluateFitTest)({
            result: data.result,
            performedAt,
            expiresAt: data.expiresAt,
            validityYears,
        });
        const tenantId = (_c = (_b = data.tenantId) !== null && _b !== void 0 ? _b : worker.companyId) !== null && _c !== void 0 ? _c : null;
        const row = await this.prisma.fitTestRun.create({
            data: {
                workerId,
                tenantId: tenantId !== null && tenantId !== void 0 ? tenantId : undefined,
                testType: data.testType,
                testMethod: data.testMethod,
                result: data.result,
                performedAt,
                expiresAt: evaluation.expiresAt,
                notes: data.notes,
                evidenceFilesJson: data.evidenceFilesJson,
                createdById: data.createdById,
            },
        });
        await this.auditLog.logAudit({ id: (_d = data.createdById) !== null && _d !== void 0 ? _d : null, companyId: tenantId }, audit_actions_1.AuditAction.ASSESSMENT_FIT_TEST_RECORD, {
            type: audit_actions_1.AuditEntityType.FIT_TEST_RUN,
            id: row.id,
            tenantId,
        }, {
            workerId,
            result: data.result,
            performedAt: performedAt.toISOString(),
        });
        return {
            run: this.toDto(row),
            evaluation: Object.assign(Object.assign({}, evaluation), { expiresAt: (_f = (_e = evaluation.expiresAt) === null || _e === void 0 ? void 0 : _e.toISOString()) !== null && _f !== void 0 ? _f : null }),
        };
    }
    async record(workerId, data) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const out = await this.run(workerId, {
            tenantId: (_a = data.tenantId) !== null && _a !== void 0 ? _a : data.companyId,
            testType: (_b = data.testType) !== null && _b !== void 0 ? _b : data.respiratorType,
            testMethod: data.testMethod,
            result: (_d = (_c = data.result) !== null && _c !== void 0 ? _c : data.outcome) !== null && _d !== void 0 ? _d : 'CONDITIONAL',
            performedAt: (_e = data.performedAt) !== null && _e !== void 0 ? _e : data.testedAt,
            expiresAt: (_f = data.expiresAt) !== null && _f !== void 0 ? _f : data.nextDueAt,
            notes: (_g = data.notes) !== null && _g !== void 0 ? _g : data.evidenceNotes,
            evidenceFilesJson: data.evidenceFilesJson,
            validityYears: data.validityYears,
            createdById: (_h = data.createdById) !== null && _h !== void 0 ? _h : data.createdByUserId,
        });
        return {
            record: out.run,
            evaluation: out.evaluation,
        };
    }
    async summary(workerId) {
        var _a, _b;
        const latest = await this.getLatest(workerId);
        if (!latest)
            return null;
        const evaluation = (0, fit_test_engine_1.evaluateFitTest)({
            result: latest.result,
            performedAt: latest.performedAt,
            expiresAt: latest.expiresAt,
        });
        return {
            latest: this.toDto(latest),
            evaluation: Object.assign(Object.assign({}, evaluation), { expiresAt: (_b = (_a = evaluation.expiresAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null }),
            readinessScore: (0, fit_test_engine_1.fitTestReadinessScore)({ hasRun: true, evaluation }),
        };
    }
    async companySummary(companyId) {
        const links = await this.prisma.companyLink.findMany({
            where: { companyId, active: true },
            select: { workerId: true },
        });
        const workerIds = links.map((l) => l.workerId);
        const totalWorkers = workerIds.length;
        if (!totalWorkers) {
            return {
                totalWorkers: 0,
                current: 0,
                expired: 0,
                expiring30: 0,
                missing: 0,
                failed: 0,
                complianceRate: 100,
            };
        }
        const runs = await this.prisma.fitTestRun.findMany({
            where: { workerId: { in: workerIds } },
            orderBy: { performedAt: 'desc' },
        });
        const latestByWorker = new Map();
        for (const run of runs) {
            if (!latestByWorker.has(run.workerId)) {
                latestByWorker.set(run.workerId, run);
            }
        }
        let current = 0;
        let expired = 0;
        let expiring30 = 0;
        let failed = 0;
        let missing = 0;
        for (const workerId of workerIds) {
            const latest = latestByWorker.get(workerId);
            if (!latest) {
                missing += 1;
                continue;
            }
            const evaluation = (0, fit_test_engine_1.evaluateFitTest)({
                result: latest.result,
                performedAt: latest.performedAt,
                expiresAt: latest.expiresAt,
            });
            if (evaluation.pass) {
                current += 1;
                if (evaluation.expiringSoon)
                    expiring30 += 1;
            }
            else if (evaluation.expired) {
                expired += 1;
            }
            else if (latest.result === 'FAIL') {
                failed += 1;
            }
            else {
                missing += 1;
            }
        }
        const complianceRate = totalWorkers > 0 ? Math.round((current / totalWorkers) * 100) : 100;
        return {
            totalWorkers,
            current,
            expired,
            expiring30,
            missing,
            failed,
            complianceRate,
        };
    }
    async exportPdf(workerId) {
        var _a, _b, _c;
        const summary = await this.summary(workerId);
        if (!summary)
            throw new common_1.NotFoundException('No fit test on file');
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            select: { firstName: true, lastName: true, companyId: true },
        });
        const history = await this.listHistory(workerId);
        const lines = [
            `Worker: ${worker ? `${worker.firstName} ${worker.lastName}` : workerId}`,
            `Status: ${summary.evaluation.statusLabel}`,
            `Performed: ${summary.latest.performedAt}`,
            `Expires: ${(_a = summary.latest.expiresAt) !== null && _a !== void 0 ? _a : '—'}`,
            `Test type: ${(_b = summary.latest.testType) !== null && _b !== void 0 ? _b : '—'}`,
            `Method: ${(_c = summary.latest.testMethod) !== null && _c !== void 0 ? _c : '—'}`,
            '',
            'Recent runs:',
            ...history
                .slice(0, 10)
                .map((row) => {
                var _a;
                return `- ${row.performedAt.slice(0, 10)} · ${row.result} · ${(_a = row.testType) !== null && _a !== void 0 ? _a : '—'}`;
            }),
        ];
        return (0, build_text_pdf_1.buildTextPdfBuffer)({
            title: 'VERA Respirator Fit Test Record',
            subtitle: `Worker ${workerId}`,
            lines,
        });
    }
    toDto(row) {
        var _a, _b;
        return {
            id: row.id,
            workerId: row.workerId,
            tenantId: row.tenantId,
            testType: row.testType,
            testMethod: row.testMethod,
            result: row.result,
            performedAt: row.performedAt.toISOString(),
            expiresAt: (_b = (_a = row.expiresAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null,
            notes: row.notes,
            evidenceFilesJson: row.evidenceFilesJson,
            createdById: row.createdById,
        };
    }
};
exports.FitTestService = FitTestService;
exports.FitTestService = FitTestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], FitTestService);
//# sourceMappingURL=fit-test.service.js.map