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
exports.CoreReadinessService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const verification_service_1 = require("../../verification/verification.service");
const dashboard_widgets_service_1 = require("../dashboard-widgets/dashboard-widgets.service");
const reporting_core_service_1 = require("../reporting-core/reporting-core.service");
const training_assessment_runner_service_1 = require("../assessment-engines/training-assessment-runner.service");
const assessment_engines_service_1 = require("../assessment-engines/assessment-engines.service");
const safety_knowledge_service_1 = require("../safety-knowledge/safety-knowledge.service");
const fit_test_service_1 = require("../fit-test/fit-test.service");
const acp_access_service_1 = require("../../acp/acp-access.service");
const fit_test_engine_1 = require("../fit-test/fit-test.engine");
const readiness_scoring_1 = require("./readiness-scoring");
let CoreReadinessService = class CoreReadinessService {
    constructor(reporting, widgets, verification, prisma, trainingAssessment, assessmentEngines, safetyKnowledge, fitTests, acpAccess) {
        this.reporting = reporting;
        this.widgets = widgets;
        this.verification = verification;
        this.prisma = prisma;
        this.trainingAssessment = trainingAssessment;
        this.assessmentEngines = assessmentEngines;
        this.safetyKnowledge = safetyKnowledge;
        this.fitTests = fitTests;
        this.acpAccess = acpAccess;
    }
    async summary(companyId, userId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20;
        const [overview, bundle] = await Promise.all([
            this.reporting.overview(companyId),
            this.widgets.getBundle({
                companyId,
                includeWorkerCompliance: true,
                includeEquipmentCompliance: true,
                includeTrainingExpiry: true,
                includeProjectReadiness: true,
            }),
        ]);
        const worker = bundle.workerCompliance;
        const equipment = bundle.equipmentCompliance;
        const training = (_a = bundle.trainingExpiry) !== null && _a !== void 0 ? _a : null;
        let companyAssessments = null;
        let fitTests = null;
        let workerAssessments = null;
        let competency = null;
        let predictiveSafety = null;
        if (companyId) {
            const [spce, sga, fitSummary, taeRollup, skeRollup, competencySummary, predictiveAllowed,] = await Promise.all([
                this.assessmentEngines.getLatestByEngine(client_1.VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE, { companyId }),
                this.assessmentEngines.getLatestByEngine(client_1.VeraAssessmentEngine.SMART_GAP_ANALYSIS, { companyId }),
                this.fitTests.companySummary(companyId),
                this.rollupWorkerAssessmentEngine(companyId, client_1.VeraAssessmentEngine.TRAINING_ASSESSMENT),
                this.rollupWorkerAssessmentEngine(companyId, client_1.VeraAssessmentEngine.SAFETY_KNOWLEDGE),
                this.companyCompetencySummary(companyId),
                userId ? this.isPredictiveTierAllowed(userId) : Promise.resolve(false),
            ]);
            companyAssessments = {
                spce: spce
                    ? {
                        overallScore: spce.overallScore,
                        overallStatus: spce.overallStatus,
                        evaluatedAt: spce.evaluatedAt.toISOString(),
                        state: (0, readiness_scoring_1.assessmentStatusToVisualState)(spce.overallStatus, spce.overallScore),
                    }
                    : null,
                smartGap: sga
                    ? {
                        overallScore: sga.overallScore,
                        overallStatus: sga.overallStatus,
                        evaluatedAt: sga.evaluatedAt.toISOString(),
                        state: (0, readiness_scoring_1.assessmentStatusToVisualState)(sga.overallStatus, sga.overallScore),
                    }
                    : null,
            };
            fitTests = Object.assign(Object.assign({}, fitSummary), { state: (0, readiness_scoring_1.fitTestRateToVisualState)(fitSummary) });
            workerAssessments = {
                trainingAssessment: taeRollup,
                safetyKnowledge: skeRollup,
            };
            competency = competencySummary;
            if (predictiveAllowed) {
                predictiveSafety = await this.predictiveSafetySummary(companyId);
            }
            else {
                predictiveSafety = {
                    tierAllowed: false,
                    overallRiskIndex: null,
                    overallRiskLevel: null,
                    highRiskWorkers: 0,
                    highRiskTasks: 0,
                    weekStart: null,
                    state: null,
                };
            }
        }
        const workerState = (0, readiness_scoring_1.complianceRateToVisualState)((_e = (_b = worker === null || worker === void 0 ? void 0 : worker.complianceRate) !== null && _b !== void 0 ? _b : (_d = (_c = overview.workers) === null || _c === void 0 ? void 0 : _c.summary) === null || _d === void 0 ? void 0 : _d.complianceRate) !== null && _e !== void 0 ? _e : 0, (_f = worker === null || worker === void 0 ? void 0 : worker.nonCompliant) !== null && _f !== void 0 ? _f : 0);
        const equipmentState = (0, readiness_scoring_1.complianceRateToVisualState)((_g = equipment === null || equipment === void 0 ? void 0 : equipment.complianceRate) !== null && _g !== void 0 ? _g : 0, (_h = equipment === null || equipment === void 0 ? void 0 : equipment.nonCompliant) !== null && _h !== void 0 ? _h : 0, (_j = equipment === null || equipment === void 0 ? void 0 : equipment.lockedOut) !== null && _j !== void 0 ? _j : 0);
        const trainingScore = training ? (0, readiness_scoring_1.trainingExpiryScore)(training) : null;
        const trainingState = training
            ? (0, readiness_scoring_1.trainingExpiryToVisualState)(training)
            : null;
        const dimensions = this.buildCompanyDimensions({
            workers: {
                score: (_o = (_k = worker === null || worker === void 0 ? void 0 : worker.complianceRate) !== null && _k !== void 0 ? _k : (_m = (_l = overview.workers) === null || _l === void 0 ? void 0 : _l.summary) === null || _m === void 0 ? void 0 : _m.complianceRate) !== null && _o !== void 0 ? _o : 0,
                state: workerState,
                metrics: {
                    total: (_p = worker === null || worker === void 0 ? void 0 : worker.totalWorkers) !== null && _p !== void 0 ? _p : 0,
                    compliant: (_q = worker === null || worker === void 0 ? void 0 : worker.compliant) !== null && _q !== void 0 ? _q : 0,
                    nonCompliant: (_r = worker === null || worker === void 0 ? void 0 : worker.nonCompliant) !== null && _r !== void 0 ? _r : 0,
                    expiringSoon: (_s = worker === null || worker === void 0 ? void 0 : worker.expiringSoon) !== null && _s !== void 0 ? _s : 0,
                },
            },
            equipment: {
                score: (_t = equipment === null || equipment === void 0 ? void 0 : equipment.complianceRate) !== null && _t !== void 0 ? _t : 0,
                state: equipmentState,
                metrics: {
                    total: (_u = equipment === null || equipment === void 0 ? void 0 : equipment.total) !== null && _u !== void 0 ? _u : 0,
                    compliant: (_v = equipment === null || equipment === void 0 ? void 0 : equipment.compliant) !== null && _v !== void 0 ? _v : 0,
                    nonCompliant: (_w = equipment === null || equipment === void 0 ? void 0 : equipment.nonCompliant) !== null && _w !== void 0 ? _w : 0,
                    overdueInspection: (_x = equipment === null || equipment === void 0 ? void 0 : equipment.overdueInspection) !== null && _x !== void 0 ? _x : 0,
                },
            },
            training: training
                ? {
                    score: trainingScore,
                    state: trainingState,
                    metrics: {
                        expired: training.expired,
                        expiring30: training.expiring30,
                        highRisk: training.highRisk,
                        gaps: training.gaps,
                    },
                }
                : null,
            fitTests,
            workerAssessments,
            companyAssessments,
            competency,
            predictiveSafety,
        });
        return {
            generatedAt: new Date().toISOString(),
            companyId: companyId !== null && companyId !== void 0 ? companyId : null,
            dimensions,
            companyAssessments,
            workerAssessments,
            competency,
            predictiveSafety,
            fitTests,
            workers: {
                totalWorkers: (_1 = (_y = worker === null || worker === void 0 ? void 0 : worker.totalWorkers) !== null && _y !== void 0 ? _y : (_0 = (_z = overview.workers) === null || _z === void 0 ? void 0 : _z.summary) === null || _0 === void 0 ? void 0 : _0.totalWorkers) !== null && _1 !== void 0 ? _1 : 0,
                compliant: (_2 = worker === null || worker === void 0 ? void 0 : worker.compliant) !== null && _2 !== void 0 ? _2 : 0,
                nonCompliant: (_3 = worker === null || worker === void 0 ? void 0 : worker.nonCompliant) !== null && _3 !== void 0 ? _3 : 0,
                expiringSoon: (_4 = worker === null || worker === void 0 ? void 0 : worker.expiringSoon) !== null && _4 !== void 0 ? _4 : 0,
                complianceRate: (_8 = (_5 = worker === null || worker === void 0 ? void 0 : worker.complianceRate) !== null && _5 !== void 0 ? _5 : (_7 = (_6 = overview.workers) === null || _6 === void 0 ? void 0 : _6.summary) === null || _7 === void 0 ? void 0 : _7.complianceRate) !== null && _8 !== void 0 ? _8 : 0,
                topIssues: (_9 = worker === null || worker === void 0 ? void 0 : worker.topIssues) !== null && _9 !== void 0 ? _9 : [],
                score: (_10 = worker === null || worker === void 0 ? void 0 : worker.complianceRate) !== null && _10 !== void 0 ? _10 : 0,
                state: workerState,
            },
            equipment: {
                total: (_14 = (_11 = equipment === null || equipment === void 0 ? void 0 : equipment.total) !== null && _11 !== void 0 ? _11 : (_13 = (_12 = overview.equipment) === null || _12 === void 0 ? void 0 : _12.summary) === null || _13 === void 0 ? void 0 : _13.total) !== null && _14 !== void 0 ? _14 : 0,
                compliant: (_15 = equipment === null || equipment === void 0 ? void 0 : equipment.compliant) !== null && _15 !== void 0 ? _15 : 0,
                nonCompliant: (_16 = equipment === null || equipment === void 0 ? void 0 : equipment.nonCompliant) !== null && _16 !== void 0 ? _16 : 0,
                overdueInspection: (_17 = equipment === null || equipment === void 0 ? void 0 : equipment.overdueInspection) !== null && _17 !== void 0 ? _17 : 0,
                complianceRate: (_18 = equipment === null || equipment === void 0 ? void 0 : equipment.complianceRate) !== null && _18 !== void 0 ? _18 : 0,
                score: (_19 = equipment === null || equipment === void 0 ? void 0 : equipment.complianceRate) !== null && _19 !== void 0 ? _19 : 0,
                state: equipmentState,
            },
            training: training
                ? Object.assign(Object.assign({}, training), { score: trainingScore, state: trainingState }) : null,
            projects: (_20 = bundle.projectReadiness) !== null && _20 !== void 0 ? _20 : null,
            overview,
        };
    }
    async workerScore(workerId) {
        var _a, _b;
        const worker = await this.prisma.worker.findUnique({
            where: { id: workerId },
            select: { id: true, firstName: true, lastName: true, companyId: true },
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const compliance = await this.verification.evaluateWorkerCompliance(workerId);
        const now = new Date();
        const d30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const [records, latestTae, latestSk, latestFit, competencyRows] = await Promise.all([
            this.prisma.trainingRecord.findMany({
                where: { workerId },
                include: { certification: true },
                orderBy: { expiresAt: 'asc' },
            }),
            this.trainingAssessment.getLatest(workerId),
            this.safetyKnowledge.getLatest(workerId),
            this.prisma.fitTestRun.findFirst({
                where: { workerId },
                orderBy: { performedAt: 'desc' },
            }),
            this.prisma.competencyEvaluation.findMany({
                where: { workerId },
                orderBy: { evaluationDate: 'desc' },
                take: 50,
            }),
        ]);
        const expired = records.filter((r) => r.expiresAt && r.expiresAt <= now).length;
        const expiring30 = records.filter((r) => r.expiresAt && r.expiresAt > now && r.expiresAt <= d30).length;
        const blocking = compliance.issues.filter((i) => i.type === 'MISSING' ||
            i.type === 'EXPIRED' ||
            i.type === 'NO_DOCUMENT').length;
        const score = Math.min(100, compliance.isCompliant
            ? Math.max(70, 100 - compliance.issues.length * 5)
            : Math.max(0, 60 - blocking * 15 - compliance.issues.length * 5));
        const trainingState = (0, readiness_scoring_1.trainingExpiryToVisualState)({
            expired,
            highRisk: expired,
            gaps: blocking,
        });
        let trainingAssessmentSummary = null;
        if (latestTae) {
            trainingAssessmentSummary = {
                runId: latestTae.id,
                overallScore: latestTae.overallScore,
                overallStatus: latestTae.overallStatus,
                evaluatedAt: latestTae.evaluatedAt.toISOString(),
                state: (0, readiness_scoring_1.assessmentStatusToVisualState)(latestTae.overallStatus, latestTae.overallScore),
            };
        }
        let safetyKnowledgeSummary = null;
        if (latestSk) {
            safetyKnowledgeSummary = {
                overallScore: latestSk.overallScore,
                overallStatus: latestSk.overallStatus,
                evaluatedAt: latestSk.evaluatedAt.toISOString(),
                state: (0, readiness_scoring_1.assessmentStatusToVisualState)(latestSk.overallStatus, latestSk.overallScore),
            };
        }
        let fitTestSummary = null;
        if (latestFit) {
            const ev = (0, fit_test_engine_1.evaluateFitTest)({
                result: latestFit.result,
                performedAt: latestFit.performedAt,
                expiresAt: latestFit.expiresAt,
            });
            const state = ev.pass
                ? ev.expiringSoon
                    ? 'AT_RISK'
                    : 'OK'
                : ev.statusLabel === 'FAIL'
                    ? 'NON_COMPLIANT'
                    : 'AT_RISK';
            fitTestSummary = {
                pass: ev.pass,
                statusLabel: ev.statusLabel,
                result: latestFit.result,
                performedAt: latestFit.performedAt.toISOString(),
                expiresAt: (_b = (_a = ev.expiresAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null,
                expired: ev.expired,
                expiringSoon: ev.expiringSoon,
                state,
            };
        }
        const latestCompetencyByEquipment = new Map();
        for (const row of competencyRows) {
            if (!latestCompetencyByEquipment.has(row.equipmentId)) {
                latestCompetencyByEquipment.set(row.equipmentId, row);
            }
        }
        const competencyEvals = [...latestCompetencyByEquipment.values()];
        const competencyCurrent = competencyEvals.filter((row) => row.passed && (!row.expiresAt || row.expiresAt > now)).length;
        const competencyExpired = competencyEvals.filter((row) => row.passed && row.expiresAt && row.expiresAt <= now).length;
        const competencyFailed = competencyEvals.filter((row) => !row.passed).length;
        const competencyTotal = competencyEvals.length;
        const competencyRate = competencyTotal > 0
            ? Math.round((competencyCurrent / competencyTotal) * 100)
            : 0;
        const competencySummary = {
            total: competencyTotal,
            current: competencyCurrent,
            expired: competencyExpired,
            failed: competencyFailed,
            complianceRate: competencyRate,
            state: (0, readiness_scoring_1.competencyRollupToVisualState)({
                total: competencyTotal,
                current: competencyCurrent,
                expired: competencyExpired,
                failed: competencyFailed,
                missing: 0,
            }),
        };
        const dimensions = [
            {
                key: 'compliance',
                label: 'Verification compliance',
                score,
                state: (0, readiness_scoring_1.scoreToVisualState)(score, { criticalCount: blocking }),
                metrics: { issues: compliance.issues.length, blocking },
            },
            {
                key: 'training',
                label: 'Training records',
                score: (0, readiness_scoring_1.trainingExpiryScore)({
                    expired,
                    expiring30,
                    highRisk: expired,
                    gaps: blocking,
                }),
                state: trainingState,
                metrics: { total: records.length, expired, expiring30 },
            },
        ];
        if (trainingAssessmentSummary) {
            dimensions.push({
                key: 'tae',
                label: 'Training Assessment (TAE)',
                score: trainingAssessmentSummary.overallScore,
                state: trainingAssessmentSummary.state,
                metrics: {},
                evaluatedAt: trainingAssessmentSummary.evaluatedAt,
            });
        }
        if (safetyKnowledgeSummary) {
            dimensions.push({
                key: 'ske',
                label: 'Safety Knowledge (SKE)',
                score: safetyKnowledgeSummary.overallScore,
                state: safetyKnowledgeSummary.state,
                metrics: {},
                evaluatedAt: safetyKnowledgeSummary.evaluatedAt,
            });
        }
        if (fitTestSummary) {
            dimensions.push({
                key: 'fit_test',
                label: 'Fit test',
                score: fitTestSummary.pass
                    ? fitTestSummary.expiringSoon
                        ? 75
                        : 100
                    : 0,
                state: fitTestSummary.state,
                metrics: {},
                evaluatedAt: fitTestSummary.performedAt,
            });
        }
        if (competencyTotal > 0) {
            dimensions.push({
                key: 'competency',
                label: 'Equipment competency',
                score: competencyRate,
                state: competencySummary.state,
                metrics: {
                    current: competencyCurrent,
                    expired: competencyExpired,
                    failed: competencyFailed,
                },
            });
        }
        return {
            workerId,
            worker,
            isCompliant: compliance.isCompliant,
            score,
            state: (0, readiness_scoring_1.scoreToVisualState)(score, { criticalCount: blocking }),
            issues: compliance.issues,
            dimensions,
            trainingAssessment: trainingAssessmentSummary,
            safetyKnowledge: safetyKnowledgeSummary,
            fitTest: fitTestSummary,
            competency: competencySummary,
            training: {
                total: records.length,
                expired,
                expiring30,
                state: trainingState,
                records: records.slice(0, 25).map((r) => {
                    var _a, _b, _c, _d, _e, _f;
                    return ({
                        id: r.id,
                        certification: (_b = (_a = r.certification) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : r.certificationId,
                        issuedAt: (_d = (_c = r.issuedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
                        expiresAt: (_f = (_e = r.expiresAt) === null || _e === void 0 ? void 0 : _e.toISOString()) !== null && _f !== void 0 ? _f : null,
                        status: r.expiresAt && r.expiresAt <= now ? 'EXPIRED' : 'ACTIVE',
                    });
                }),
            },
        };
    }
    async equipmentScore(equipmentId) {
        var _a, _b;
        const equipment = await this.prisma.equipment.findUnique({
            where: { id: equipmentId },
            include: {
                equipmentLinks: {
                    where: { active: true },
                    orderBy: { startDate: 'desc' },
                },
                inspections: { orderBy: { completedAt: 'desc' }, take: 10 },
                trainingRequirements: { include: { certification: true } },
            },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipment not found');
        const link = equipment.equipmentLinks[0];
        const status = (_a = link === null || link === void 0 ? void 0 : link.complianceStatus) !== null && _a !== void 0 ? _a : 'UNKNOWN';
        const scoreMap = {
            COMPLIANT: 100,
            AT_RISK: 65,
            NON_COMPLIANT: 25,
            LOCKED_OUT: 0,
        };
        const score = (_b = scoreMap[status]) !== null && _b !== void 0 ? _b : 50;
        const state = status === 'COMPLIANT'
            ? 'OK'
            : status === 'NEEDS_ATTENTION'
                ? 'AT_RISK'
                : 'NON_COMPLIANT';
        const now = new Date();
        const overdueInspection = equipment.inspections.filter((i) => i.nextInspectionDate && i.nextInspectionDate < now && !i.completedAt).length;
        return {
            equipmentId,
            equipment: {
                id: equipment.id,
                name: equipment.name,
                serialNumber: equipment.serialNumber,
                assetTag: equipment.assetTag,
            },
            complianceStatus: status,
            score,
            state,
            overdueInspection,
            inspections: equipment.inspections.map((i) => {
                var _a, _b, _c, _d;
                return ({
                    id: i.id,
                    status: i.status,
                    completedAt: (_b = (_a = i.completedAt) === null || _a === void 0 ? void 0 : _a.toISOString()) !== null && _b !== void 0 ? _b : null,
                    nextInspectionDate: (_d = (_c = i.nextInspectionDate) === null || _c === void 0 ? void 0 : _c.toISOString()) !== null && _d !== void 0 ? _d : null,
                });
            }),
            trainingRequirements: equipment.trainingRequirements.map((t) => {
                var _a, _b;
                return ({
                    certification: (_b = (_a = t.certification) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : t.certificationId,
                    certificationId: t.certificationId,
                });
            }),
        };
    }
    async companyWorkerIds(companyId) {
        const links = await this.prisma.companyLink.findMany({
            where: { companyId, active: true },
            select: { workerId: true },
        });
        return links.map((l) => l.workerId);
    }
    async rollupWorkerAssessmentEngine(companyId, engine) {
        const workerIds = await this.companyWorkerIds(companyId);
        if (!workerIds.length)
            return null;
        const runs = await this.prisma.veraAssessmentRun.findMany({
            where: { workerId: { in: workerIds }, engine },
            orderBy: { evaluatedAt: 'desc' },
        });
        const latestByWorker = new Map();
        for (const run of runs) {
            if (run.workerId != null && !latestByWorker.has(run.workerId)) {
                latestByWorker.set(run.workerId, run);
            }
        }
        const evaluated = latestByWorker.size;
        const missing = workerIds.length - evaluated;
        let passing = 0;
        let atRisk = 0;
        let failing = 0;
        let scoreSum = 0;
        for (const run of latestByWorker.values()) {
            scoreSum += run.overallScore;
            const state = (0, readiness_scoring_1.assessmentStatusToVisualState)(run.overallStatus, run.overallScore);
            if (state === 'OK')
                passing += 1;
            else if (state === 'AT_RISK')
                atRisk += 1;
            else
                failing += 1;
        }
        const averageScore = evaluated > 0 ? Math.round(scoreSum / evaluated) : 0;
        const complianceRate = workerIds.length > 0 ? Math.round((passing / workerIds.length) * 100) : 0;
        return {
            evaluated,
            missing,
            passing,
            atRisk,
            failing,
            averageScore,
            complianceRate,
            state: (0, readiness_scoring_1.scoreToVisualState)(averageScore, {
                missingCount: missing,
                criticalCount: failing,
            }),
        };
    }
    async companyCompetencySummary(companyId) {
        const workerIds = await this.companyWorkerIds(companyId);
        const now = new Date();
        const evals = workerIds.length
            ? await this.prisma.competencyEvaluation.findMany({
                where: { workerId: { in: workerIds } },
                orderBy: { evaluationDate: 'desc' },
            })
            : [];
        const latestByPair = new Map();
        for (const row of evals) {
            const key = `${row.workerId}:${row.equipmentId}`;
            if (!latestByPair.has(key))
                latestByPair.set(key, row);
        }
        const latest = [...latestByPair.values()];
        let current = 0;
        let expired = 0;
        let failed = 0;
        for (const row of latest) {
            if (!row.passed)
                failed += 1;
            else if (row.expiresAt && row.expiresAt <= now)
                expired += 1;
            else
                current += 1;
        }
        const total = latest.length;
        const workerRate = total > 0 ? Math.round((current / total) * 100) : 0;
        const equipmentReport = await this.reporting.equipmentCompliance(companyId);
        const eq = equipmentReport.summary;
        return {
            worker: {
                total,
                current,
                expired,
                failed,
                missing: 0,
                complianceRate: workerRate,
                state: (0, readiness_scoring_1.competencyRollupToVisualState)({
                    total,
                    current,
                    expired,
                    failed,
                    missing: 0,
                }),
            },
            equipment: {
                total: eq.total,
                compliant: eq.compliant,
                nonCompliant: eq.nonCompliant,
                overdueInspection: eq.overdueInspection,
                complianceRate: eq.complianceRate,
                state: (0, readiness_scoring_1.complianceRateToVisualState)(eq.complianceRate, eq.nonCompliant, eq.lockedOut),
            },
        };
    }
    async isPredictiveTierAllowed(userId) {
        const result = await this.acpAccess.check({
            userId,
            feature: 'pm.predictive',
            minTier: 'predictive',
        });
        return Boolean(result.allowed);
    }
    async predictiveSafetySummary(companyId) {
        var _a, _b, _c;
        const weekStart = this.startOfWeek(new Date());
        const forecast = await this.prisma.pmPredictiveSafetyForecast.findFirst({
            where: { companyId, projectId: null, weekStart },
            orderBy: { createdAt: 'desc' },
        });
        if (!forecast) {
            return {
                tierAllowed: true,
                overallRiskIndex: null,
                overallRiskLevel: null,
                highRiskWorkers: 0,
                highRiskTasks: 0,
                weekStart: null,
                state: 'AT_RISK',
            };
        }
        const json = ((_a = forecast.forecastJson) !== null && _a !== void 0 ? _a : {});
        const highRiskWorkers = Number((_b = json.highRiskWorkers) !== null && _b !== void 0 ? _b : 0);
        const highRiskTasks = Number((_c = json.highRiskTasks) !== null && _c !== void 0 ? _c : 0);
        return {
            tierAllowed: true,
            overallRiskIndex: forecast.riskIndex,
            overallRiskLevel: forecast.riskLevel,
            highRiskWorkers,
            highRiskTasks,
            weekStart: forecast.weekStart.toISOString(),
            state: (0, readiness_scoring_1.predictiveRiskToVisualState)(forecast.riskLevel, forecast.riskIndex),
        };
    }
    startOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    buildCompanyDimensions(input) {
        var _a, _b, _c, _d, _e, _f;
        const rows = [
            {
                key: 'workers',
                label: 'Worker compliance',
                score: input.workers.score,
                state: input.workers.state,
                metrics: input.workers.metrics,
            },
            {
                key: 'equipment',
                label: 'Equipment compliance',
                score: input.equipment.score,
                state: input.equipment.state,
                metrics: input.equipment.metrics,
            },
        ];
        if (input.training) {
            rows.push({
                key: 'training_expiry',
                label: 'Training expiry',
                score: input.training.score,
                state: input.training.state,
                metrics: input.training.metrics,
            });
        }
        if ((_a = input.workerAssessments) === null || _a === void 0 ? void 0 : _a.trainingAssessment) {
            const tae = input.workerAssessments.trainingAssessment;
            rows.push({
                key: 'tae',
                label: 'Training Assessment (TAE)',
                score: tae.averageScore,
                state: tae.state,
                metrics: {
                    evaluated: tae.evaluated,
                    passing: tae.passing,
                    atRisk: tae.atRisk,
                    failing: tae.failing,
                    missing: tae.missing,
                },
            });
        }
        if ((_b = input.workerAssessments) === null || _b === void 0 ? void 0 : _b.safetyKnowledge) {
            const ske = input.workerAssessments.safetyKnowledge;
            rows.push({
                key: 'ske',
                label: 'Safety Knowledge (SKE)',
                score: ske.averageScore,
                state: ske.state,
                metrics: {
                    evaluated: ske.evaluated,
                    passing: ske.passing,
                    atRisk: ske.atRisk,
                    failing: ske.failing,
                    missing: ske.missing,
                },
            });
        }
        if (input.fitTests) {
            rows.push({
                key: 'fit_test',
                label: 'Fit test',
                score: input.fitTests.complianceRate,
                state: input.fitTests.state,
                metrics: {},
            });
        }
        if ((_c = input.companyAssessments) === null || _c === void 0 ? void 0 : _c.spce) {
            rows.push({
                key: 'spce',
                label: 'SPCE',
                score: input.companyAssessments.spce.overallScore,
                state: input.companyAssessments.spce.state,
                metrics: {},
                evaluatedAt: input.companyAssessments.spce.evaluatedAt,
            });
        }
        if ((_d = input.companyAssessments) === null || _d === void 0 ? void 0 : _d.smartGap) {
            rows.push({
                key: 'sga',
                label: 'Smart Gap Analysis',
                score: input.companyAssessments.smartGap.overallScore,
                state: input.companyAssessments.smartGap.state,
                metrics: {},
                evaluatedAt: input.companyAssessments.smartGap.evaluatedAt,
            });
        }
        if (input.competency) {
            rows.push({
                key: 'worker_competency',
                label: 'Worker competency',
                score: input.competency.worker.complianceRate,
                state: input.competency.worker.state,
                metrics: {},
            });
            rows.push({
                key: 'equipment_competency',
                label: 'Equipment competency',
                score: input.competency.equipment.complianceRate,
                state: input.competency.equipment.state,
                metrics: {},
            });
        }
        if (((_e = input.predictiveSafety) === null || _e === void 0 ? void 0 : _e.tierAllowed) && input.predictiveSafety.state) {
            rows.push({
                key: 'predictive_safety',
                label: 'Predictive safety',
                score: Math.max(0, 100 - ((_f = input.predictiveSafety.overallRiskIndex) !== null && _f !== void 0 ? _f : 0)),
                state: input.predictiveSafety.state,
                metrics: { highRiskWorkers: input.predictiveSafety.highRiskWorkers },
            });
        }
        return rows;
    }
};
exports.CoreReadinessService = CoreReadinessService;
exports.CoreReadinessService = CoreReadinessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reporting_core_service_1.ReportingCoreService,
        dashboard_widgets_service_1.DashboardWidgetsService,
        verification_service_1.VerificationService,
        prisma_service_1.PrismaService,
        training_assessment_runner_service_1.TrainingAssessmentRunnerService,
        assessment_engines_service_1.AssessmentEnginesService,
        safety_knowledge_service_1.SafetyKnowledgeService,
        fit_test_service_1.FitTestService,
        acp_access_service_1.AcpAccessService])
], CoreReadinessService);
//# sourceMappingURL=core-readiness.service.js.map