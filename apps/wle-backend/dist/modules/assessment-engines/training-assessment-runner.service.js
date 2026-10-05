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
exports.TrainingAssessmentRunnerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const training_assessment_engine_1 = require("../training-assessment/training-assessment.engine");
const assessment_engines_utils_1 = require("./assessment-engines.utils");
const audit_log_service_1 = require("../../audit/audit-log.service");
const audit_actions_1 = require("../../audit/audit-actions");
let TrainingAssessmentRunnerService = class TrainingAssessmentRunnerService {
    constructor(prisma, auditLog) {
        this.prisma = prisma;
        this.auditLog = auditLog;
    }
    async buildInput(workerId, options) {
        var _a, _b, _c, _d, _e, _f;
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                company: {
                    include: { trainingRequirements: true },
                },
                trainingRecords: {
                    include: {
                        certification: true,
                        trainingProvider: true,
                    },
                    orderBy: { issuedAt: 'desc' },
                },
                projectAssignments: {
                    where: { status: 'ACTIVE' },
                    take: 1,
                },
            },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const companyId = worker.companyId;
        const hiringClientRequirements = ((_b = (_a = worker.company) === null || _a === void 0 ? void 0 : _a.trainingRequirements) !== null && _b !== void 0 ? _b : []).map((req, i) => {
            var _a;
            return ({
                id: `HCR-${(_a = req.id) !== null && _a !== void 0 ? _a : i + 1}`,
                name: req.courseName,
                code: (0, assessment_engines_utils_1.courseCodeFromName)(req.courseName),
                minLevel: 'Awareness',
                validityDays: req.expiresInDays,
                approvedProviders: [],
                evidenceTypes: ['ticket', 'lms'],
            });
        });
        let projectRequirements = [];
        const projectId = options === null || options === void 0 ? void 0 : options.projectId;
        const resolvedProjectId = projectId !== null && projectId !== void 0 ? projectId : (_c = worker.projectAssignments[0]) === null || _c === void 0 ? void 0 : _c.projectId;
        if (resolvedProjectId) {
            const profile = await this.prisma.pmProjectSafetyProfile.findFirst({
                where: { projectId: resolvedProjectId, deletedAt: null },
            });
            const codes = Array.isArray(profile === null || profile === void 0 ? void 0 : profile.requiredTraining)
                ? profile.requiredTraining
                : [];
            projectRequirements = codes.map((code, i) => ({
                id: `PR-${i + 1}`,
                name: code,
                code: (0, assessment_engines_utils_1.courseCodeFromName)(code),
                minLevel: 'Awareness',
                validityDays: 365,
                approvedProviders: [],
                evidenceTypes: ['lms', 'signoff'],
            }));
        }
        const legislativeRequirements = hiringClientRequirements.slice(0, 3).map((r, i) => {
            var _a, _b;
            return (Object.assign(Object.assign({}, r), { id: `LEG-${i + 1}`, jurisdiction: (_b = (_a = worker.company) === null || _a === void 0 ? void 0 : _a.province) !== null && _b !== void 0 ? _b : undefined }));
        });
        const trainingRecords = worker.trainingRecords.map((r) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            return ({
                id: String(r.id),
                workerId: String(workerId),
                courseCode: (_a = r.certification.code) !== null && _a !== void 0 ? _a : (0, assessment_engines_utils_1.courseCodeFromName)(r.certification.name),
                courseName: r.certification.name,
                provider: (_c = (_b = r.trainingProvider) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : null,
                level: (0, assessment_engines_utils_1.inferCompetencyLevel)(undefined),
                completedAt: (_f = (_e = ((_d = r.completedAt) !== null && _d !== void 0 ? _d : r.issuedAt)) === null || _e === void 0 ? void 0 : _e.toISOString()) !== null && _f !== void 0 ? _f : null,
                expiresAt: (_h = (_g = r.expiresAt) === null || _g === void 0 ? void 0 : _g.toISOString()) !== null && _h !== void 0 ? _h : null,
                evidenceFiles: r.certificateUrl || r.certificateNumber
                    ? [
                        {
                            fileId: String(r.id),
                            fileName: (_j = r.certificateNumber) !== null && _j !== void 0 ? _j : 'certificate',
                        },
                    ]
                    : [],
                verificationStatus: r.certificateSignedAt
                    ? 'Verified'
                    : r.completedAt
                        ? 'Pending'
                        : undefined,
            });
        });
        return {
            context: {
                jurisdiction: (_e = (_d = worker.company) === null || _d === void 0 ? void 0 : _d.province) !== null && _e !== void 0 ? _e : undefined,
                dateNow: (_f = options === null || options === void 0 ? void 0 : options.dateNow) !== null && _f !== void 0 ? _f : new Date().toISOString(),
            },
            hiringClientRequirements,
            projectRequirements,
            legislativeRequirements,
            worker: {
                id: String(workerId),
                name: `${worker.firstName} ${worker.lastName}`,
                role: undefined,
                companyId: companyId ? String(companyId) : undefined,
            },
            trainingRecords,
        };
    }
    async evaluateAndPersist(workerId, createdByUserId, options) {
        var _a, _b, _c, _d, _e;
        const input = await this.buildInput(workerId, options);
        const result = (0, training_assessment_engine_1.evaluateTrainingAssessment)(input);
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            select: {
                companyId: true,
                projectAssignments: {
                    where: { status: 'ACTIVE' },
                    take: 1,
                    select: { projectId: true },
                },
            },
        });
        const resolvedProjectId = (_a = options === null || options === void 0 ? void 0 : options.projectId) !== null && _a !== void 0 ? _a : (_b = worker === null || worker === void 0 ? void 0 : worker.projectAssignments[0]) === null || _b === void 0 ? void 0 : _b.projectId;
        const run = await this.prisma.veraAssessmentRun.create({
            data: {
                engine: 'TRAINING_ASSESSMENT',
                workerId,
                companyId: (_c = worker === null || worker === void 0 ? void 0 : worker.companyId) !== null && _c !== void 0 ? _c : undefined,
                projectId: resolvedProjectId,
                overallScore: result.overallScore,
                overallStatus: result.overallStatus,
                resultJson: result,
                createdByUserId,
            },
        });
        await this.auditLog.logAudit({ id: createdByUserId !== null && createdByUserId !== void 0 ? createdByUserId : null, companyId: (_d = worker === null || worker === void 0 ? void 0 : worker.companyId) !== null && _d !== void 0 ? _d : null }, audit_actions_1.AuditAction.ASSESSMENT_TAE_RUN, {
            type: audit_actions_1.AuditEntityType.VERA_ASSESSMENT_RUN,
            id: run.id,
            tenantId: worker === null || worker === void 0 ? void 0 : worker.companyId,
        }, {
            workerId,
            overallScore: result.overallScore,
            overallStatus: result.overallStatus,
        });
        const profile = await this.prisma.pmWorkerSafetyProfile.findUnique({
            where: { workerId },
        });
        if (profile) {
            const meta = (_e = profile.metadataJson) !== null && _e !== void 0 ? _e : {};
            await this.prisma.pmWorkerSafetyProfile.update({
                where: { id: profile.id },
                data: {
                    metadataJson: Object.assign(Object.assign({}, meta), { lastTrainingAssessment: {
                            runId: run.id,
                            overallScore: result.overallScore,
                            overallStatus: result.overallStatus,
                            evaluatedAt: run.evaluatedAt.toISOString(),
                            correctiveActionCount: result.correctiveActions.length,
                        } }),
                    requiresSupervisorReview: result.overallStatus === 'NonCompliant' ||
                        result.correctiveActions.some((a) => a.blockingForSiteAccess),
                },
            });
        }
        return { runId: run.id, result };
    }
    async getLatest(workerId) {
        return this.prisma.veraAssessmentRun.findFirst({
            where: { engine: 'TRAINING_ASSESSMENT', workerId },
            orderBy: { evaluatedAt: 'desc' },
        });
    }
};
exports.TrainingAssessmentRunnerService = TrainingAssessmentRunnerService;
exports.TrainingAssessmentRunnerService = TrainingAssessmentRunnerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], TrainingAssessmentRunnerService);
//# sourceMappingURL=training-assessment-runner.service.js.map