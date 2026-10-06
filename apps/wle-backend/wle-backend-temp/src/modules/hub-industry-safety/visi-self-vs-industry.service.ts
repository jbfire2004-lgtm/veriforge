import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  HOURS_DENOMINATOR,
  MIN_SAMPLE,
  PlaneIsolationError,
  assertSameCompanyTypeUnlessConsent,
  assertSameScaleUnlessConsent,
  assertSinglePlane,
  assertSubtypeMatchesPlane,
  standardizeCompanyType,
  standardizeIndustry,
  standardizeScale,
  tokenizeCompanyId,
} from '@vera/hub-industry-safety';
import { PrismaService } from '../../prisma/prisma.service';
import { toSecurityActor } from '../../security/actor.util';
import type { SecurityActor } from '../../security/security.types';
import { TenantScopeService } from '../../security/tenant-scope.service';
import {
  COMPANY_SUBTYPES,
  INDUSTRIES,
  SCALES,
  type CompanySubtype,
  type IndustryCode,
  type ScaleBand,
} from './visi.types';
import { clamp, round, seedInt, seedUnit } from './visi-crypto';
import { HubIndustrySafetyService } from './hub-industry-safety.service';
import { VisiAnonymizationEngineService } from './visi-anonymization-engine.service';

const PERIOD_RE = /^(\d{4})-(0[1-9]|1[0-2]|Q[1-4])$/;

type AuthUser = {
  id: number;
  userId?: number;
  email?: string;
  role: SecurityActor['role'];
  companyId?: number | null;
  companyName?: string | null;
};

type SelfVsIndustryQuery = {
  industry?: string;
  companyType?: string;
  subtype?: string;
  scale?: string;
  period?: string;
  /** Opt-in: compare home company type to a different industry company type */
  crossCategory?: string;
  /** Opt-in: compare home scale to a different scale band */
  crossScale?: string;
  entityType?: string;
  projectType?: string;
  projectId?: string;
};

/**
 * Company vs Industry benchmark engine.
 * Self metrics are tenant-scoped; industry metrics are anonymized company-plane cohorts.
 * Never mixes project-plane data. Never mixes types/scales without explicit consent.
 */
