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
  FieldOperationsService,
  type HazardRisk,
  type InspectionStatus,
  type ZoneTone,
} from '../services/field-operations.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/field-operations')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeFieldOperationsController {
  constructor(private readonly field: FieldOperationsService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.field.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.field.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus:
        data.criticalHazards > 0 || data.overdueTasks > 0
          ? 'failed'
          : 'verified',
    });
  }

  @Post('tasks')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  assignTask(
    @Body()
    body: {
      name: string;
      location: string;
      hazards: string;
      equipment: string;
      dueAt: string;
      lat?: number;
      lng?: number;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const task = this.field.assignTask(body, userId);
    return buildSuccess(task, {
      userId,
      forgeStatus: task.status === 'overdue' ? 'failed' : 'forged',
    });
  }

  @Post('tasks/:id/bump')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  bumpTask(
    @Param('id') id: string,
    @Body() body: { delta?: number; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.field.bumpTask(id, body.delta ?? 15, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('check-ins')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  checkIn(
    @Body()
    body: {
      taskId: string;
      lat?: number;
      lng?: number;
      location?: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.field.checkIn(body, userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Post('hazards')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  raiseHazard(
    @Body()
    body: {
      taskId?: string | null;
      name: string;
      risk: HazardRisk;
      location: string;
      description: string;
      lat?: number;
      lng?: number;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const hazard = this.field.raiseHazard(body, userId);
    return buildSuccess(hazard, {
      userId,
      forgeStatus:
        hazard.risk === 'critical' || hazard.risk === 'high'
          ? 'failed'
          : 'forged',
    });
  }

  @Post('equipment')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  trackEquipment(
    @Body()
    body: {
      taskId?: string | null;
      type: string;
      serial: string;
      inspectionStatus?: InspectionStatus;
      usageHours?: number;
      location: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const row = this.field.trackEquipment(body, userId);
    return buildSuccess(row, {
      userId,
      forgeStatus: row.inspectionStatus === 'overdue' ? 'failed' : 'forged',
    });
  }

  @Post('equipment/:id/usage')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  bumpUsage(
    @Param('id') id: string,
    @Body() body: { hours?: number; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.field.bumpEquipmentUsage(id, body.hours ?? 1, userId),
      { userId, forgeStatus: 'forged' },
    );
  }

  @Post('tasks/:id/forge-check')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  runForgeCheck(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req) ?? 0;
    const verification = this.field.runForgeCheck(id, userId);
    return buildSuccess(verification, {
      userId,
      forgeStatus:
        verification.forgeStatus === 'Pass'
          ? 'verified'
          : verification.forgeStatus === 'Fail'
            ? 'failed'
            : 'pending',
    });
  }

  @Post('zones')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  addZone(
    @Body()
    body: {
      name: string;
      tone: ZoneTone;
      location: string;
      lat?: number;
      lng?: number;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.field.addZone(body, userId), {
      userId,
      forgeStatus: body.tone === 'restricted' ? 'failed' : 'forged',
    });
  }

  @Post('routes')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  addRoute(
    @Body()
    body: {
      name: string;
      fromZone: string;
      toZone: string;
      restricted?: boolean;
      location: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.field.addRoute(body, userId), {
      userId,
      forgeStatus: body.restricted ? 'failed' : 'forged',
    });
  }

  @Post('logs')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  addLog(
    @Body()
    body: {
      taskId?: string | null;
      message: string;
      location: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.field.addLogEntry(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }
}
