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
import { SafetyDigitalTwinService } from '../services/safety-digital-twin.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/digital-twin')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeDigitalTwinController {
  constructor(private readonly twin: SafetyDigitalTwinService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.twin.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.twin.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus: data.twinHealthScore < 70 ? 'failed' : 'verified',
    });
  }

  @Post('hazards/refresh')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  refreshHazards(
    @Body() body: { userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.twin.refreshHazards(userId);
    return buildSuccess(result, {
      userId,
      forgeStatus:
        result.hazards.some((h) => h.density >= 70) ? 'failed' : 'forged',
    });
  }

  @Post('equipment/:id/toggle')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  toggleEquipment(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.twin.toggleEquipment(id, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus:
        result.equipment.status === 'critical' ? 'failed' : 'forged',
    });
  }

  @Post('simulate')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  simulate(
    @Body() body: { originZoneId?: string; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.twin.runIncidentSimulation(
      userId,
      body.originZoneId,
    );
    return buildSuccess(result, {
      userId,
      forgeStatus: 'failed',
    });
  }

  @Post('simulate/clear')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  clearSimulation(
    @Body() body: { userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.twin.clearSimulation(userId);
    return buildSuccess(result, {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('controls/:id/boost')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  boostControl(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.twin.boostControl(id, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus:
        result.control.effectiveness < 70 ? 'failed' : 'forged',
    });
  }
}
