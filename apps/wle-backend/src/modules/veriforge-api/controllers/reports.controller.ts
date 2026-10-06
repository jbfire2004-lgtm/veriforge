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
  ExecutiveReportingService,
  type RegionCode,
  type ReportType,
} from '../services/executive-reporting.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/reports')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeReportsController {
  constructor(private readonly reports: ExecutiveReportingService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.reports.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.reports.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus: data.criticalCount > 0 ? 'failed' : 'verified',
    });
  }

  @Get('type/:type')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  byType(@Param('type') type: ReportType, @Req() req: VeriForgeRequest) {
    return buildSuccess(this.reports.listByType(type), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get(':id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  get(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    return buildSuccess(this.reports.get(id), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('generate')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  generate(
    @Body()
    body: {
      type: ReportType;
      title?: string;
      region?: RegionCode;
      tenantId?: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.reports.generate(body, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus: result.report.status === 'critical' ? 'failed' : 'forged',
    });
  }

  @Post('export/:id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  export(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.reports.export(id, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus: result.report.status === 'critical' ? 'failed' : 'forged',
    });
  }
}
