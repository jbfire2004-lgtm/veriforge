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
import { MultiSiteCommandCenterService } from '../services/multi-site-command-center.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/command-center')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeCommandCenterController {
  constructor(private readonly command: MultiSiteCommandCenterService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.command.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.command.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus: data.criticalSites > 0 ? 'failed' : 'verified',
    });
  }

  @Get('sites')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  sites(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.command.listSites(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('sites/:id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  site(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    return buildSuccess(this.command.getSite(id), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('alerts')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  alerts(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.command.listAlerts(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('incidents')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  incidents(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.command.listIncidents(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('alerts/:id/ack')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  ackAlert(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.command.acknowledgeAlert(id, userId);
    return buildSuccess(result, { userId, forgeStatus: 'forged' });
  }

  @Post('incidents/:id/escalate')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  escalate(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.command.escalateIncident(id, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus:
        result.incident.severity === 'critical' ? 'failed' : 'forged',
    });
  }

  @Post('sites/:id/refresh')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  refreshSite(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.command.refreshSite(id, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus: result.site.status === 'critical' ? 'failed' : 'forged',
    });
  }

  @Post('sites/:id/emergency')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  toggleEmergency(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.command.toggleEmergency(id, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus: result.site.emergencyActive ? 'failed' : 'forged',
    });
  }
}
