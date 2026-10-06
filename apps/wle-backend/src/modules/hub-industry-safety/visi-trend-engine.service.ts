import { BadRequestException, Injectable } from '@nestjs/common';
import {
  HOURS_DENOMINATOR,
  MIN_SAMPLE,
  PlaneIsolationError,
  assertSinglePlane,
  assertSubtypeMatchesPlane,
  type BlindAggregateResult,
  type CohortKey,
  type NormalizedMetrics,
} from '@vera/hub-industry-safety';
import {
  VeriHubIndustryTrendEngine,
  expandTrailingPeriods,
  type IndustryTrendReport,
  type RiskForecastHorizon,
  type SeasonalMetric,
  type TrendCohortScope,
  type TrendSeriesPoint,
} from '@vera/hub-industry-safety-trends';
import {
  COMPANY_SUBTYPES,
  INDUSTRIES,
  PROJECT_SUBTYPES,
  SCALES,
  type CompanySubtype,
  type IndustryCode,
  type ProjectSubtype,
  type ScaleBand,
} from './visi.types';
import { round, seedUnit } from './visi-crypto';
import { VisiAnonymizationEngineService } from './visi-anonymization-engine.service';

const PERIOD_RE = /^(\d{4})-(0[1-9]|1[0-2]|Q[1-4])$/;

/**
 * Nest facade over VeriHub Industry Trend Engine.
 * Builds anonymized series from contributed facts, or seeded demo series.
 */
@Injectable()
export class VisiTrendEngineService {
  private readonly engine = new VeriHubIndustryTrendEngine();

  constructor(private readonly anonymizer: VisiAnonymizationEngineService) {}

  get engineInstance(): VeriHubIndustryTrendEngine {
    return this.engine;
  }

  analyzeFromQuery(raw: Record<string, string | undefined>): {
    data: IndustryTrendReport;
    meta: Record<string, unknown>;
  } {
    const { scope, series, source } = this.buildSeries(raw);
    const report = this.engine.toPublicReport(
      this.engine.analyze({
        scope,
        series,
        forecastHorizon: (raw.horizon as RiskForecastHorizon) || '3m',
      }),
    );
    return {
      data: report,
      meta: {
        timestamp: new Date().toISOString(),
        plane: scope.entityType,
        minSample: MIN_SAMPLE,
        seriesLength: series.length,
        usablePeriods: series.filter((p) => !p.suppressed).length,
        source,
      },
    };
  }

  heca(raw: Record<string, string | undefined>) {
    const { scope, series, source } = this.buildSeries(raw);
    return {
      data: this.engine.analyzeHeca({ scope, series }),
      meta: this.meta(scope, series, source),
    };
  }

  trifLtif(raw: Record<string, string | undefined>) {
    const { scope, series, source } = this.buildSeries(raw);
    return {
      data: this.engine.analyzeTrifLtif({ scope, series }),
      meta: this.meta(scope, series, source),
    };
  }

  leading(raw: Record<string, string | undefined>) {
    const { scope, series, source } = this.buildSeries(raw);
    return {
      data: this.engine.correlateLeading({ scope, series }),
      meta: this.meta(scope, series, source),
    };
  }

  seasonal(raw: Record<string, string | undefined>) {
    const { scope, series, source } = this.buildSeries(raw);
    const metric = raw.metric as SeasonalMetric | undefined;
    return {
      data: this.engine.modelSeasonal({ scope, series }, metric),
      meta: this.meta(scope, series, source),
    };
  }

  rootCause(raw: Record<string, string | undefined>) {
    const { scope, series, source } = this.buildSeries(raw);
    return {
      data: this.engine.clusterRootCauses({ scope, series }),
      meta: this.meta(scope, series, source),
    };
  }

  workforce(raw: Record<string, string | undefined>) {
    const { scope, series, source } = this.buildSeries(raw);
    return {
      data: this.engine.scoreWorkforce({ scope, series }),
      meta: this.meta(scope, series, source),
    };
  }

  predictive(raw: Record<string, string | undefined>) {
    const { scope, series, source } = this.buildSeries(raw);
    return {
      data: this.engine.forecastRisk({
        scope,
        series,
        forecastHorizon: (raw.horizon as RiskForecastHorizon) || '3m',
      }),
      meta: this.meta(scope, series, source),
    };
  }

