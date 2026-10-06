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
  EmergencyResponseService,
  type EmergencySeverity,
  type EmergencyStatus,
  type EmergencyType,
  type MessagePriority,
  type MusterStatus,
  type ResponseActionStatus,
  type ResponseActionType,
  type RouteStatus,
} from '../services/emergency-response.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/emergency')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeEmergencyController {
  constructor(private readonly emergency: EmergencyResponseService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.emergency.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.emergency.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus: data.criticalCount > 0 ? 'failed' : 'verified',
    });
  }

  @Post('alerts')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  raiseAlert(
    @Body()
    body: {
      type: EmergencyType;
      title: string;
      description: string;
      severity: EmergencySeverity;
      location: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const alert = this.emergency.raiseAlert(body, userId);
    return buildSuccess(alert, {
      userId,
      forgeStatus:
        alert.severity === 'critical' || alert.severity === 'high'
          ? 'failed'
          : 'forged',
    });
  }

  @Post('alerts/:id/response')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  updateResponse(
    @Param('id') id: string,
    @Body()
    body: {
      responsePercent?: number;
      status?: EmergencyStatus;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.emergency.updateResponse(id, body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('alerts/:id/escalate')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  escalate(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req) ?? 0;
    return buildSuccess(this.emergency.escalate(id, userId), {
      userId,
      forgeStatus: 'failed',
    });
  }

  @Post('alerts/:id/actions')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  addAction(
    @Param('id') id: string,
    @Body()
    body: {
      action: ResponseActionType;
      label: string;
      assignee: string;
      status?: ResponseActionStatus;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.emergency.addAction(id, body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('actions/:actionId/complete')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  completeAction(
    @Param('actionId') actionId: string,
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req) ?? 0;
    return buildSuccess(this.emergency.completeAction(actionId, userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Post('alerts/:id/messages')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  postMessage(
    @Param('id') id: string,
    @Body()
    body: {
      sender: string;
      body: string;
      priority?: MessagePriority;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.emergency.postMessage(id, body, userId), {
      userId,
      forgeStatus: body.priority === 'priority' ? 'failed' : 'forged',
    });
  }

  @Post('muster/:personId')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  updateMuster(
    @Param('personId') personId: string,
    @Body() body: { status: MusterStatus; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.emergency.updateMuster(personId, body.status, userId),
      {
        userId,
        forgeStatus: body.status === 'missing' ? 'failed' : 'verified',
      },
    );
  }

  @Post('routes/:routeId')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  setRoute(
    @Param('routeId') routeId: string,
    @Body() body: { status: RouteStatus; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.emergency.setRouteStatus(routeId, body.status, userId),
      {
        userId,
        forgeStatus:
          body.status === 'blocked' || body.status === 'unsafe'
            ? 'failed'
            : 'verified',
      },
    );
  }

  @Post('drills')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  scheduleDrill(
    @Body()
    body: {
      title: string;
      type: EmergencyType;
      scheduledAt: string;
      readiness?: number;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const drill = this.emergency.scheduleDrill(body, userId);
    return buildSuccess(drill, {
      userId,
      forgeStatus: drill.status === 'overdue' ? 'failed' : 'forged',
    });
  }

  @Post('drills/:id/bump')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  bumpDrill(
    @Param('id') id: string,
    @Body() body: { delta?: number; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.emergency.bumpDrill(id, body.delta ?? 10, userId),
      { userId, forgeStatus: 'forged' },
    );
  }
}
