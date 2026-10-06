import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { API_V1_PREFIX } from '../../config/routes';
import type { SecurityActor } from '../../security/security.types';
import { HubIndustrySafetyService } from './hub-industry-safety.service';
import { VisiSelfVsIndustryService } from './visi-self-vs-industry.service';
import { VisiTrendEngineService } from './visi-trend-engine.service';

/**
 * VeriHub Industry Safety Intelligence
 * Separate project and company planes — never mixed by default.
 */
@Controller(`${API_V1_PREFIX}/hub/industry-safety`)
export class HubIndustrySafetyController {
  constructor(
    private readonly visi: HubIndustrySafetyService,
    private readonly trends: VisiTrendEngineService,
    private readonly selfVsIndustry: VisiSelfVsIndustryService,
  ) {}

  @Get('selectors')
  selectors() {
    return this.visi.getSelectors();
  }

  @Get('selectors/availability')
  selectorAvailability(
    @Query('entityType') entityType?: string,
    @Query('industry') industry?: string,
    @Query('period') period?: string,
  ) {
    return this.visi.getSelectorAvailability({
      entityType,
      industry,
      period,
    });
  }

  @Get('project/cohort')
  projectCohort(
    @Query('industry') industry?: string,
    @Query('projectType') projectType?: string,
    @Query('subtype') subtype?: string,
    @Query('scale') scale?: string,
    @Query('period') period?: string,
    @Query('entityType') entityType?: string,
    @Query('companyType') companyType?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.visi.getProjectCohort({
      industry,
      projectType,
      subtype,
      scale,
      period,
      entityType,
      companyType,
      companyId,
    });
  }

  @Get('company/cohort')
  companyCohort(
    @Query('industry') industry?: string,
    @Query('companyType') companyType?: string,
    @Query('subtype') subtype?: string,
    @Query('scale') scale?: string,
    @Query('period') period?: string,
    @Query('entityType') entityType?: string,
    @Query('projectType') projectType?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.visi.getCompanyCohort({
      industry,
      companyType,
      subtype,
      scale,
      period,
      entityType,
      projectType,
      projectId,
    });
  }

  @Get('cohort')
  cohort(
    @Query('industry') industry?: string,
    @Query('projectType') projectType?: string,
    @Query('subtype') subtype?: string,
    @Query('scale') scale?: string,
    @Query('period') period?: string,
    @Query('entityType') entityType?: string,
    @Query('companyType') companyType?: string,
    @Query('companyId') companyId?: string,
  ) {
    if (entityType === 'company') {
      return this.visi.getCompanyCohort({
        industry,
        companyType: companyType ?? subtype,
        subtype,
        scale,
        period,
        entityType: 'company',
      });
    }
    return this.visi.getProjectCohort({
      industry,
      projectType: projectType ?? subtype,
      subtype,
      scale,
      period,
      entityType: entityType ?? 'project',
      companyType,
      companyId,
    });
  }

  /**
   * Company vs Industry — authenticated.
   * Loads the signed-in company's metrics vs anonymized industry cohort
   * for the same industry · company type · scale (unless cross-* consent).
   */
  @Get('company/self-vs-industry')
  @UseGuards(JwtAuthGuard)
  companySelfVsIndustry(
    @Req() req: { user: SecurityActor },
    @Query('industry') industry?: string,
    @Query('companyType') companyType?: string,
    @Query('subtype') subtype?: string,
    @Query('scale') scale?: string,
    @Query('period') period?: string,
    @Query('crossCategory') crossCategory?: string,
    @Query('crossScale') crossScale?: string,
    @Query('entityType') entityType?: string,
    @Query('projectType') projectType?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.selfVsIndustry.getCompanySelfVsIndustry(req.user, {
      industry,
      companyType,
      subtype,
      scale,
      period,
      crossCategory,
      crossScale,
      entityType,
      projectType,
      projectId,
    });
  }

  /** Auto-resolved home industry / type / scale for the signed-in company */
  @Get('company/benchmark-profile')
  @UseGuards(JwtAuthGuard)
  companyBenchmarkProfile(@Req() req: { user: SecurityActor }) {
    return this.selfVsIndustry.getCompanyBenchmarkProfile(req.user);
  }

  /** Contribute raw records through anonymization & normalization engine */
  @Post('contribute')
  contribute(
    @Body()
    body: {
      records?: unknown[];
      record?: unknown;
    },
  ) {
    return this.visi.contribute(body);
  }

  @Get('anonymizer/stats')
  anonymizerStats() {
    return this.visi.anonymizerStats();
  }

  // ── Industry Trend Engine ──────────────────────────────────────────

