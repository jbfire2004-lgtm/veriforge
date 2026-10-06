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
import { ComplianceService } from '../services/compliance.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/compliance')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('requirements')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  requirements(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.complianceService.listRequirements(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('requirements/create')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  createRequirement(
    @Body()
    body: {
      name: string;
      category: string;
      description: string;
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.complianceService.createRequirement(body, userId),
      {
        userId,
        forgeStatus: 'forged',
      },
    );
  }

  @Post('requirements/update')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  updateRequirements(
    @Body()
    body: {
      id: string;
      enabled?: boolean;
      name?: string;
      description?: string;
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.complianceService.updateRequirement(body, userId),
      {
        userId,
        forgeStatus: 'forged',
      },
    );
  }

  @Get('assignments')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  assignments(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.complianceService.listAssignments(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('assignments/create')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  assignRequirement(
    @Body()
    body: {
      requirementId: string;
      targetType: 'user' | 'role' | 'department';
      targetId: string;
      targetLabel: string;
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.complianceService.assignRequirement(body, userId),
      {
        userId,
        forgeStatus: 'forged',
      },
    );
  }

  @Get('documents')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  documents(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.complianceService.listDocuments(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('documents/upload')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  uploadDocument(
    @Body()
    body: {
      requirementId: string;
      fileName: string;
      format: string;
      expiresAt?: string | null;
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.complianceService.uploadDocument(body, userId), {
      userId,
      forgeStatus: 'pending',
    });
  }

  @Post('documents/:id/verify')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  verifyDocument(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.complianceService.verifyDocument(id, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus:
        result.forgeStatus === 'Pass'
          ? 'verified'
          : result.forgeStatus === 'Fail'
          ? 'failed'
          : 'pending',
    });
  }

  @Get('score')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  score(@Req() req: Request & { user?: { id?: number } }) {
    const userId = resolveUserId(req);
    return buildSuccess(this.complianceService.score(userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Post('workflow/run')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  runWorkflow(
    @Body() body: { userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.complianceService.runWorkflowAutomation(userId);
    return buildSuccess(result, {
      userId,
      forgeStatus: result.forgeStatus as 'verified' | 'failed',
    });
  }

  @Get('audit/logs')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_VIEW)
  auditLogs(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.complianceService.listAuditLogs(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }
}
