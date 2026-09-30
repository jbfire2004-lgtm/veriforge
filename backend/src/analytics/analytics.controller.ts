import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

/** Tolerant integer parser for optional query params (older NestJS lacks `ParseIntPipe({ optional: true })`). */
function parseOptionalInt(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('overview')
  overview() {
    return this.analytics.overview();
  }

  @Get('incidents/severity')
  incidentsBySeverity() {
    return this.analytics.incidentsBySeverity();
  }

  @Get('incidents/timeline')
  incidentsTimeline() {
    return this.analytics.incidentsTimeline();
  }

  @Get('training/expiry')
  trainingExpiry() {
    return this.analytics.trainingExpirySummary();
  }

  @Get('companies/risk')
  companyRisk() {
    return this.analytics.companyRiskRanking();
  }

  // Recent uploads — used by the workspace dashboard.
  @Get('recent')
  recent(@Query('limit') limitRaw?: string) {
    return this.analytics.recent(parseOptionalInt(limitRaw) ?? 5);
  }
}
