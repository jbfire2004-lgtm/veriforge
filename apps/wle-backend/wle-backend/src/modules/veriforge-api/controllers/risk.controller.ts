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
  RiskAssessmentService,
  type ControlType,
  type HazardCategory,
} from '../services/risk-assessment.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/risk')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeRiskController {
  constructor(private readonly risk: RiskAssessmentService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  list(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.risk.list(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    return buildSuccess(this.risk.analytics(userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Get('matrix')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  matrix(@Req() req: VeriForgeRequest) {
    return buildSuccess(
      { matrix: this.risk.matrix() },
      {
        userId: resolveUserId(req),
        forgeStatus: 'verified',
      },
    );
  }

  @Get(':id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  getById(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    return buildSuccess(this.risk.getById(id), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('identify')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  identify(
    @Body()
    body: {
      hazardType: string;
      description: string;
      location: string;
      category: HazardCategory;
      likelihood: number;
      severity: number;
      evidenceFileName?: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const entry = this.risk.identify(body, userId);
    return buildSuccess(entry, {
      userId,
      forgeStatus:
        entry.band === 'high' || entry.band === 'critical' ? 'failed' : 'forged',
    });
  }

  @Post(':id/score')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  score(
    @Param('id') id: string,
    @Body() body: { likelihood: number; severity: number; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const entry = this.risk.score(id, body, userId);
    return buildSuccess(entry, {
      userId,
      forgeStatus:
        entry.band === 'high' || entry.band === 'critical' ? 'failed' : 'forged',
    });
  }

  @Post(':id/controls')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  addControl(
    @Param('id') id: string,
    @Body()
    body: {
      type: ControlType;
      name: string;
      description?: string;
      implemented?: boolean;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.risk.addControl(id, body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post(':id/controls/:controlId/toggle')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  toggleControl(
    @Param('id') id: string,
    @Param('controlId') controlId: string,
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req) ?? 0;
    return buildSuccess(this.risk.toggleControl(id, controlId, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post(':id/actions')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  addAction(
    @Param('id') id: string,
    @Body()
    body: {
      name: string;
      responsiblePerson: string;
      dueDate: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.risk.addAction(id, body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post(':id/actions/:actionId/complete')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  completeAction(
    @Param('id') id: string,
    @Param('actionId') actionId: string,
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req) ?? 0;
    return buildSuccess(this.risk.completeAction(id, actionId, userId), {
      userId,
      forgeStatus: 'verified',
    });
  }
}
