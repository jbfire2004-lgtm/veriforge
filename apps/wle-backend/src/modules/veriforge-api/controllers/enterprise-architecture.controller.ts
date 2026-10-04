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
  requireTenantId,
  resolveUserId,
  type VeriForgeRequest,
} from '../veriforge-request.util';
import {
  EnterpriseArchitectureService,
  type ArchitectureLayerId,
  type LayerHealth,
} from '../services/enterprise-architecture.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/enterprise-architecture')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeEnterpriseArchitectureController {
  constructor(private readonly architecture: EnterpriseArchitectureService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  overview(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const tenantId = requireTenantId(req);
    return buildSuccess(this.architecture.overview(tenantId), {
      userId,
      tenantId,
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const tenantId = requireTenantId(req);
    const data = this.architecture.analytics(userId, tenantId);
    return buildSuccess(data, {
      userId,
      tenantId,
      forgeStatus:
        data.criticalLayers > 0 || data.observabilityCritical > 0
          ? 'failed'
          : 'verified',
    });
  }

  @Post('layers/:id/health')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  setLayerHealth(
    @Param('id') id: ArchitectureLayerId,
    @Body()
    body: {
      health: LayerHealth;
      readiness: number;
      tenantId?: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const tenantId = requireTenantId(req);
    const layer = this.architecture.setLayerHealth(
      id,
      body.health,
      body.readiness,
      userId,
      tenantId,
    );
    return buildSuccess(layer, {
      userId,
      tenantId,
      forgeStatus: layer.health === 'critical' ? 'failed' : 'forged',
    });
  }

  @Post('services/:id/forge-flow')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  runForgeFlow(
    @Param('id') id: string,
    @Body() body: { tenantId?: string; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const tenantId = requireTenantId(req);
    const service = this.architecture.runForgeFlow(id, userId, tenantId);
    return buildSuccess(service, {
      userId,
      tenantId,
      forgeStatus:
        service.forgeFlow === 'verified'
          ? 'verified'
          : service.forgeFlow === 'failed'
            ? 'failed'
            : 'forged',
    });
  }

  @Post('infrastructure/scale')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  evaluateScaling(
    @Body() body: { tenantId?: string; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const tenantId = requireTenantId(req);
    return buildSuccess(this.architecture.evaluateScaling(userId, tenantId), {
      userId,
      tenantId,
      forgeStatus: 'forged',
    });
  }

  @Post('data/rls/verify')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  verifyRls(
    @Body() body: { tenantId?: string; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const tenantId = requireTenantId(req);
    const result = this.architecture.verifyRls(userId, tenantId);
    return buildSuccess(result, {
      userId,
      tenantId,
      forgeStatus: result.coverage >= 95 ? 'verified' : 'failed',
    });
  }

  @Post('observability/signals')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  appendSignal(
    @Body()
    body: {
      kind: 'log' | 'metric' | 'trace';
      name: string;
      value: number;
      unit: string;
      critical?: boolean;
      tenantId?: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const tenantId = requireTenantId(req);
    const signal = this.architecture.appendObservability(body, userId, tenantId);
    return buildSuccess(signal, {
      userId,
      tenantId,
      forgeStatus: signal.critical ? 'failed' : 'forged',
    });
  }
}
