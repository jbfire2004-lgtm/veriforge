import { Injectable } from '@nestjs/common';
import { VeraAssessmentEngine } from '@prisma/client';
import { AssessmentEnginesService } from '../modules/assessment-engines/assessment-engines.service';
import { PmCompanySafetyCailIntelligenceService } from '../pm-company-safety-context/pm-company-safety-cail-intelligence.service';
import { CompaniesService, type CompanyActor } from './companies.service';
import { CompanyTrainingComplianceService } from './company-training-compliance.service';
import type {
  CompanyComplianceEngineDto,
  CompanyComplianceFlagDto,
  CompanyComplianceOverviewDto,
  CompanyScoreDto,
  CompanyScoreGrade,
  CompanyScoreTrend,
} from './company-compliance-ui.types';

function scoreToGrade(score: number): CompanyScoreGrade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function engineStatusFromScore(
  score: number,
): CompanyComplianceEngineDto['status'] {
  if (score >= 80) return 'pass';
  if (score >= 60) return 'warning';
  return 'fail';
}

function overallFromSummary(input: {
  status: string;
  expiredTraining: number;
  expiredCredentials: number;
  incidents: number;
  expiringTraining: number;
}): CompanyComplianceOverviewDto['overallStatus'] {
  if (
    input.status === 'NON_COMPLIANT' ||
    input.expiredTraining > 0 ||
    input.expiredCredentials > 0 ||
    input.incidents > 0
  ) {
    return input.expiredTraining + input.expiredCredentials + input.incidents >
      3
      ? 'non_compliant'
      : 'at_risk';
  }
  if (input.expiringTraining > 0) return 'at_risk';
  return 'compliant';
}

function trendFromHistory(
  points: Array<{ overallScore: number; evaluatedAt: Date }>,
): CompanyScoreTrend {
  if (points.length < 2) return 'stable';
  const latest = points[0]?.overallScore ?? 0;
  const previous = points[1]?.overallScore ?? latest;
  if (latest > previous + 2) return 'improving';
  if (latest < previous - 2) return 'declining';
  return 'stable';
}

@Injectable()
export class CompanyComplianceUiService {
  constructor(
    private readonly companies: CompaniesService,
    private readonly trainingCompliance: CompanyTrainingComplianceService,
    private readonly assessmentEngines: AssessmentEnginesService,
    private readonly cail: PmCompanySafetyCailIntelligenceService,
  ) {}

  async getComplianceOverview(
    companyId: number,
    actor?: CompanyActor,
  ): Promise<CompanyComplianceOverviewDto> {
    const [summary, trainingDash, spceRun, sgaRun, corporate] =
      await Promise.all([
        this.companies.complianceSummary(companyId, actor),
        this.trainingCompliance
          .getCompanyDashboard(companyId, actor)
          .catch(() => null),
        this.assessmentEngines
          .getLatestByEngine(VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE, {
            companyId,
          })
          .catch(() => null),
        this.assessmentEngines
          .getLatestByEngine(VeraAssessmentEngine.SMART_GAP_ANALYSIS, {
            companyId,
          })
          .catch(() => null),
        this.cail.generateCorporateSafetyScore(companyId).catch(() => null),
      ]);

    const engines: CompanyComplianceEngineDto[] = [];

    const trainingScore =
      trainingDash != null
        ? Math.max(
            0,
            100 -
              trainingDash.flaggedWorkers.length * 8 -
              trainingDash.counts.rejected * 5 -
              trainingDash.counts.expiring * 2,
          )
        : summary.expiredTrainingCount + summary.expiredCredentialsCount === 0
        ? 92
        : Math.max(
            20,
            100 -
              summary.expiredTrainingCount * 10 -
              summary.expiredCredentialsCount * 10,
          );

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

    const flags: CompanyComplianceFlagDto[] = [];
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
        description: `${
          summary.workerIncidentsCount + summary.equipmentIncidentsCount
        } incident(s) on record.`,
        createdAt: nowIso,
      });
    }
    if ((summary.expiringTrainingCount ?? 0) > 0) {
      flags.push({
        id: 'flag-expiring-training',
        type: 'minor',
        label: 'Training expiring soon',
        description: `${summary.expiringTrainingCount} training record(s) expire within 30 days.`,
        createdAt: nowIso,
      });
    }

    const evaluatedAt = [
      spceRun?.evaluatedAt,
      sgaRun?.evaluatedAt,
      corporate?.computedAt ? new Date(corporate.computedAt) : null,
    ]
      .filter(Boolean)
      .sort((a, b) => (b as Date).getTime() - (a as Date).getTime())[0] as
      | Date
      | undefined;

    return {
      companyId: String(companyId),
      overallStatus: overallFromSummary({
        status: summary.status,
        expiredTraining: summary.expiredTrainingCount,
        expiredCredentials: summary.expiredCredentialsCount,
        incidents:
          summary.workerIncidentsCount + summary.equipmentIncidentsCount,
        expiringTraining: summary.expiringTrainingCount ?? 0,
      }),
      lastEvaluatedAt: (evaluatedAt ?? new Date()).toISOString(),
      engines,
      flags,
    };
  }

  async getCompanyScore(
    companyId: number,
    actor?: CompanyActor,
  ): Promise<CompanyScoreDto> {
    const [corporate, spceRun, sgaRun, trainingDash, spceHistory] =
      await Promise.all([
        this.cail.generateCorporateSafetyScore(companyId).catch(() => null),
        this.assessmentEngines
          .getLatestByEngine(VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE, {
            companyId,
          })
          .catch(() => null),
        this.assessmentEngines
          .getLatestByEngine(VeraAssessmentEngine.SMART_GAP_ANALYSIS, {
            companyId,
          })
          .catch(() => null),
        this.trainingCompliance
          .getCompanyDashboard(companyId, actor)
          .catch(() => null),
        this.assessmentEngines
          .listHistoryByEngine(
            VeraAssessmentEngine.SAFETY_PROGRAM_COMPLIANCE,
            { companyId },
            4,
          )
          .catch(() => []),
      ]);

    const breakdown: CompanyScoreDto['breakdown'] = [];

    const trainingScore =
      trainingDash != null
        ? Math.max(
            0,
            100 -
              trainingDash.flaggedWorkers.length * 8 -
              trainingDash.counts.rejected * 5,
          )
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
    const isnStyleScore = Math.round(
      breakdown.reduce((s, b) => s + b.score * (b.weight / weightSum), 0),
    );

    const historyPoints = spceHistory.map((h) => ({
      overallScore: h.overallScore,
      evaluatedAt: h.evaluatedAt,
    }));

    return {
      companyId: String(companyId),
      isnStyleScore,
      grade: scoreToGrade(isnStyleScore),
      trend: trendFromHistory(historyPoints),
      lastUpdatedAt: (
        spceRun?.evaluatedAt ??
        corporate?.computedAt ??
        new Date()
      ).toString(),
      breakdown,
    };
  }
}
