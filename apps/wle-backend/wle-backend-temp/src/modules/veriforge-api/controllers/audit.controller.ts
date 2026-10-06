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
  AuditEngineService,
  type AuditCategory,
  type AuditSeverity,
} from '../services/audit-engine.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/audit')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeAuditController {
  constructor(private readonly auditEngine: AuditEngineService) {}

  @Get('entries')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_VIEW)
  entries(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.auditEngine.listEntries(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('ingest')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  ingest(
    @Body()
    body: {
      source: AuditCategory;
      action: string;
      details: string;
      severity?: AuditSeverity;
      requirementId?: string | null;
      findingId?: string | null;
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const entry = this.auditEngine.ingest(body, userId);
    return buildSuccess(entry, {
      userId,
      forgeStatus: entry.severity === 'critical' ? 'failed' : 'forged',
    });
  }

  @Get('evidence')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_VIEW)
  evidence(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.auditEngine.listEvidence(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('evidence/upload')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  uploadEvidence(
    @Body()
    body: {
      entryId: string;
      fileName: string;
      format: string;
      requirementId?: string | null;
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.auditEngine.uploadEvidence(body, userId), {
      userId,
      forgeStatus: 'pending',
    });
  }

  @Get('score')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_VIEW)
  score(@Req() req: Request & { user?: { id?: number } }) {
    const userId = resolveUserId(req);
    return buildSuccess(this.auditEngine.score(userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Get('trail')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_VIEW)
  trail(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.auditEngine.trail(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('actions')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_VIEW)
  actions(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.auditEngine.listCorrectiveActions(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('actions/link')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  linkAction(
    @Body()
    body: {
      entryId: string;
      name: string;
      owner: string;
      dueDate: string;
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.auditEngine.linkCorrectiveAction(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('actions/:id/complete')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  completeAction(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.auditEngine.completeCorrectiveAction(id, userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Post('reports/export')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_VIEW)
  exportReport(
    @Body() body: { userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.auditEngine.exportReport(userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Get('reports')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_VIEW)
  reports(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.auditEngine.listReports(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }
}
