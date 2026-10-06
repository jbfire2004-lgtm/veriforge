import { BadRequestException, Injectable } from '@nestjs/common';
import {
  HOURS_DENOMINATOR,
  INDUSTRIES,
  MIN_SAMPLE,
  PROJECT_SUBTYPES,
  COMPANY_SUBTYPES,
  SCALES,
  type IndustryCode,
  type ProjectScaleQuery,
  type CompanyScaleQuery,
  type ProjectSubtype,
  type CompanySubtype,
  type ScaleBand,
} from './visi.types';
import {
  clamp,
  round,
  seedInt,
  seedUnit,
  tokenizeProjectId,
  tokenizeCompanyId,
  PlaneIsolationError,
  assertSinglePlane,
  assertSubtypeMatchesPlane,
} from './visi-crypto';
import { VisiAnonymizationEngineService } from './visi-anonymization-engine.service';

const PERIOD_RE = /^(\d{4})-(0[1-9]|1[0-2]|Q[1-4])$/;

function riskBand(score: number): 'low' | 'moderate' | 'elevated' | 'critical' {
  if (score >= 75) return 'critical';
  if (score >= 55) return 'elevated';
  if (score >= 35) return 'moderate';
  return 'low';
}

function monthLabels(period: string): string[] {
  const m = PERIOD_RE.exec(period);
  if (!m) return [];
  const year = Number(m[1]);
  const part = m[2];
  if (part.startsWith('Q')) {
    const q = Number(part.slice(1));
    const start = (q - 1) * 3 + 1;
    return [0, 1, 2].map((i) => {
      const mo = String(start + i).padStart(2, '0');
      return `${year}-${mo}`;
    });
  }
  const month = Number(part);
  return Array.from({ length: 6 }, (_, i) => {
    let y = year;
    let mo = month - 5 + i;
    while (mo < 1) {
      mo += 12;
      y -= 1;
    }
    while (mo > 12) {
      mo -= 12;
      y += 1;
    }
    return `${y}-${String(mo).padStart(2, '0')}`;
  });
}

/**
 * Dual-plane industry intelligence.
 * Project and company stores never mix unless cross-compare is explicitly requested.
 */
@Injectable()
export class HubIndustrySafetyService {
  constructor(private readonly anonymizer: VisiAnonymizationEngineService) {}

  getSelectors() {
    return {
      industries: INDUSTRIES,
      projectTypes: PROJECT_SUBTYPES,
      companyTypes: COMPANY_SUBTYPES,
      scales: SCALES,
      minSample: MIN_SAMPLE,
      hoursDenominator: HOURS_DENOMINATOR,
      planes: {
        project: { companyDataIncluded: false as const },
        company: { projectDataIncluded: false as const },
      },
    };
  }

  /**
   * Dynamic selector availability for one plane.
   * Only options that can form a cohort with entityCount >= MIN_SAMPLE are marked available.
   * Never mixes project and company counts.
   */
  getSelectorAvailability(raw: Record<string, string | undefined>) {
    const entityType = raw.entityType === 'company' ? 'company' : 'project';
    const period = raw.period && PERIOD_RE.test(raw.period) ? raw.period : '2026-Q2';
    const industryFilter = raw.industry as IndustryCode | undefined;
    const subtypes =
      entityType === 'project' ? PROJECT_SUBTYPES : COMPANY_SUBTYPES;

    if (industryFilter && !INDUSTRIES.includes(industryFilter)) {
      throw new BadRequestException({
        code: 'VISI_INVALID_INDUSTRY',
        message: 'Valid industry is required when provided',
      });
    }

    const industries = INDUSTRIES.map((industry) => {
      let availableCount = 0;
      for (const subtype of subtypes) {
        for (const scale of SCALES) {
          const n = this.cohortEntityCount(
            entityType,
            industry,
            subtype,
            scale,
            period,
          );
          if (n >= MIN_SAMPLE) availableCount += 1;
        }
      }
      return {
        id: industry,
        available: availableCount > 0,
        qualifyingCombos: availableCount,
      };
    });

    const industry =
      industryFilter &&
      industries.find((i) => i.id === industryFilter)?.available
        ? industryFilter
        : (industries.find((i) => i.available)?.id ?? INDUSTRIES[0]);

    const subtypeOptions = subtypes.map((subtype) => {
      const byScale = SCALES.map((scale) => {
        const entityCount = this.cohortEntityCount(
          entityType,
          industry,
          subtype,
          scale,
          period,
        );
        const available = entityCount >= MIN_SAMPLE;
        return {
          scale,
          available,
          entityCount: available ? entityCount : null,
        };
      });
      const available = byScale.some((s) => s.available);
      return {
        id: subtype,
        available,
        scales: byScale,
      };
    });

    const scaleOptions = SCALES.map((scale) => {
      const available = subtypeOptions.some((st) =>
        st.scales.some((s) => s.scale === scale && s.available),
      );
      return { id: scale, available };
    });

    return {
      plane: entityType,
      period,
      minSample: MIN_SAMPLE,
      industry,
      industries,
      subtypes: subtypeOptions,
      scales: scaleOptions,
      crossContaminationPrevented: true as const,
      note:
        entityType === 'project'
          ? 'Company-level categories are excluded from this availability set.'
          : 'Project-level categories are excluded from this availability set.',
    };
  }

