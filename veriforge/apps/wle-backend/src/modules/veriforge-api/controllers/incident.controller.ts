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
import { Request } from 'express';
import { buildSuccess } from '../veriforge-response';
import { VeriForgeExceptionFilter } from '../veriforge-exception.filter';
import { resolveUserId } from '../veriforge-request.util';
import {
  IncidentService,
  type IncidentSeverity,
} from '../services/incident.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/incidents')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeIncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  list(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.incidentService.list(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  analytics(@Req() req: Request & { user?: { id?: number } }) {
    const userId = resolveUserId(req);
    return buildSuccess(this.incidentService.analytics(userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Get(':id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  getById(
    @Param('id') id: string,
    @Req() req: Request & { user?: { id?: number } },
  ) {
    return buildSuccess(this.incidentService.getById(id), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('create')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  create(
    @Body()
    body: {
      title: string;
      description: string;
      location: string;
      severity: IncidentSeverity;
      involvedPersonnel: string[];
      evidenceFileName?: string;
      evidenceFormat?: string;
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const incident = this.incidentService.create(body, userId);
    return buildSuccess(incident, {
      userId,
      forgeStatus: incident.severity === 'critical' ? 'failed' : 'forged',
    });
  }

  @Post(':id/assign')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  assign(
    @Param('id') id: string,
    @Body() body: { investigator: string; userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.incidentService.assignInvestigator(id, body.investigator, userId),
      {
        userId,
        forgeStatus: 'forged',
      },
    );
  }

  @Post(':id/evidence')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  evidence(
    @Param('id') id: string,
    @Body() body: { fileName: string; format: string; userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.incidentService.uploadEvidence(id, body, userId), {
      userId,
      forgeStatus: 'pending',
    });
  }

  @Post(':id/advance')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  advance(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.incidentService.advanceInvestigation(id, userId), {
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
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.incidentService.addCorrectiveAction(id, body, userId),
      {
        userId,
        forgeStatus: 'forged',
      },
    );
  }

  @Post(':id/actions/:actionId/complete')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  completeAction(
    @Param('id') id: string,
    @Param('actionId') actionId: string,
    @Body() body: { userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.incidentService.completeCorrectiveAction(id, actionId, userId),
      {
        userId,
        forgeStatus: 'verified',
      },
    );
  }
}