  crossCompareTrends(body: {
    project: Record<string, string | undefined>;
    company: Record<string, string | undefined>;
    explicitConsent?: boolean;
    permissionGranted?: boolean;
  }) {
    try {
      const project = this.buildSeries({
        ...body.project,
        entityType: 'project',
      });
      const company = this.buildSeries({
        ...body.company,
        entityType: 'company',
      });
      const result = this.engine.crossCompare({
        project: { scope: project.scope, series: project.series },
        company: { scope: company.scope, series: company.series },
        explicitConsent: body.explicitConsent === true,
        permissionGranted: body.permissionGranted,
      });
      return {
        data: {
          project: this.engine.toPublicReport(result.project),
          company: this.engine.toPublicReport(result.company),
        },
        meta: {
          timestamp: new Date().toISOString(),
          blended: false,
          minSample: MIN_SAMPLE,
        },
      };
    } catch (e) {
      if (e instanceof PlaneIsolationError) {
        throw new BadRequestException({ code: e.code, message: e.message });
      }
      throw e;
    }
  }

  private meta(
    scope: TrendCohortScope,
    series: TrendSeriesPoint[],
    source: string,
  ) {
    return {
      timestamp: new Date().toISOString(),
      plane: scope.entityType,
      minSample: MIN_SAMPLE,
      seriesLength: series.length,
      usablePeriods: series.filter((p) => !p.suppressed).length,
      source,
    };
  }

  private buildSeries(raw: Record<string, string | undefined>): {
    scope: TrendCohortScope;
    series: TrendSeriesPoint[];
    source: 'facts' | 'seed';
  } {
    const scope = this.parseScope(raw);
    const periods = expandTrailingPeriods(
      raw.period!,
      raw.period!.includes('Q') ? 4 : 6,
    );

    const facts = this.anonymizer.listFactsForCohort({
      industry: scope.industry,
      entityType: scope.entityType,
      subtype: scope.subtype as CohortKey['subtype'],
      scale: scope.scale,
      periods,
    });

    if (facts.length >= MIN_SAMPLE) {
      const aggregates: BlindAggregateResult[] = periods.map((period) =>
        this.anonymizer.aggregate({
          industry: scope.industry,
          entityType: scope.entityType,
          subtype: scope.subtype as CohortKey['subtype'],
          scale: scope.scale,
          period,
        }),
      );
      const series = this.engine.fromBlindAggregates(aggregates).map((p) => ({
        ...p,
        workforce: this.seedWorkforce(scope, p.period),
        leading: {
          ...p.leading,
          ...this.seedLeading(scope, p.period),
        },
      }));
      return { scope, series, source: 'facts' };
    }

    return {
      scope,
      series: this.seedSeries(scope, periods),
      source: 'seed',
    };
  }

  private parseScope(raw: Record<string, string | undefined>): TrendCohortScope {
    const entityType = raw.entityType === 'company' ? 'company' : 'project';
    try {
      assertSinglePlane(entityType, raw);
    } catch (e) {
      if (e instanceof PlaneIsolationError) {
        throw new BadRequestException({ code: e.code, message: e.message });
      }
      throw e;
    }

    const industry = raw.industry as IndustryCode | undefined;
    const subtype = (raw.subtype ??
      (entityType === 'project' ? raw.projectType : raw.companyType)) as
      | string
      | undefined;
    const scale = raw.scale as ScaleBand | undefined;
    const period = raw.period;

    if (!industry || !INDUSTRIES.includes(industry)) {
      throw new BadRequestException({
        code: 'VISI_INVALID_INDUSTRY',
        message: 'Valid industry is required',
      });
    }
    if (!subtype) {
      throw new BadRequestException({
        code: 'VISI_PLANE_MISMATCH',
        message: 'subtype is required',
      });
    }
    try {
      assertSubtypeMatchesPlane(entityType, subtype);
    } catch (e) {
      if (e instanceof PlaneIsolationError) {
        throw new BadRequestException({ code: e.code, message: e.message });
      }
      throw e;
    }
    if (entityType === 'project' && !PROJECT_SUBTYPES.includes(subtype as ProjectSubtype)) {
      throw new BadRequestException({
        code: 'VISI_PLANE_MISMATCH',
        message: 'Valid project type required',
      });
    }
    if (
      entityType === 'company' &&
      !COMPANY_SUBTYPES.includes(subtype as CompanySubtype)
    ) {
      throw new BadRequestException({
        code: 'VISI_PLANE_MISMATCH',
        message: 'Valid company type required',
      });
    }
    if (!scale || !SCALES.includes(scale)) {
      throw new BadRequestException({
        code: 'VISI_INVALID_SCALE',
        message: 'Valid scale required',
      });
    }
    if (!period || !PERIOD_RE.test(period)) {
      throw new BadRequestException({
        code: 'VISI_INVALID_PERIOD',
        message: 'period must be YYYY-MM or YYYY-Qn',
      });
    }

    return { industry, entityType, subtype, scale };
  }