  private cohortEntityCount(
    entityType: 'project' | 'company',
    industry: string,
    subtype: string,
    scale: string,
    period: string,
  ): number {
    const cohortKey = [entityType, industry, subtype, scale, period].join('|');
    return seedInt(`${cohortKey}|n`, 2, 28);
  }

  getProjectCohort(raw: Record<string, string | undefined>) {
    const query = this.parseQuery(raw);
    const cohortKey = [
      'project',
      query.industry,
      query.projectType,
      query.scale,
      query.period,
    ].join('|');

    // Distinct tokenized projects in synthetic cohort (privacy: tokens never leave service)
    const entityCount = this.cohortEntityCount(
      'project',
      query.industry,
      query.projectType,
      query.scale,
      query.period,
    );
    const tokens = Array.from({ length: entityCount }, (_, i) =>
      tokenizeProjectId(`${cohortKey}|${i}`),
    );
    void tokens; // retained only for distinct-count semantics

    const suppressed = entityCount < MIN_SAMPLE;
    const meta = {
      timestamp: new Date().toISOString(),
      plane: 'project' as const,
      suppressed,
      minSample: MIN_SAMPLE,
      entityCount: suppressed ? null : entityCount,
      entityCountVisible: !suppressed,
      hoursDenominator: HOURS_DENOMINATOR,
      companyDataIncluded: false as const,
    };

    const cohort = {
      industry: query.industry,
      entityType: 'project' as const,
      subtype: query.projectType,
      scale: query.scale,
      period: query.period,
    };

    if (suppressed) {
      return {
        data: { cohort, metrics: null },
        meta,
      };
    }

    const u = seedUnit(cohortKey);
    const trif = round(0.6 + u * 2.4, 2);
    const ltif = round(trif * (0.2 + seedUnit(`${cohortKey}|ltif`) * 0.35), 2);
    const highEnergyRate = round(0.05 + u * 0.2, 3);
    const controlsVerifiedRate = round(0.65 + seedUnit(`${cohortKey}|ctrl`) * 0.3, 3);

    const months = monthLabels(query.period);
    const hecaTrend = months.map((p) => ({
      period: p,
      highEnergyRate: round(
        clamp(highEnergyRate + (seedUnit(`${cohortKey}|heca|${p}`) - 0.5) * 0.08),
        3,
      ),
      controlsVerifiedRate: round(
        clamp(
          controlsVerifiedRate + (seedUnit(`${cohortKey}|ctrl|${p}`) - 0.5) * 0.06,
        ),
        3,
      ),
    }));

    const heatmap = [
      { indicator: 'near_miss', label: 'Near-miss reporting', score: 0 },
      { indicator: 'observations', label: 'Safety observations', score: 0 },
      { indicator: 'inspections', label: 'Inspection completion', score: 0 },
      { indicator: 'training', label: 'Training currency', score: 0 },
      { indicator: 'jha_quality', label: 'JHA quality', score: 0 },
      { indicator: 'leadership', label: 'Leadership engagement', score: 0 },
    ].map((row) => ({
      ...row,
      score: Math.round(35 + seedUnit(`${cohortKey}|hm|${row.indicator}`) * 60),
    }));

    const agingRaw: Array<{
      bucket: "0-7d" | "8-30d" | "31-60d" | "61-90d" | "90d+";
      share: number;
    }> = [
      { bucket: "0-7d", share: 0.35 },
      { bucket: "8-30d", share: 0.28 },
      { bucket: "31-60d", share: 0.18 },
      { bucket: "61-90d", share: 0.12 },
      { bucket: "90d+", share: 0.07 },
    ];
    const agingTotal = seedInt(`${cohortKey}|capa`, 40, 180);
    const aging = agingRaw.map((row) => ({
      bucket: row.bucket,
      share: row.share,
      count: Math.round(agingTotal * row.share),
    }));

    const rootCauses = [
      { code: 'human_factor', label: 'Human factor' },
      { code: 'procedure', label: 'Procedure gap' },
      { code: 'equipment', label: 'Equipment / tool' },
      { code: 'environment', label: 'Environment / energy' },
      { code: 'supervision', label: 'Supervision' },
      { code: 'other', label: 'Other' },
    ].map((r) => {
      const share = round(0.08 + seedUnit(`${cohortKey}|rc|${r.code}`) * 0.22, 3);
      return {
        ...r,
        share,
        count: Math.round(share * agingTotal),
      };
    });
    const rcSum = rootCauses.reduce((s, r) => s + r.share, 0);
    rootCauses.forEach((r) => {
      r.share = round(r.share / rcSum, 3);
    });

    const riskScore = Math.round(
      clamp(
        20 +
          trif * 12 +
          highEnergyRate * 100 * 0.4 +
          (1 - controlsVerifiedRate) * 40 +
          seedUnit(`${cohortKey}|risk`) * 15,
        0,
        100,
      ),
    );

    const drivers = [
      { code: 'heca', label: 'High-energy exposure', weight: round(0.2 + u * 0.2, 2) },
      { code: 'trif', label: 'Recordable frequency', weight: round(0.15 + u * 0.15, 2) },
      {
        code: 'capa_aging',
        label: 'Corrective action aging',
        weight: round(0.1 + seedUnit(`${cohortKey}|d3`) * 0.15, 2),
      },
      {
        code: 'competency',
        label: 'Competency expiry pressure',
        weight: round(0.1 + seedUnit(`${cohortKey}|d4`) * 0.12, 2),
      },
      {
        code: 'seasonal',
        label: 'Seasonal risk pattern',
        weight: round(0.08 + seedUnit(`${cohortKey}|d5`) * 0.1, 2),
      },
    ];

    const seasonal: Array<{
      period: string;
      metric: string;
      value: number | null;
      suppressed?: boolean;
    }> = [];
    for (const p of months) {
      seasonal.push({
        period: p,
        metric: 'trif',
        value: round(trif * (0.75 + seedUnit(`${cohortKey}|s|trif|${p}`) * 0.5), 2),
      });
      seasonal.push({
        period: p,
        metric: 'leading_composite',
        value: round(
          50 + seedUnit(`${cohortKey}|s|lead|${p}`) * 45,
          1,
        ),
      });
      seasonal.push({
        period: p,
        metric: 'incident_per_200k',
        value: round(
          trif * (0.9 + seedUnit(`${cohortKey}|s|inc|${p}`) * 0.4),
          2,
        ),
      });
    }

    const metrics = {
      heca: {
        highEnergyRate,
        controlsVerifiedRate,
        distribution: {
          gravity: round(0.2 + seedUnit(`${cohortKey}|e1`) * 0.2, 2),
          electrical: round(0.15 + seedUnit(`${cohortKey}|e2`) * 0.2, 2),
          mechanical: round(0.1 + seedUnit(`${cohortKey}|e3`) * 0.15, 2),
          pressure: round(0.08 + seedUnit(`${cohortKey}|e4`) * 0.12, 2),
          chemical: round(0.05 + seedUnit(`${cohortKey}|e5`) * 0.1, 2),
        },
        trend: hecaTrend,
      },
      trif,
      ltif,
      leading: {
        nearMissRate: round(1 + seedUnit(`${cohortKey}|nm`) * 3, 2),
        observationRate: round(2 + seedUnit(`${cohortKey}|obs`) * 4, 2),
        inspectionCompletion: round(0.75 + seedUnit(`${cohortKey}|insp`) * 0.22, 3),
        trainingCurrency: round(0.7 + seedUnit(`${cohortKey}|trn`) * 0.25, 3),
        heatmap,
      },
      correctiveActions: {
        onTimeRate: round(0.55 + seedUnit(`${cohortKey}|ot`) * 0.4, 3),
        openAvg: round(2 + seedUnit(`${cohortKey}|op`) * 8, 1),
        overdueCountAvg: round(0.5 + seedUnit(`${cohortKey}|od`) * 4, 1),
        aging,
      },
      competency: {
        currentRate: round(0.75 + seedUnit(`${cohortKey}|cc`) * 0.2, 3),
        expiring30dRate: round(0.03 + seedUnit(`${cohortKey}|c30`) * 0.08, 3),
        expiring60dRate: round(0.05 + seedUnit(`${cohortKey}|c60`) * 0.1, 3),
        expiring90dRate: round(0.07 + seedUnit(`${cohortKey}|c90`) * 0.12, 3),
      },
      seasonal,
      workforceNormalized: {
        incidentRatePer200k: round(trif * (1.05 + seedUnit(`${cohortKey}|wn`) * 0.2), 2),
        recordableRatePer200k: trif,
        lostTimeRatePer200k: ltif,
        hoursBasis: HOURS_DENOMINATOR,
      },
      rootCause: rootCauses,
      riskProfile: {
        score: riskScore,
        band: riskBand(riskScore),
        drivers,
        confidence: round(0.55 + seedUnit(`${cohortKey}|conf`) * 0.35, 2),
      },
      predictive: {
        riskScore,
        confidence: round(0.55 + seedUnit(`${cohortKey}|pconf`) * 0.35, 2),
        drivers,
        modelId: 'visi-project-risk',
        modelVersion: '1.0.0',
      },
    };

    return {
      data: { cohort, metrics },
      meta,
    };
  }

