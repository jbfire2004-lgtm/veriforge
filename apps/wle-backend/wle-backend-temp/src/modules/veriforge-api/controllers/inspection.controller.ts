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
  EquipmentInspectionService,
  type ChecklistResult,
  type DefectSeverity,
} from '../services/equipment-inspection.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/inspections')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeInspectionController {
  constructor(private readonly inspections: EquipmentInspectionService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.inspections.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.inspections.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus:
        data.criticalDefects > 0 || data.overdueInspections > 0
          ? 'failed'
          : 'verified',
    });
  }

  @Post('equipment')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  register(
    @Body()
    body: {
      name: string;
      type: string;
      serial: string;
      location: string;
      nextInspectionAt?: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.inspections.registerEquipment(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('schedule')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  schedule(
    @Body()
    body: {
      equipmentId: string;
      title: string;
      dueAt: string;
      assignee: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const item = this.inspections.scheduleInspection(body, userId);
    return buildSuccess(item, {
      userId,
      forgeStatus: item.status === 'overdue' ? 'failed' : 'forged',
    });
  }

  @Post('start')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  start(
    @Body()
    body: {
      equipmentId: string;
      scheduleId?: string | null;
      title: string;
      checklistLabels?: string[];
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.inspections.startInspection(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post(':id/checklist/:itemId')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  checklist(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() body: { result: ChecklistResult; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const inspection = this.inspections.setChecklistResult(
      id,
      itemId,
      body.result,
      userId,
    );
    return buildSuccess(inspection, {
      userId,
      forgeStatus: body.result === 'fail' ? 'failed' : 'forged',
    });
  }

  @Post('defects')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  defect(
    @Body()
    body: {
      equipmentId: string;
      inspectionId?: string | null;
      defectType: string;
      severity: DefectSeverity;
      description: string;
      photoName?: string | null;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const item = this.inspections.reportDefect(body, userId);
    return buildSuccess(item, {
      userId,
      forgeStatus: item.severity === 'critical' ? 'failed' : 'forged',
    });
  }

  @Post('certifications')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  certification(
    @Body()
    body: {
      equipmentId: string;
      name: string;
      issuer: string;
      expiresAt: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const item = this.inspections.addCertification(body, userId);
    return buildSuccess(item, {
      userId,
      forgeStatus: item.status === 'expired' ? 'failed' : 'forged',
    });
  }

  @Post(':id/maintenance')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  maintenance(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req) ?? 0;
    return buildSuccess(this.inspections.linkMaintenance(id, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post(':id/complete')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  complete(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req) ?? 0;
    const item = this.inspections.completeInspection(id, userId);
    return buildSuccess(item, {
      userId,
      forgeStatus: item.status === 'failed' ? 'failed' : 'verified',
    });
  }
}