  @Get('trends')
  trendsFull(
    @Query('entityType') entityType?: string,
    @Query('industry') industry?: string,
    @Query('subtype') subtype?: string,
    @Query('projectType') projectType?: string,
    @Query('companyType') companyType?: string,
    @Query('scale') scale?: string,
    @Query('period') period?: string,
    @Query('horizon') horizon?: string,
  ) {
    return this.trends.analyzeFromQuery({
      entityType,
      industry,
      subtype: subtype ?? projectType ?? companyType,
      projectType,
      companyType,
      scale,
      period,
      horizon,
    });
  }

  @Get('metrics/heca')
  metricsHeca(
    @Query('entityType') entityType?: string,
    @Query('industry') industry?: string,
    @Query('subtype') subtype?: string,
    @Query('projectType') projectType?: string,
    @Query('companyType') companyType?: string,
    @Query('scale') scale?: string,
    @Query('period') period?: string,
  ) {
    return this.trends.heca({
      entityType,
      industry,
      subtype: subtype ?? projectType ?? companyType,
      projectType,
      companyType,
      scale,
      period,
    });
  }

  @Get('metrics/trif-ltif')
  metricsTrifLtif(
    @Query('entityType') entityType?: string,
    @Query('industry') industry?: string,
    @Query('subtype') subtype?: string,
    @Query('projectType') projectType?: string,
    @Query('companyType') companyType?: string,
    @Query('scale') scale?: string,
    @Query('period') period?: string,
  ) {
    return this.trends.trifLtif({
      entityType,
      industry,
      subtype: subtype ?? projectType ?? companyType,
      projectType,
      companyType,
      scale,
      period,
    });
  }

  @Get('metrics/leading')
  metricsLeading(
    @Query('entityType') entityType?: string,
    @Query('industry') industry?: string,
    @Query('subtype') subtype?: string,
    @Query('projectType') projectType?: string,
    @Query('companyType') companyType?: string,
    @Query('scale') scale?: string,
    @Query('period') period?: string,
  ) {
    return this.trends.leading({
      entityType,
      industry,
      subtype: subtype ?? projectType ?? companyType,
      projectType,
      companyType,
      scale,
      period,
    });
  }

  @Get('metrics/seasonal')
  metricsSeasonal(
    @Query('entityType') entityType?: string,
    @Query('industry') industry?: string,
    @Query('subtype') subtype?: string,
    @Query('projectType') projectType?: string,
    @Query('companyType') companyType?: string,
    @Query('scale') scale?: string,
    @Query('period') period?: string,
    @Query('metric') metric?: string,
  ) {
    return this.trends.seasonal({
      entityType,
      industry,
      subtype: subtype ?? projectType ?? companyType,
      projectType,
      companyType,
      scale,
      period,
      metric,
    });
  }

  @Get('metrics/root-cause')
  metricsRootCause(
    @Query('entityType') entityType?: string,
    @Query('industry') industry?: string,
    @Query('subtype') subtype?: string,
    @Query('projectType') projectType?: string,
    @Query('companyType') companyType?: string,
    @Query('scale') scale?: string,
    @Query('period') period?: string,
  ) {
    return this.trends.rootCause({
      entityType,
      industry,
      subtype: subtype ?? projectType ?? companyType,
      projectType,
      companyType,
      scale,
      period,
    });
  }

  @Get('metrics/workforce')
  metricsWorkforce(
    @Query('entityType') entityType?: string,
    @Query('industry') industry?: string,
    @Query('subtype') subtype?: string,
    @Query('projectType') projectType?: string,
    @Query('companyType') companyType?: string,
    @Query('scale') scale?: string,
    @Query('period') period?: string,
  ) {
    return this.trends.workforce({
      entityType,
      industry,
      subtype: subtype ?? projectType ?? companyType,
      projectType,
      companyType,
      scale,
      period,
    });
  }

  @Post('predictive/risk')
  predictiveRisk(
    @Body()
    body: {
      entityType?: string;
      industry?: string;
      subtype?: string;
      projectType?: string;
      companyType?: string;
      scale?: string;
      period?: string;
      horizon?: string;
    },
  ) {
    return this.trends.predictive({
      entityType: body.entityType,
      industry: body.industry,
      subtype: body.subtype ?? body.projectType ?? body.companyType,
      projectType: body.projectType,
      companyType: body.companyType,
      scale: body.scale,
      period: body.period,
      horizon: body.horizon,
    });
  }

  @Post('trends/cross-compare')
  trendsCrossCompare(
    @Body()
    body: {
      project?: Record<string, string | undefined>;
      company?: Record<string, string | undefined>;
      explicitConsent?: boolean;
      permissionGranted?: boolean;
    },
  ) {
    return this.trends.crossCompareTrends({
      project: body.project ?? {},
      company: body.company ?? {},
      explicitConsent: body.explicitConsent,
      permissionGranted: body.permissionGranted,
    });
  }

  @Post('cross-compare')
  crossCompare() {
    return this.visi.getCrossCompareDenied();
  }
}
