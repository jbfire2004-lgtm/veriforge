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
  GlobalDeploymentPlaybookService,
  type DeploymentSection,
  type RegionCode,
  type RolloutPhase,
} from '../services/global-deployment-playbook.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/deployment')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeDeploymentController {
  constructor(private readonly playbook: GlobalDeploymentPlaybookService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.playbook.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.playbook.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus: data.criticalCount > 0 ? 'failed' : 'verified',
    });
  }

  @Get('section/:section')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  bySection(
    @Param('section') section: DeploymentSection,
    @Req() req: VeriForgeRequest,
  ) {
    return buildSuccess(this.playbook.listBySection(section), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get(':id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  get(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    return buildSuccess(this.playbook.get(id), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('rollout/advance')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  advanceRollout(
    @Body() body: { phase: RolloutPhase; tenantId?: string; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.playbook.advanceRollout(
      body.phase,
      userId,
      body.tenantId,
    );
    return buildSuccess(result, {
      userId,
      forgeStatus:
        result.milestone.status === 'critical' ? 'failed' : 'forged',
    });
  }

  @Post('localization/toggle/:id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  toggleLocale(
    @Param('id') id: string,
    @Body() body: { tenantId?: string; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.playbook.toggleLocale(id, userId, body.tenantId);
    return buildSuccess(result, {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('infrastructure/scale')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  scale(
    @Body() body: { region: RegionCode; tenantId?: string; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.playbook.scaleRegion(
      body.region,
      userId,
      body.tenantId,
    );
    return buildSuccess(result, {
      userId,
      forgeStatus: result.record.status === 'critical' ? 'failed' : 'forged',
    });
  }

  @Post('support/resolve/:id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  resolveTicket(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.playbook.resolveTicket(id, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('monitoring/refresh')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  refreshMonitoring(
    @Body() body: { tenantId?: string; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.playbook.refreshMonitoring(userId, body.tenantId);
    return buildSuccess(result, {
      userId,
      forgeStatus:
        result.monitoring.some((k) => k.critical) ? 'failed' : 'forged',
    });
  }
}