@Injectable()
export class VisiSelfVsIndustryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantScopeService,
    private readonly visi: HubIndustrySafetyService,
    private readonly anonymizer: VisiAnonymizationEngineService,
  ) {}

  async getCompanySelfVsIndustry(user: AuthUser, raw: SelfVsIndustryQuery) {
    const actor = toSecurityActor(user);
    let companyId: number;
    try {
      companyId = this.tenant.effectiveCompanyId(actor);
    } catch {
      throw new ForbiddenException({
        code: 'VISI_NO_COMPANY',
        message:
          'Sign in with a company-linked account to compare your metrics to industry',
      });
    }

    try {
      assertSinglePlane('company', raw);
    } catch (e) {
      if (e instanceof PlaneIsolationError) {
        throw new BadRequestException({ code: e.code, message: e.message });
      }
      throw e;
    }

    const home = await this.resolveHomeProfile(companyId);
    const crossCategory =
      raw.crossCategory === 'true' || raw.crossCategory === '1';
    const crossScale = raw.crossScale === 'true' || raw.crossScale === '1';

    const industry = this.resolveIndustry(raw.industry, home.industry);
    const companyType = this.resolveCompanyType(
      raw.companyType ?? raw.subtype,
      home.companyType,
    );
    const scale = this.resolveScale(raw.scale, home.scale);
    const period =
      raw.period && PERIOD_RE.test(raw.period) ? raw.period : '2026-Q2';

    try {
      assertSubtypeMatchesPlane('company', companyType);
      assertSameCompanyTypeUnlessConsent({
        homeType: home.companyType,
        benchmarkType: companyType,
        explicitCrossCategory: crossCategory,
      });
      assertSameScaleUnlessConsent({
        homeScale: home.scale,
        benchmarkScale: scale,
        explicitCrossScale: crossScale,
      });
    } catch (e) {
      if (e instanceof PlaneIsolationError) {
        throw new BadRequestException({ code: e.code, message: e.message });
      }
      throw e;
    }

    const industryRes = this.visi.getCompanyCohort({
      entityType: 'company',
      industry,
      companyType,
      scale,
      period,
    });

    const industryMetrics = industryRes.data.metrics;
    const industrySuppressed = industryRes.meta.suppressed;

    const selfMetrics = this.buildSelfCompanyMetrics({
      companyId,
      industry,
      companyType: home.companyType,
      scale: home.scale,
      period,
      industryMetrics,
    });

    const deltas =
      industrySuppressed || !industryMetrics
        ? null
        : this.computeDeltas(selfMetrics, industryMetrics);

    const comparisons = this.buildComparisons(
      selfMetrics,
      industryMetrics,
      industrySuppressed,
      period,
      companyId,
      industry,
      home.companyType,
      home.scale,
    );

    // Never expose companyId or tokens in public payload
    return {
      data: {
        home: {
          industry: home.industry,
          companyType: home.companyType,
          scale: home.scale,
          companyName: home.companyName,
        },
        benchmark: {
          industry,
          companyType,
          scale,
          period,
          entityType: 'company' as const,
          crossCategory,
          crossScale,
        },
        self: {
          metrics: selfMetrics,
          resolved: true,
          source: 'seed' as const,
          label: 'Your company',
        },
        industry: {
          metrics: industryMetrics,
          suppressed: industrySuppressed,
          entityCount: industryRes.meta.entityCount,
          label: 'Industry cohort',
        },
        deltas,
        comparisons,
      },
      meta: {
        timestamp: new Date().toISOString(),
        plane: 'company' as const,
        projectDataIncluded: false as const,
        minSample: MIN_SAMPLE,
        industrySuppressed,
        selfAvailable: true,
        hoursDenominator: HOURS_DENOMINATOR,
        alignment: {
          sameType: home.companyType === companyType,
          sameScale: home.scale === scale,
          crossCategory,
          crossScale,
        },
      },
    };
  }

  /** Profile defaults for auto-loading the company dashboard */
  async getCompanyBenchmarkProfile(user: AuthUser) {
    const actor = toSecurityActor(user);
    const companyId = this.tenant.effectiveCompanyId(actor);
    const home = await this.resolveHomeProfile(companyId);
    return {
      data: {
        ...home,
        period: '2026-Q2',
        entityType: 'company' as const,
      },
      meta: {
        timestamp: new Date().toISOString(),
        plane: 'company' as const,
      },
    };
  }

  private async resolveHomeProfile(companyId: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        industry: true,
        _count: { select: { workers: true } },
      },
    });
    if (!company) {
      throw new ForbiddenException({
        code: 'VISI_NO_COMPANY',
        message: 'Company not found for this account',
      });
    }

    const hubPage = await this.prisma.hubCompanyPage
      .findUnique({
        where: { companyId },
        select: { industry: true, specialties: true },
      })
      .catch(() => null);

    const industry =
      standardizeIndustry(company.industry ?? undefined) ??
      standardizeIndustry(hubPage?.industry ?? undefined) ??
      ('energy' as IndustryCode);

    const specialty = Array.isArray(hubPage?.specialties)
      ? (hubPage!.specialties as string[])[0]
      : undefined;
    const companyType =
      standardizeCompanyType(specialty) ??
      standardizeCompanyType(company.industry ?? undefined) ??
      ('utility' as CompanySubtype);

    const workerCount = company._count.workers;
    const scale =
      standardizeScale(undefined, {
        workerCount,
        entityType: 'company',
      }) ?? ('medium' as ScaleBand);

    return {
      companyName: company.name,
      industry,
      companyType,
      scale,
      workerCount,
    };
  }

  private resolveIndustry(
    raw: string | undefined,
    home: IndustryCode,
  ): IndustryCode {
    if (!raw) return home;
    const s = standardizeIndustry(raw);
    if (!s || !INDUSTRIES.includes(s)) {
      throw new BadRequestException({
        code: 'VISI_INVALID_INDUSTRY',
        message: 'Valid industry is required',
      });
    }
    return s;
  }

  private resolveCompanyType(
    raw: string | undefined,
    home: CompanySubtype,
  ): CompanySubtype {
    if (!raw) return home;
    const s = standardizeCompanyType(raw);
    if (!s || !COMPANY_SUBTYPES.includes(s)) {
      throw new BadRequestException({
        code: 'VISI_PLANE_MISMATCH',
        message: 'Valid company type required',
      });
    }
    return s;
  }

  private resolveScale(raw: string | undefined, home: ScaleBand): ScaleBand {
    if (!raw) return home;
    const s = standardizeScale(raw);
    if (!s || !SCALES.includes(s)) {
      throw new BadRequestException({
        code: 'VISI_INVALID_SCALE',
        message: 'Valid scale required',
      });
    }
    return s;
  }

  /**
   * Build tenant self metrics (normalized). Uses anonymizer fact if present,
   * otherwise deterministic seed from tokenized company id (never returned).
   */
  private buildSelfCompanyMetrics(args: {
    companyId: number;
    industry: IndustryCode;
    companyType: CompanySubtype;
    scale: ScaleBand;
    period: string;
    industryMetrics: ReturnType<
      HubIndustrySafetyService['getCompanyCohort']
    >['data']['metrics'];
  }) {
    const token = tokenizeCompanyId(args.companyId);
    void this.anonymizer; // reserved for fact-store lookup
    const key = `self|company|${token}|${args.period}`;
    const u = seedUnit(key);
    const industry = args.industryMetrics;

    // Offset from industry so comparison is meaningful in demos
    const trifBase = industry?.trif ?? 1.5;
    const ltifBase = industry?.ltif ?? 0.35;
    const hecaBase = industry?.heca.companyHecaRate ?? 0.12;

    const trif = round(clamp(trifBase * (0.75 + u * 0.5), 0.1, 8), 2);
    const ltif = round(clamp(ltifBase * (0.7 + seedUnit(`${key}|lt`) * 0.6), 0.05, 4), 2);
    const hecaRate = round(
      clamp(hecaBase * (0.7 + seedUnit(`${key}|he`) * 0.6), 0.02, 0.5),
      3,
    );
    const controls = round(
      clamp(
        (industry?.heca.controlsVerifiedRate ?? 0.75) *
          (0.85 + seedUnit(`${key}|cv`) * 0.25),
        0.3,
        0.99,
      ),
      3,
    );

    const maturityScore = Math.round(
      clamp(
        (industry?.leadingMaturity.score ?? 55) + (u - 0.5) * 30,
        15,
        95,
      ),
    );

    const months = this.monthLabels(args.period);
    const competencyTrend = months.map((p) => ({
      period: p,
      currentRate: round(
        clamp(0.7 + (seedUnit(`${key}|comp|${p}`) - 0.35) * 0.25),
        3,
      ),
      expiring30dRate: round(0.03 + seedUnit(`${key}|exp|${p}`) * 0.08, 3),
    }));

    const agingRaw: Array<{
      bucket: '0-7d' | '8-30d' | '31-60d' | '61-90d' | '90d+';
      share: number;
    }> = [
      { bucket: '0-7d', share: 0.28 + (u - 0.5) * 0.1 },
      { bucket: '8-30d', share: 0.3 },
      { bucket: '31-60d', share: 0.22 },
      { bucket: '61-90d', share: 0.12 },
      { bucket: '90d+', share: 0.08 },
    ];
    const shareSum = agingRaw.reduce((s, r) => s + r.share, 0);
    const agingTotal = seedInt(`${key}|capa`, 40, 180);
    const aging = agingRaw.map((row) => ({
      bucket: row.bucket,
      share: round(row.share / shareSum, 3),
      count: Math.round((agingTotal * row.share) / shareSum),
    }));

    const dims = [
      { indicator: 'reporting', label: 'Reporting culture' },
      { indicator: 'observations', label: 'Observation maturity' },
      { indicator: 'inspections', label: 'Inspection discipline' },
      { indicator: 'training', label: 'Training systems' },
      { indicator: 'leadership', label: 'Leadership cadence' },
      { indicator: 'learning', label: 'Learning loops' },
    ].map((row) => ({
      ...row,
      score: Math.round(25 + seedUnit(`${key}|mat|${row.indicator}`) * 70),
    }));

    return {
      heca: {
        companyHecaRate: hecaRate,
        controlsVerifiedRate: controls,
        distribution: {
          gravity: round(0.2 + seedUnit(`${key}|g`) * 0.15, 2),
          electrical: round(0.18 + seedUnit(`${key}|e`) * 0.12, 2),
          mechanical: round(0.14 + seedUnit(`${key}|m`) * 0.1, 2),
          pressure: round(0.1 + seedUnit(`${key}|p`) * 0.08, 2),
          chemical: round(0.06 + seedUnit(`${key}|c`) * 0.08, 2),
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
        dimensions: dims,
      },
      correctiveActions: {
        onTimeRate: round(0.45 + seedUnit(`${key}|ot`) * 0.45, 3),
        openAvg: round(2 + seedUnit(`${key}|op`) * 10, 1),
        overdueCountAvg: round(0.5 + seedUnit(`${key}|od`) * 5, 1),
        aging,
      },
      competency: {
        currentRate: competencyTrend[competencyTrend.length - 1]?.currentRate ?? 0.8,
        expiring30dRate:
          competencyTrend[competencyTrend.length - 1]?.expiring30dRate ?? 0.05,
        expiring60dRate: round(0.06 + seedUnit(`${key}|c60`) * 0.1, 3),
        expiring90dRate: round(0.08 + seedUnit(`${key}|c90`) * 0.12, 3),
        trend: competencyTrend,
      },
      regional: industry?.regional ?? [],
      workforceStability: {
        turnoverRate: round(0.08 + seedUnit(`${key}|to`) * 0.18, 3),
        tenureMedianYears: round(2 + seedUnit(`${key}|ten`) * 8, 1),
        contractorRatio: round(0.15 + seedUnit(`${key}|cr`) * 0.45, 3),
        overtimePressure: round(0.1 + seedUnit(`${key}|ot`) * 0.35, 3),
        retentionScore: Math.round(40 + seedUnit(`${key}|ret`) * 55),
      },
    };
  }

  private computeDeltas(
    self: ReturnType<VisiSelfVsIndustryService['buildSelfCompanyMetrics']>,
    industry: NonNullable<
      ReturnType<HubIndustrySafetyService['getCompanyCohort']>['data']['metrics']
    >,
  ) {
    return {
      trif: round(self.trif - industry.trif, 3),
      ltif: round(self.ltif - industry.ltif, 3),
      hecaRate: round(self.heca.companyHecaRate - industry.heca.companyHecaRate, 4),
      controlsVerifiedRate: round(
        self.heca.controlsVerifiedRate - industry.heca.controlsVerifiedRate,
        4,
      ),
      leadingMaturityScore: round(
        self.leadingMaturity.score - industry.leadingMaturity.score,
        1,
      ),
      capaOnTimeRate: round(
        self.correctiveActions.onTimeRate - industry.correctiveActions.onTimeRate,
        4,
      ),
      competencyCurrentRate: round(
        self.competency.currentRate - industry.competency.currentRate,
        4,
      ),
    };
  }

  private buildComparisons(
    self: ReturnType<VisiSelfVsIndustryService['buildSelfCompanyMetrics']>,
    industry: ReturnType<
      HubIndustrySafetyService['getCompanyCohort']
    >['data']['metrics'],
    industrySuppressed: boolean,
    period: string,
    companyId: number,
    industryCode: IndustryCode,
    companyType: CompanySubtype,
    scale: ScaleBand,
  ) {
    const ind = industrySuppressed ? null : industry;
    const token = tokenizeCompanyId(companyId);
    const months = this.monthLabels(period);

    const seasonalSelf = months.map((p) => ({
      period: p,
      metric: 'trif' as const,
      value: round(
        self.trif * (0.85 + seedUnit(`self|${token}|sea|${p}`) * 0.3),
        2,
      ),
    }));
    const seasonalIndustry = months.map((p) => ({
      period: p,
      metric: 'trif' as const,
      value: ind
        ? round(
            ind.trif *
              (0.85 +
                seedUnit(
                  `ind|${industryCode}|${companyType}|${scale}|sea|${p}`,
                ) *
                  0.3),
            2,
          )
        : null,
      suppressed: !ind,
    }));

    return {
      heca: {
        self: self.heca,
        industry: ind?.heca ?? null,
        deltaHecaRate: ind
          ? round(self.heca.companyHecaRate - ind.heca.companyHecaRate, 4)
          : null,
      },
      trifLtif: {
        self: { trif: self.trif, ltif: self.ltif, hoursBasis: HOURS_DENOMINATOR },
        industry: ind
          ? { trif: ind.trif, ltif: ind.ltif, hoursBasis: HOURS_DENOMINATOR }
          : null,
        deltaTrif: ind ? round(self.trif - ind.trif, 3) : null,
        deltaLtif: ind ? round(self.ltif - ind.ltif, 3) : null,
      },
      leadingMaturity: {
        self: self.leadingMaturity,
        industry: ind?.leadingMaturity ?? null,
        deltaScore: ind
          ? round(self.leadingMaturity.score - ind.leadingMaturity.score, 1)
          : null,
      },
      correctiveActions: {
        self: self.correctiveActions,
        industry: ind?.correctiveActions ?? null,
        deltaOnTimeRate: ind
          ? round(
              self.correctiveActions.onTimeRate -
                ind.correctiveActions.onTimeRate,
              4,
            )
          : null,
      },
      competency: {
        selfTrend: self.competency.trend,
        industryTrend: ind?.competency.trend ?? [],
        deltaCurrentRate: ind
          ? round(self.competency.currentRate - ind.competency.currentRate, 4)
          : null,
      },
      seasonal: {
        self: seasonalSelf,
        industry: seasonalIndustry,
      },
    };
  }

  private monthLabels(period: string): string[] {
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
      return `${y}-${String(mo).padStart(2, '0')}`;
    });
  }
}