  /**
   * Company-plane only industry intelligence.
   * Never reads or returns project-level aggregates.
   */
  getCompanyCohort(raw: Record<string, string | undefined>) {
    const query = this.parseCompanyQuery(raw);
    const cohortKey = [
      'company',
      query.industry,
      query.companyType,
      query.scale,
      query.period,
    ].join('|');

    const entityCount = this.cohortEntityCount(
      'company',
      query.industry,
      query.companyType,
      query.scale,
      query.period,
    );
    const tokens = Array.from({ length: entityCount }, (_, i) =>
      tokenizeCompanyId(`${cohortKey}|${i}`),
    );
    void tokens;

    const suppressed = entityCount < MIN_SAMPLE;
    const meta = {
      timestamp: new Date().toISOString(),
      plane: 'company' as const,
      suppressed,
      minSample: MIN_SAMPLE,
      entityCount: suppressed ? null : entityCount,
      entityCountVisible: !suppressed,
      hoursDenominator: HOURS_DENOMINATOR,
      projectDataIncluded: false as const,
    };

    const cohort = {
      industry: query.industry,
      entityType: 'company' as const,
      subtype: query.companyType,
      scale: query.scale,
      period: query.period,
    };

    if (suppressed) {
      return {
        data: { cohort, metrics: null },
        meta,
      };
    }

    const u = seedUnit(cohortKey);
    const trif = round(0.5 + u * 2.2, 2);
    const ltif = round(trif * (0.18 + seedUnit(`${cohortKey}|ltif`) * 0.32), 2);
    const hecaRate = round(0.04 + u * 0.18, 3);
    const controlsVerifiedRate = round(
      0.68 + seedUnit(`${cohortKey}|ctrl`) * 0.28,
      3,
    );

    const months = monthLabels(query.period);

    const maturity = [
      { indicator: 'reporting', label: 'Reporting culture', score: 0 },
      { indicator: 'observations', label: 'Observation maturity', score: 0 },
      { indicator: 'inspections', label: 'Inspection discipline', score: 0 },
      { indicator: 'training', label: 'Training systems', score: 0 },
      { indicator: 'leadership', label: 'Leadership cadence', score: 0 },
      { indicator: 'learning', label: 'Learning loops', score: 0 },
    ].map((row) => ({
      ...row,
      score: Math.round(30 + seedUnit(`${cohortKey}|mat|${row.indicator}`) * 65),
    }));
    const maturityScore = Math.round(
      maturity.reduce((s, m) => s + m.score, 0) / maturity.length,
    );

    const agingRaw: Array<{
      bucket: '0-7d' | '8-30d' | '31-60d' | '61-90d' | '90d+';
      share: number;
    }> = [
      { bucket: '0-7d', share: 0.32 },
      { bucket: '8-30d', share: 0.3 },
      { bucket: '31-60d', share: 0.2 },
      { bucket: '61-90d', share: 0.11 },
      { bucket: '90d+', share: 0.07 },
    ];
    const agingTotal = seedInt(`${cohortKey}|capa`, 50, 220);
    const aging = agingRaw.map((row) => ({
      bucket: row.bucket,
      share: row.share,
      count: Math.round(agingTotal * row.share),
    }));

    const competencyTrend = months.map((p) => ({
      period: p,
      currentRate: round(
        clamp(0.72 + (seedUnit(`${cohortKey}|comp|${p}`) - 0.4) * 0.2),
        3,
      ),
      expiring30dRate: round(
        0.03 + seedUnit(`${cohortKey}|exp|${p}`) * 0.08,
        3,
      ),
    }));

    const regions = [
      { code: 'west', label: 'West' },
      { code: 'midwest', label: 'Midwest' },
      { code: 'south', label: 'South' },
      { code: 'northeast', label: 'Northeast' },
      { code: 'canada', label: 'Canada' },
    ].map((r) => ({
      ...r,
      trif: round(trif * (0.75 + seedUnit(`${cohortKey}|reg|${r.code}`) * 0.5), 2),
      hecaRate: round(
        clamp(hecaRate * (0.8 + seedUnit(`${cohortKey}|rh|${r.code}`) * 0.4)),
        3,
      ),
      maturityScore: Math.round(
        35 + seedUnit(`${cohortKey}|rm|${r.code}`) * 55,
      ),
      companyShare: round(0.12 + seedUnit(`${cohortKey}|rs|${r.code}`) * 0.2, 3),
    }));
    const regSum = regions.reduce((s, r) => s + r.companyShare, 0);
    regions.forEach((r) => {
      r.companyShare = round(r.companyShare / regSum, 3);
    });

    const metrics = {
      heca: {
        companyHecaRate: hecaRate,
        controlsVerifiedRate,
        distribution: {
          gravity: round(0.18 + seedUnit(`${cohortKey}|e1`) * 0.2, 2),
          electrical: round(0.16 + seedUnit(`${cohortKey}|e2`) * 0.18, 2),
          mechanical: round(0.12 + seedUnit(`${cohortKey}|e3`) * 0.14, 2),
          pressure: round(0.08 + seedUnit(`${cohortKey}|e4`) * 0.1, 2),
          chemical: round(0.05 + seedUnit(`${cohortKey}|e5`) * 0.1, 2),
        },
      },
      trif,
      ltif,
      hoursBasis: HOURS_DENOMINATOR,
      leadingMaturity: {
        score: maturityScore,
        band:
          maturityScore >= 75
            ? ('advanced' as const)
            : maturityScore >= 55
              ? ('developing' as const)
              : maturityScore >= 40
                ? ('emerging' as const)
                : ('nascent' as const),
        dimensions: maturity,
      },
      correctiveActions: {
        onTimeRate: round(0.5 + seedUnit(`${cohortKey}|ot`) * 0.42, 3),
        openAvg: round(3 + seedUnit(`${cohortKey}|op`) * 12, 1),
        overdueCountAvg: round(0.8 + seedUnit(`${cohortKey}|od`) * 5, 1),
        aging,
      },
      competency: {
        currentRate: competencyTrend[competencyTrend.length - 1]?.currentRate ?? 0.8,
        expiring30dRate:
          competencyTrend[competencyTrend.length - 1]?.expiring30dRate ?? 0.05,
        expiring60dRate: round(0.06 + seedUnit(`${cohortKey}|c60`) * 0.1, 3),
        expiring90dRate: round(0.08 + seedUnit(`${cohortKey}|c90`) * 0.12, 3),
        trend: competencyTrend,
      },
      regional: regions,
      workforceStability: {
        turnoverRate: round(0.08 + seedUnit(`${cohortKey}|to`) * 0.18, 3),
        tenureMedianYears: round(2 + seedUnit(`${cohortKey}|ten`) * 8, 1),
        contractorRatio: round(0.15 + seedUnit(`${cohortKey}|cr`) * 0.45, 3),
        overtimePressure: round(0.1 + seedUnit(`${cohortKey}|ot`) * 0.35, 3),
        retentionScore: Math.round(40 + seedUnit(`${cohortKey}|ret`) * 55),
      },
    };

    return {
      data: { cohort, metrics },
      meta,
    };
  }