  /** Deterministic anonymized demo series (no tokens / PII). */
  private seedSeries(
    scope: TrendCohortScope,
    periods: string[],
  ): TrendSeriesPoint[] {
    const baseKey = `${scope.entityType}|${scope.industry}|${scope.subtype}|${scope.scale}`;
    return periods.map((period) => {
      const u = seedUnit(`${baseKey}|${period}`);
      const trif = round(0.6 + u * 2.4, 2);
      const ltif = round(trif * (0.2 + seedUnit(`${baseKey}|lt|${period}`) * 0.35), 2);
      const heca = round(0.05 + u * 0.2, 3);
      const controls = round(0.65 + seedUnit(`${baseKey}|cv|${period}`) * 0.3, 3);
      const metrics: NormalizedMetrics = {
        incidentRatePer200k: round(trif * 1.4, 2),
        recordableRatePer200k: trif,
        lostTimeRatePer200k: ltif,
        nearMissRatePer200k: round(2 + u * 6, 2),
        severityIndex: round(20 + u * 50, 1),
        hecaHighEnergyRate: heca,
        hecaControlsVerifiedRate: controls,
        hecaDistribution: {
          gravity: round(0.18 + seedUnit(`${baseKey}|g|${period}`) * 0.2, 2),
          electrical: round(0.16 + seedUnit(`${baseKey}|e|${period}`) * 0.18, 2),
          mechanical: round(0.12 + seedUnit(`${baseKey}|m|${period}`) * 0.14, 2),
          pressure: round(0.08 + seedUnit(`${baseKey}|p|${period}`) * 0.1, 2),
          chemical: round(0.05 + seedUnit(`${baseKey}|c|${period}`) * 0.1, 2),
        },
        hoursBasis: HOURS_DENOMINATOR,
      };
      return {
        period,
        suppressed: false,
        entityCount: 8 + Math.floor(seedUnit(`${baseKey}|n|${period}`) * 20),
        metrics,
        leading: this.seedLeading(scope, period),
        workforce: this.seedWorkforce(scope, period),
        rootCauseShares: metrics.hecaDistribution as Record<string, number>,
      };
    });
  }

  private seedLeading(scope: TrendCohortScope, period: string) {
    const k = `${scope.entityType}|${scope.industry}|${scope.subtype}|${scope.scale}|lead|${period}`;
    return {
      observationRate: round(0.4 + seedUnit(`${k}|obs`) * 0.5, 3),
      inspectionCompletionRate: round(0.55 + seedUnit(`${k}|insp`) * 0.4, 3),
      trainingCurrencyRate: round(0.6 + seedUnit(`${k}|trn`) * 0.35, 3),
      nearMissReportingIndex: round(0.3 + seedUnit(`${k}|nm`) * 0.5, 3),
      controlsVerifiedRate: round(0.65 + seedUnit(`${k}|cv`) * 0.3, 3),
    };
  }

  private seedWorkforce(scope: TrendCohortScope, period: string) {
    const k = `${scope.entityType}|${scope.industry}|${scope.subtype}|${scope.scale}|wf|${period}`;
    return {
      turnoverRate: round(0.08 + seedUnit(`${k}|to`) * 0.18, 3),
      tenureMedianYears: round(2 + seedUnit(`${k}|ten`) * 8, 1),
      contractorRatio: round(0.15 + seedUnit(`${k}|cr`) * 0.45, 3),
      overtimePressure: round(0.1 + seedUnit(`${k}|ot`) * 0.35, 3),
      retentionScore: Math.round(40 + seedUnit(`${k}|ret`) * 55),
    };
  }
}
