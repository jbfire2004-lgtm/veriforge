import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { buildSuccess } from '../veriforge-response';
import { VeriForgeExceptionFilter } from '../veriforge-exception.filter';
import {
  resolveUserId,
  type VeriForgeRequest,
} from '../veriforge-request.util';
import {
  SafetyKpiIntelligenceService,
  type KpiCategory,
} from '../services/safety-kpi-intelligence.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/safety-kpis')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeSafetyKpiController {
  constructor(private readonly kpis: SafetyKpiIntelligenceService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.kpis.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.kpis.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus: data.criticalCount > 0 ? 'failed' : 'verified',
    });
  }

  @Post()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  defineKpi(
    @Body()
    body: {
      name: string;
      category: KpiCategory;
      formula: string;
      target?: number | null;
      currentValue?: number;
      baseline?: number;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const kpi = this.kpis.defineKpi(body, userId);
    return buildSuccess(kpi, {
      userId,
      forgeStatus:
        kpi.target === null || kpi.score < 70 ? 'failed' : 'forged',
    });
  }

  @Post('reports')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  createReport(
    @Body()
    body: {
      title: string;
      category?: KpiCategory | 'all';
      summary?: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.kpis.createReport(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('reports/:id/export')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  exportReport(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req) ?? 0;
    return buildSuccess(this.kpis.exportReport(id, userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Post(':id/score')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  scoreKpi(
    @Param('id') id: string,
    @Body()
    body: { currentValue: number; target?: number | null; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const kpi = this.kpis.scoreKpi(id, body, userId);
    return buildSuccess(kpi, {
      userId,
      forgeStatus: kpi.score < 70 ? 'failed' : 'verified',
    });
  }

  @Post(':id/bump')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  bumpKpi(
    @Param('id') id: string,
    @Body() body: { delta?: number; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const kpi = this.kpis.bumpKpi(id, body.delta ?? 5, userId);
    return buildSuccess(kpi, {
      userId,
      forgeStatus: kpi.score < 70 ? 'failed' : 'forged',
    });
  }

  @Post(':id/target')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  setTarget(
    @Param('id') id: string,
    @Body() body: { target: number | null; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const kpi = this.kpis.setTarget(id, body.target, userId);
    return buildSuccess(kpi, {
      userId,
      forgeStatus: kpi.target === null ? 'failed' : 'verified',
    });
  }

  @Post(':id/forecast')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  forecast(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req) ?? 0;
    const kpi = this.kpis.forecast(id, userId);
    return buildSuccess(kpi, {
      userId,
      forgeStatus:
        kpi.trend === 'down' && kpi.forecastValue < 70 ? 'failed' : 'verified',
    });
  }
}