  getCrossCompareDenied() {
    throw new BadRequestException({
      code: 'VISI_CROSS_DENIED',
      message:
        'Cross-category comparison requires explicit consent. Project and company planes stay isolated by default.',
    });
  }

  private parseQuery(raw: Record<string, string | undefined>): ProjectScaleQuery {
    try {
      assertSinglePlane('project', raw);
    } catch (e) {
      if (e instanceof PlaneIsolationError) {
        throw new BadRequestException({ code: e.code, message: e.message });
      }
      throw e;
    }

    const industry = raw.industry as IndustryCode | undefined;
    const projectType = (raw.projectType ?? raw.subtype) as
      | ProjectSubtype
      | undefined;
    const scale = raw.scale as ScaleBand | undefined;
    const period = raw.period;

    if (!industry || !INDUSTRIES.includes(industry)) {
      throw new BadRequestException({
        code: 'VISI_INVALID_INDUSTRY',
        message: 'Valid industry is required',
      });
    }
    if (!projectType || !PROJECT_SUBTYPES.includes(projectType)) {
      throw new BadRequestException({
        code: 'VISI_PLANE_MISMATCH',
        message:
          'Valid project type required (transmission|distribution|substation|civil|industrial|renewable)',
      });
    }
    try {
      assertSubtypeMatchesPlane('project', projectType);
    } catch (e) {
      if (e instanceof PlaneIsolationError) {
        throw new BadRequestException({ code: e.code, message: e.message });
      }
      throw e;
    }
    if (!scale || !SCALES.includes(scale)) {
      throw new BadRequestException({
        code: 'VISI_INVALID_SCALE',
        message: 'Valid scale required (small|medium|large|mega)',
      });
    }
    if (!period || !PERIOD_RE.test(period)) {
      throw new BadRequestException({
        code: 'VISI_INVALID_PERIOD',
        message: 'period must be YYYY-MM or YYYY-Qn',
      });
    }

    return { industry, projectType, scale, period };
  }

