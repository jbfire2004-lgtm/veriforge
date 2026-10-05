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
  SiteSafetyPlanningService,
  type ControlStatus,
  type ControlType,
  type HazardRisk,
  type PermitType,
  type WorkerReadiness,
} from '../services/site-safety-planning.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/site-safety')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeSiteSafetyController {
  constructor(private readonly siteSafety: SiteSafetyPlanningService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.siteSafety.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.siteSafety.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus:
        data.criticalHazards > 0 || data.expiredPermits > 0
          ? 'failed'
          : 'verified',
    });
  }

  @Post('sites')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  createSite(
    @Body() body: { name: string; location: string; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.siteSafety.createSite(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('hazards')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  addHazard(
    @Body()
    body: {
      siteId: string;
      name: string;
      risk: HazardRisk;
      description: string;
      x?: number;
      y?: number;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const hazard = this.siteSafety.addHazard(body, userId);
    return buildSuccess(hazard, {
      userId,
      forgeStatus:
        hazard.risk === 'critical' || hazard.risk === 'high'
          ? 'failed'
          : 'forged',
    });
  }

  @Post('controls')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  addControl(
    @Body()
    body: {
      siteId: string;
      hazardId?: string | null;
      name: string;
      type: ControlType;
      status?: ControlStatus;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const control = this.siteSafety.addControl(body, userId);
    return buildSuccess(control, {
      userId,
      forgeStatus: control.status === 'missing' ? 'failed' : 'forged',
    });
  }

  @Post('controls/:id/status')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  setControlStatus(
    @Param('id') id: string,
    @Body() body: { status: ControlStatus; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.siteSafety.setControlStatus(id, body.status, userId),
      {
        userId,
        forgeStatus: body.status === 'missing' ? 'failed' : 'verified',
      },
    );
  }

  @Post('procedures')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  addProcedure(
    @Body()
    body: {
      siteId: string;
      title: string;
      criticalSteps: string[];
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.siteSafety.addProcedure(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('routes')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  addRoute(
    @Body()
    body: {
      siteId: string;
      name: string;
      fromZone: string;
      toZone: string;
      restricted?: boolean;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.siteSafety.addRoute(body, userId), {
      userId,
      forgeStatus: body.restricted ? 'failed' : 'forged',
    });
  }

  @Post('workers')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  assignWorker(
    @Body()
    body: {
      siteId: string;
      name: string;
      role: string;
      readiness?: WorkerReadiness;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const worker = this.siteSafety.assignWorker(body, userId);
    return buildSuccess(worker, {
      userId,
      forgeStatus: worker.readiness === 'compliant' ? 'verified' : 'failed',
    });
  }

  @Post('briefs')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  createBrief(
    @Body()
    body: {
      siteId: string;
      jobScope: string;
      hazards: string;
      controls: string;
      roles: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.siteSafety.createBrief(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('briefs/:id/acknowledge')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  acknowledgeBrief(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req) ?? 0;
    return buildSuccess(this.siteSafety.acknowledgeBrief(id, userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Post('permits')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  issuePermit(
    @Body()
    body: {
      siteId: string;
      type: PermitType;
      title: string;
      expiresAt: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const permit = this.siteSafety.issuePermit(body, userId);
    return buildSuccess(permit, {
      userId,
      forgeStatus: permit.status === 'expired' ? 'failed' : 'forged',
    });
  }
}
