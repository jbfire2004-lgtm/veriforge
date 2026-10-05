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
exports.AssessmentEnginesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const safety_program_compliance_engine_1 = require("../safety-program-compliance/safety-program-compliance.engine");
const smart_gap_analysis_engine_1 = require("../smart-gap-analysis/smart-gap-analysis.engine");
const training_assessment_runner_service_1 = require("./training-assessment-runner.service");
const assessment_engines_utils_1 = require("./assessment-engines.utils");
const audit_log_service_1 = require("../../audit/audit-log.service");
const audit_actions_1 = require("../../audit/audit-actions");
let AssessmentEnginesService = class AssessmentEnginesService {
    constructor(prisma, trainingRunner, auditLog) {
        this.prisma = prisma;
        this.trainingRunner = trainingRunner;
        this.auditLog = auditLog;
    }
    async runTrainingAssessment(workerId, createdByUserId, projectId) {
        return this.trainingRunner.evaluateAndPersist(workerId, createdByUserId, projectId ? { projectId } : undefined);
    }
    async getLatestTrainingAssessment(workerId) {
        const run = await this.trainingRunner.getLatest(workerId);
        if (!run)
            return null;
        return {
            runId: run.id,
            evaluatedAt: run.evaluatedAt,
            overallScore: run.overallScore,
            overallStatus: run.overallStatus,
            result: run.resultJson,
        };
    }
    async buildSpceInput(companyId, overrides) {
        var _a;
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            include: { trainingRequirements: true },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const hiringClientProgramRequirements = company.trainingRequirements.map((req, i) => {
            var _a;
            return ({
                id: `SPCE-TR-${(_a = req.id) !== null && _a !== void 0 ? _a : i + 1}`,
                category: 'Training',
                type: 'TrainingConfig',
                description: `Maintain valid training for ${req.courseName}`,
                weight: 10,
                linkedLegislation: [],
            });
        });
        if (hiringClientProgramRequirements.length === 0) {
            hiringClientProgramRequirements.push({
                id: 'SPCE-POL-1',
                category: 'Policy',
                type: 'Policy',
                description: 'Documented health and safety policy',
                requiredSections: ['scope', 'responsibilities', 'review'],
                weight: 25,
            });
            hiringClientProgramRequirements.push({
                id: 'SPCE-REC-1',
                category: 'Records',
                type: 'Recordkeeping',
                description: 'Training and competency records retained',
                weight: 15,
            });
        }
        const policyDocs = await this.prisma.policyDocument.findMany({
            where: { companyId },
            take: 20,
            orderBy: { updatedAt: 'desc' },
        });
        const companySubmissions = policyDocs.map((doc, i) => {
            var _a, _b;
            return ({
                id: `SUB-POL-${doc.id}`,
                companyId: String(companyId),
                requirementId: 'SPCE-POL-1',
                documents: [
                    {
                        fileId: String(doc.id),
                        fileName: (_a = doc.title) !== null && _a !== void 0 ? _a : 'policy',
                        revisionDate: doc.updatedAt.toISOString(),
                        effectiveDate: (_b = doc.publishedAt) === null || _b === void 0 ? void 0 : _b.toISOString(),
                        parsedSections: ['scope', 'responsibilities'],
                        legislationRefs: [],
                    },
                ],
            });
        });
        for (const req of company.trainingRequirements) {
            companySubmissions.push({
                id: `SUB-TR-${req.id}`,
                companyId: String(companyId),
                requirementId: `SPCE-TR-${req.id}`,
                linkedTrainingConfigs: [
                    {
                        trainingCode: (0, assessment_engines_utils_1.courseCodeFromName)(req.courseName),
                        validityDays: req.expiresInDays,
                    },
                ],
            });
        }
        return Object.assign({ context: {
                jurisdiction: (_a = company.province) !== null && _a !== void 0 ? _a : undefined,
                dateNow: new Date().toISOString(),
            }, hiringClientProgramRequirements,
            companySubmissions }, overrides);
    }
    async runSafetyProgramCompliance(companyId, createdByUserId, inputOverride) {
        const input = await this.buildSpceInput(companyId, inputOverride);
        const result = (0, safety_program_compliance_engine_1.evaluateSafetyProgramCompliance)(input);
        const run = await this.prisma.veraAssessmentRun.create({
            data: {
                engine: client_1.VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE,
                companyId,
                overallScore: result.overallScore,
                overallStatus: result.overallStatus,
                resultJson: result,
                createdByUserId,
            },
        });
        await this.auditLog.logAudit({ id: createdByUserId !== null && createdByUserId !== void 0 ? createdByUserId : null, companyId }, audit_actions_1.AuditAction.ASSESSMENT_SPCE_RUN, {
            type: audit_actions_1.AuditEntityType.VERA_ASSESSMENT_RUN,
            id: run.id,
            tenantId: companyId,
        }, {
            overallScore: result.overallScore,
            overallStatus: result.overallStatus,
        });
        return { runId: run.id, result };
    }
    async runSmartGapAnalysis(companyId, hiringClientId, createdByUserId, projectId) {
        var _a;
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const spceInput = await this.buildSpceInput(companyId);
        const spce = (0, safety_program_compliance_engine_1.evaluateSafetyProgramCompliance)(spceInput);
        await this.prisma.veraAssessmentRun.create({
            data: {
                engine: client_1.VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE,
                companyId,
                overallScore: spce.overallScore,
                overallStatus: spce.overallStatus,
                resultJson: spce,
                createdByUserId,
            },
        });
        const workerIds = await this.resolveWorkerIds(companyId, projectId);
        const taeResults = [];
        for (const wid of workerIds.slice(0, 50)) {
            const { result } = await this.trainingRunner.evaluateAndPersist(wid, createdByUserId, projectId ? { projectId } : undefined);
            taeResults.push(result);
        }
        const fieldDataSummary = await this.buildFieldDataSummary(companyId, projectId);
        const sgaResult = (0, smart_gap_analysis_engine_1.evaluateSmartGapAnalysis)({
            context: {
                jurisdiction: (_a = company.province) !== null && _a !== void 0 ? _a : undefined,
                dateNow: new Date().toISOString(),
            },
            company: { id: String(companyId), name: company.name },
            hiringClient: { id: String(hiringClientId), name: company.name },
            spceResults: spce,
            taeResults,
            fieldDataSummary,
        });
        const run = await this.prisma.veraAssessmentRun.create({
            data: {
                engine: client_1.VeraAssessmentEngine.SMART_GAP_ANALYSIS,
                companyId,
                projectId,
                hiringClientId,
                overallScore: sgaResult.overallGapScore,
                overallStatus: sgaResult.overallStatus,
                resultJson: sgaResult,
                createdByUserId,
            },
        });
        await this.auditLog.logAudit({ id: createdByUserId !== null && createdByUserId !== void 0 ? createdByUserId : null, companyId }, audit_actions_1.AuditAction.ASSESSMENT_SGAE_RUN, {
            type: audit_actions_1.AuditEntityType.VERA_ASSESSMENT_RUN,
            id: run.id,
            tenantId: companyId,
        }, {
            projectId,
            hiringClientId,
            overallScore: sgaResult.overallGapScore,
            overallStatus: sgaResult.overallStatus,
        });
        return { runId: run.id, result: sgaResult };
    }
    async getLatestByEngine(engine, filters) {
        return this.prisma.veraAssessmentRun.findFirst({
            where: Object.assign(Object.assign(Object.assign({ engine }, (filters.companyId ? { companyId: filters.companyId } : {})), (filters.workerId ? { workerId: filters.workerId } : {})), (filters.projectId ? { projectId: filters.projectId } : {})),
            orderBy: { evaluatedAt: 'desc' },
        });
    }
    async listHistoryByEngine(engine, filters, limit = 6) {
        const rows = await this.prisma.veraAssessmentRun.findMany({
            where: Object.assign({ engine, companyId: filters.companyId }, (filters.projectId ? { projectId: filters.projectId } : {})),
            orderBy: { evaluatedAt: 'desc' },
            take: Math.min(Math.max(limit, 2), 24),
            select: {
                id: true,
                overallScore: true,
                overallStatus: true,
                evaluatedAt: true,
            },
        });
        return rows.reverse();
    }
    async resolveWorkerIds(companyId, projectId) {
        if (projectId) {
            const rows = await this.prisma.projectAssignment.findMany({
                where: { projectId, companyId, status: 'ACTIVE' },
                select: { workerId: true },
            });
            return rows.map((r) => r.workerId);
        }
        const links = await this.prisma.companyLink.findMany({
            where: { companyId, active: true },
            select: { workerId: true },
        });
        return links.map((l) => l.workerId);
    }
    async buildFieldDataSummary(companyId, projectId) {
        const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const since12mo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const projectFilter = projectId ? { projectId } : { companyId };
        const [jhaCount, flhaCount, inspectionCount, incidentCount, highSeverity, openCapa, overdueCapa, workerCount,] = await Promise.all([
            this.prisma.jhaFlha.count({
                where: Object.assign(Object.assign({}, projectFilter), { kind: 'JHA', createdAt: { gte: since90 } }),
            }),
            this.prisma.jhaFlha.count({
                where: Object.assign(Object.assign({}, projectFilter), { kind: 'FLHA', createdAt: { gte: since90 } }),
            }),
            this.prisma.pmInspection.count({
                where: Object.assign(Object.assign({}, projectFilter), { deletedAt: null, createdAt: { gte: since90 } }),
            }),
            this.prisma.pmSafetyEvent.count({
                where: Object.assign(Object.assign({}, projectFilter), { deletedAt: null, occurredAt: { gte: since90 } }),
            }),
            this.prisma.pmSafetyEvent.count({
                where: Object.assign(Object.assign({}, projectFilter), { deletedAt: null, occurredAt: { gte: since12mo }, severity: { in: ['high', 'critical'] } }),
            }),
            this.prisma.pmCorrectiveAction.count({
                where: Object.assign(Object.assign({}, projectFilter), { deletedAt: null, status: { in: ['open', 'assigned', 'in_progress'] } }),
            }),
            this.prisma.pmCorrectiveAction.count({
                where: Object.assign(Object.assign({}, projectFilter), { deletedAt: null, status: { in: ['open', 'assigned', 'in_progress'] }, dueAt: { lt: new Date() } }),
            }),
            projectId
                ? this.prisma.projectAssignment.count({
                    where: { projectId, status: 'ACTIVE' },
                })
                : this.prisma.companyLink.count({
                    where: { companyId, active: true },
                }),
        ]);
        return {
            jhaCountLast90Days: jhaCount,
            flhaCountLast90Days: flhaCount,
            inspectionCountLast90Days: inspectionCount,
            incidentCountLast90Days: incidentCount,
            highSeverityIncidentsLast12Months: highSeverity,
            openCorrectiveActions: openCapa,
            overdueCorrectiveActions: overdueCapa,
            workerCount,
        };
    }
};
exports.AssessmentEnginesService = AssessmentEnginesService;
exports.AssessmentEnginesService = AssessmentEnginesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        training_assessment_runner_service_1.TrainingAssessmentRunnerService,
        audit_log_service_1.AuditLogService])
], AssessmentEnginesService);
//# sourceMappingURL=assessment-engines.service.js.map