  private parseCompanyQuery(
    raw: Record<string, string | undefined>,
  ): CompanyScaleQuery {
    try {
      assertSinglePlane('company', raw);
    } catch (e) {
      if (e instanceof PlaneIsolationError) {
        throw new BadRequestException({ code: e.code, message: e.message });
      }
      throw e;
    }

    const industry = raw.industry as IndustryCode | undefined;
    const companyType = (raw.companyType ?? raw.subtype) as
      | CompanySubtype
      | undefined;
    const scale = raw.scale as ScaleBand | undefined;
    const period = raw.period;

    if (!industry || !INDUSTRIES.includes(industry)) {
      throw new BadRequestException({
        code: 'VISI_INVALID_INDUSTRY',
        message: 'Valid industry is required',
      });
    }
    if (!companyType || !COMPANY_SUBTYPES.includes(companyType)) {
      throw new BadRequestException({
        code: 'VISI_PLANE_MISMATCH',
        message:
          'Valid company type required (utility|epc|contractor|engineering_firm|maintenance_provider)',
      });
    }
    try {
      assertSubtypeMatchesPlane('company', companyType);
    } catch (e) {
      if (e instanceof PlaneIsolationError) {
        throw new BadRequestException({ code: e.code, message: e.message });
      }
      throw e;
    }
    if (!scale || !SCALES.includes(scale)) {
      throw new BadRequestException({
        code: 'VISI_INVALID_SCALE',
        message: 'Valid scale required (small|medium|large|mega)',
      });
    }
    if (!period || !PERIOD_RE.test(period)) {
      throw new BadRequestException({
        code: 'VISI_INVALID_PERIOD',
        message: 'period must be YYYY-MM or YYYY-Qn',
      });
    }

    return { industry, companyType, scale, period };
  }

  /** Privacy pipeline contribute — anonymize + normalize into plane store */
  contribute(body: {
    records?: unknown[];
    record?: unknown;
  }) {
    const records = Array.isArray(body.records)
      ? body.records
      : body.record
        ? [body.record]
        : [];
    return this.anonymizer.ingestMany(records as never[]);
  }

  anonymizerStats() {
    return this.anonymizer.stats();
  }
}
