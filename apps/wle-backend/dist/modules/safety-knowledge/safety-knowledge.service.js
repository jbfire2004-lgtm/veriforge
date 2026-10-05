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
exports.SafetyKnowledgeService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const safety_knowledge_engine_1 = require("./safety-knowledge.engine");
const assessment_engines_utils_1 = require("../assessment-engines/assessment-engines.utils");
const build_text_pdf_1 = require("../../common/pdf/build-text-pdf");
const audit_log_service_1 = require("../../audit/audit-log.service");
const audit_actions_1 = require("../../audit/audit-actions");
let SafetyKnowledgeService = class SafetyKnowledgeService {
    constructor(prisma, auditLog) {
        this.prisma = prisma;
        this.auditLog = auditLog;
    }
    async buildInput(workerId) {
        var _a, _b, _c, _d;
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                company: { include: { trainingRequirements: true } },
                trainingRecords: {
                    include: { certification: true },
                    orderBy: { issuedAt: 'desc' },
                },
            },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const companyId = worker.companyId;
        const [orientationForms, policyRequired, policyCompleted, flha, bbo, inspections,] = await Promise.all([
            this.prisma.safetyForm.count({
                where: {
                    workerId,
                    definitionId: 'site-orientation',
                    status: 'SUBMITTED',
                },
            }),
            companyId
                ? this.prisma.policyDocument.count({
                    where: { companyId, requiresAck: true, status: 'published' },
                })
                : Promise.resolve(0),
            companyId
                ? this.prisma.policyAcknowledgment.count({
                    where: {
                        workerId,
                        policyDocument: { companyId, requiresAck: true },
                    },
                })
                : Promise.resolve(0),
            companyId
                ? this.prisma.jhaFlha.count({
                    where: {
                        companyId,
                        kind: 'FLHA',
                        createdAt: { gte: since90 },
                        workers: { some: { workerId } },
                    },
                })
                : Promise.resolve(0),
            companyId
                ? this.prisma.bboObservation.count({
                    where: {
                        workerId,
                        createdAt: { gte: since90 },
                        project: { companyId },
                    },
                })
                : Promise.resolve(0),
            companyId
                ? this.prisma.pmInspection.count({
                    where: {
                        companyId,
                        workerId,
                        deletedAt: null,
                        createdAt: { gte: since90 },
                    },
                })
                : Promise.resolve(0),
        ]);
        const now = new Date();
        const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return {
            context: {
                dateNow: now.toISOString(),
                jurisdiction: (_b = (_a = worker.company) === null || _a === void 0 ? void 0 : _a.province) !== null && _b !== void 0 ? _b : undefined,
            },
            worker: {
                id: String(workerId),
                name: `${worker.firstName} ${worker.lastName}`,
                companyId: worker.companyId ? String(worker.companyId) : undefined,
            },
            requiredCourses: ((_d = (_c = worker.company) === null || _c === void 0 ? void 0 : _c.trainingRequirements) !== null && _d !== void 0 ? _d : []).map((r) => ({
                code: (0, assessment_engines_utils_1.courseCodeFromName)(r.courseName),
                name: r.courseName,
            })),
            trainingRecords: worker.trainingRecords.map((r) => {
                var _a;
                return ({
                    courseCode: (_a = r.certification.code) !== null && _a !== void 0 ? _a : (0, assessment_engines_utils_1.courseCodeFromName)(r.certification.name),
                    verified: !!r.certificateSignedAt,
                    expired: !!(r.expiresAt && r.expiresAt <= now),
                    expiringSoon: !!(r.expiresAt &&
                        r.expiresAt > now &&
                        r.expiresAt <= soon),
                });
            }),
            orientationComplete: orientationForms > 0,
            policyAcknowledgments: {
                required: policyRequired,
                completed: policyCompleted,
            },
            fieldActivity: {
                flhaCount90d: flha,
                bboCount90d: bbo,
                inspections90d: inspections,
            },
        };
    }
    async evaluateAndPersist(workerId, createdByUserId) {
        var _a, _b;
        const input = await this.buildInput(workerId);
        const result = (0, safety_knowledge_engine_1.evaluateSafetyKnowledge)(input);
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            select: { companyId: true },
        });
        const run = await this.prisma.veraAssessmentRun.create({
            data: {
                engine: client_1.VeraAssessmentEngine.SAFETY_KNOWLEDGE,
                workerId,
                companyId: (_a = worker === null || worker === void 0 ? void 0 : worker.companyId) !== null && _a !== void 0 ? _a : undefined,
                overallScore: result.overallScore,
                overallStatus: result.overallStatus,
                resultJson: result,
                createdByUserId,
            },
        });
        await this.auditLog.logAudit({ id: createdByUserId !== null && createdByUserId !== void 0 ? createdByUserId : null, companyId: (_b = worker === null || worker === void 0 ? void 0 : worker.companyId) !== null && _b !== void 0 ? _b : null }, audit_actions_1.AuditAction.ASSESSMENT_SKE_RUN, {
            type: audit_actions_1.AuditEntityType.VERA_ASSESSMENT_RUN,
            id: run.id,
            tenantId: worker === null || worker === void 0 ? void 0 : worker.companyId,
        }, {
            workerId,
            overallScore: result.overallScore,
            overallStatus: result.overallStatus,
        });
        return { runId: run.id, result };
    }
    async getLatest(workerId) {
        return this.prisma.veraAssessmentRun.findFirst({
            where: {
                workerId,
                engine: client_1.VeraAssessmentEngine.SAFETY_KNOWLEDGE,
            },
            orderBy: { evaluatedAt: 'desc' },
        });
    }
    async listHistory(workerId, limit = 10) {
        return this.prisma.veraAssessmentRun.findMany({
            where: {
                workerId,
                engine: client_1.VeraAssessmentEngine.SAFETY_KNOWLEDGE,
            },
            orderBy: { evaluatedAt: 'desc' },
            take: Math.min(Math.max(limit, 1), 50),
            select: {
                id: true,
                overallScore: true,
                overallStatus: true,
                evaluatedAt: true,
                createdByUserId: true,
            },
        });
    }
    buildPdf(result, workerName) {
        const lines = [
            `Worker: ${workerName}`,
            `Overall: ${result.overallStatus} (${result.overallScore}/100)`,
            '',
            'Domains:',
            ...result.domains.map((d) => `- ${d.domain}: ${d.status} (${d.score})${d.gaps[0] ? ` — ${d.gaps[0]}` : ''}`),
            '',
            'Recommendations:',
            ...(result.recommendations.length
                ? result.recommendations.map((r) => `- ${r}`)
                : ['- None']),
        ];
        return (0, build_text_pdf_1.buildTextPdfBuffer)({
            title: 'VERA Safety Knowledge Assessment',
            subtitle: `Worker ${result.workerId}`,
            lines,
        });
    }
};
exports.SafetyKnowledgeService = SafetyKnowledgeService;
exports.SafetyKnowledgeService = SafetyKnowledgeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], SafetyKnowledgeService);
//# sourceMappingURL=safety-knowledge.service.js.map