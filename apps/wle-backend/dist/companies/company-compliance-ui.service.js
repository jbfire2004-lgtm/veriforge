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
exports.CompanyComplianceUiService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const assessment_engines_service_1 = require("../modules/assessment-engines/assessment-engines.service");
const pm_company_safety_cail_intelligence_service_1 = require("../pm-company-safety-context/pm-company-safety-cail-intelligence.service");
const companies_service_1 = require("./companies.service");
const company_training_compliance_service_1 = require("./company-training-compliance.service");
function scoreToGrade(score) {
    if (score >= 90)
        return 'A';
    if (score >= 80)
        return 'B';
    if (score >= 70)
        return 'C';
    if (score >= 60)
        return 'D';
    return 'F';
}
function engineStatusFromScore(score) {
    if (score >= 80)
        return 'pass';
    if (score >= 60)
        return 'warning';
    return 'fail';
}
function overallFromSummary(input) {
    if (input.status === 'NON_COMPLIANT' ||
        input.expiredTraining > 0 ||
        input.expiredCredentials > 0 ||
        input.incidents > 0) {
        return input.expiredTraining + input.expiredCredentials + input.incidents >
            3
            ? 'non_compliant'
            : 'at_risk';
    }
    if (input.expiringTraining > 0)
        return 'at_risk';
    return 'compliant';
}
function trendFromHistory(points) {
    var _a, _b, _c, _d;
    if (points.length < 2)
        return 'stable';
    const latest = (_b = (_a = points[0]) === null || _a === void 0 ? void 0 : _a.overallScore) !== null && _b !== void 0 ? _b : 0;
    const previous = (_d = (_c = points[1]) === null || _c === void 0 ? void 0 : _c.overallScore) !== null && _d !== void 0 ? _d : latest;
    if (latest > previous + 2)
        return 'improving';
    if (latest < previous - 2)
        return 'declining';
    return 'stable';
}
let CompanyComplianceUiService = class CompanyComplianceUiService {
    constructor(companies, trainingCompliance, assessmentEngines, cail) {
        this.companies = companies;
        this.trainingCompliance = trainingCompliance;
        this.assessmentEngines = assessmentEngines;
        this.cail = cail;
    }
    async getComplianceOverview(companyId, actor) {
        var _a, _b;
        const [summary, trainingDash, spceRun, sgaRun, corporate] = await Promise.all([
            this.companies.complianceSummary(companyId, actor),
            this.trainingCompliance
                .getCompanyDashboard(companyId, actor)
                .catch(() => null),
            this.assessmentEngines
                .getLatestByEngine(client_1.VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE, {
                companyId,
            })
                .catch(() => null),
            this.assessmentEngines
                .getLatestByEngine(client_1.VeraAssessmentEngine.SMART_GAP_ANALYSIS, {
                companyId,
            })
                .catch(() => null),
            this.cail.generateCorporateSafetyScore(companyId).catch(() => null),
        ]);
        const engines = [];
        const trainingScore = trainingDash != null
            ? Math.max(0, 100 -
                trainingDash.flaggedWorkers.length * 8 -
                trainingDash.counts.rejected * 5 -
                trainingDash.counts.expiring * 2)
            : summary.expiredTrainingCount + summary.expiredCredentialsCount === 0
                ? 92
                : Math.max(20, 100 -
                    summary.expiredTrainingCount * 10 -
                    summary.expiredCredentialsCount * 10);
        engines.push({
            id: 'training-records',
            name: 'Training & credentials',
            status: engineStatusFromScore(trainingScore),
            score: Math.round(trainingScore),
            weight: 0.25,
            category: 'Training',
            details: `${summary.expiredTrainingCount} expired training · ${summary.expiredCredentialsCount} expired credentials`,
        });
        if (spceRun) {
            engines.push({
                id: 'safety-program',
                name: 'Safety program compliance (SPCE)',
                status: engineStatusFromScore(spceRun.overallScore),
                score: spceRun.overallScore,
                weight: 0.3,
                category: 'Safety program',
                details: spceRun.overallStatus,
            });
        }
        if (sgaRun) {
            engines.push({
                id: 'smart-gap',
                name: 'Smart gap analysis',
                status: engineStatusFromScore(sgaRun.overallScore),
                score: sgaRun.overallScore,
                weight: 0.2,
                category: 'Gap analysis',
                details: sgaRun.overallStatus,
            });
        }
        if (corporate) {
            engines.push({
                id: 'corporate-safety',
                name: 'Corporate safety score',
                status: engineStatusFromScore(corporate.score),
                score: corporate.score,
                weight: 0.25,
                category: 'Corporate safety',
                details: `Risk band ${corporate.band}`,
            });
        }
        const flags = [];
        const nowIso = new Date().toISOString();
        if (summary.expiredTrainingCount > 0) {
            flags.push({
                id: 'flag-expired-training',
                type: summary.expiredTrainingCount > 5 ? 'critical' : 'major',
                label: 'Expired training records',
                description: `${summary.expiredTrainingCount} worker training record(s) are past expiry.`,
                createdAt: nowIso,
            });
        }
        if (summary.expiredCredentialsCount > 0) {
            flags.push({
                id: 'flag-expired-credentials',
                type: 'major',
                label: 'Expired credentials',
                description: `${summary.expiredCredentialsCount} credential(s) require renewal.`,
                createdAt: nowIso,
            });
        }
        if (summary.workerIncidentsCount + summary.equipmentIncidentsCount > 0) {
            flags.push({
                id: 'flag-incidents',
                type: 'major',
                label: 'Open incidents',
                description: `${summary.workerIncidentsCount + summary.equipmentIncidentsCount} incident(s) on record.`,
                createdAt: nowIso,
            });
        }
        if (((_a = summary.expiringTrainingCount) !== null && _a !== void 0 ? _a : 0) > 0) {
            flags.push({
                id: 'flag-expiring-training',
                type: 'minor',
                label: 'Training expiring soon',
                description: `${summary.expiringTrainingCount} training record(s) expire within 30 days.`,
                createdAt: nowIso,
            });
        }
        const evaluatedAt = [
            spceRun === null || spceRun === void 0 ? void 0 : spceRun.evaluatedAt,
            sgaRun === null || sgaRun === void 0 ? void 0 : sgaRun.evaluatedAt,
            (corporate === null || corporate === void 0 ? void 0 : corporate.computedAt) ? new Date(corporate.computedAt) : null,
        ]
            .filter(Boolean)
            .sort((a, b) => b.getTime() - a.getTime())[0];
        return {
            companyId: String(companyId),
            overallStatus: overallFromSummary({
                status: summary.status,
                expiredTraining: summary.expiredTrainingCount,
                expiredCredentials: summary.expiredCredentialsCount,
                incidents: summary.workerIncidentsCount + summary.equipmentIncidentsCount,
                expiringTraining: (_b = summary.expiringTrainingCount) !== null && _b !== void 0 ? _b : 0,
            }),
            lastEvaluatedAt: (evaluatedAt !== null && evaluatedAt !== void 0 ? evaluatedAt : new Date()).toISOString(),
            engines,
            flags,
        };
    }
    async getCompanyScore(companyId, actor) {
        var _a, _b;
        const [corporate, spceRun, sgaRun, trainingDash, spceHistory] = await Promise.all([
            this.cail.generateCorporateSafetyScore(companyId).catch(() => null),
            this.assessmentEngines
                .getLatestByEngine(client_1.VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE, {
                companyId,
            })
                .catch(() => null),
            this.assessmentEngines
                .getLatestByEngine(client_1.VeraAssessmentEngine.SMART_GAP_ANALYSIS, {
                companyId,
            })
                .catch(() => null),
            this.trainingCompliance
                .getCompanyDashboard(companyId, actor)
                .catch(() => null),
            this.assessmentEngines
                .listHistoryByEngine(client_1.VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE, { companyId }, 4)
                .catch(() => []),
        ]);
        const breakdown = [];
        const trainingScore = trainingDash != null
            ? Math.max(0, 100 -
                trainingDash.flaggedWorkers.length * 8 -
                trainingDash.counts.rejected * 5)
            : 85;
        breakdown.push({
            id: 'training',
            label: 'Training verification',
            score: Math.round(trainingScore),
            weight: 0.2,
            category: 'Training',
            rationale: 'Worker training validation and expiry posture',
        });
        if (spceRun) {
            breakdown.push({
                id: 'spce',
                label: 'Safety program compliance',
                score: spceRun.overallScore,
                weight: 0.35,
                category: 'Safety program',
                rationale: spceRun.overallStatus,
            });
        }
        if (sgaRun) {
            breakdown.push({
                id: 'smart-gap',
                label: 'Smart gap analysis',
                score: sgaRun.overallScore,
                weight: 0.2,
                category: 'Gap analysis',
                rationale: sgaRun.overallStatus,
            });
        }
        if (corporate) {
            breakdown.push({
                id: 'corporate-safety',
                label: 'Corporate safety intelligence',
                score: corporate.score,
                weight: 0.25,
                category: 'Corporate safety',
                rationale: `Predicted risk ${corporate.predictedRisk}`,
            });
        }
        const weightSum = breakdown.reduce((s, b) => s + b.weight, 0) || 1;
        const isnStyleScore = Math.round(breakdown.reduce((s, b) => s + b.score * (b.weight / weightSum), 0));
        const historyPoints = spceHistory.map((h) => ({
            overallScore: h.overallScore,
            evaluatedAt: h.evaluatedAt,
        }));
        return {
            companyId: String(companyId),
            isnStyleScore,
            grade: scoreToGrade(isnStyleScore),
            trend: trendFromHistory(historyPoints),
            lastUpdatedAt: ((_b = (_a = spceRun === null || spceRun === void 0 ? void 0 : spceRun.evaluatedAt) !== null && _a !== void 0 ? _a : corporate === null || corporate === void 0 ? void 0 : corporate.computedAt) !== null && _b !== void 0 ? _b : new Date()).toString(),
            breakdown,
        };
    }
};
exports.CompanyComplianceUiService = CompanyComplianceUiService;
exports.CompanyComplianceUiService = CompanyComplianceUiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [companies_service_1.CompaniesService,
        company_training_compliance_service_1.CompanyTrainingComplianceService,
        assessment_engines_service_1.AssessmentEnginesService,
        pm_company_safety_cail_intelligence_service_1.PmCompanySafetyCailIntelligenceService])
], CompanyComplianceUiService);
//# sourceMappingURL=company-compliance-ui.service.js.map