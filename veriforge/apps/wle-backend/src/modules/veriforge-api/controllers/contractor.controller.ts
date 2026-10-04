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
  ContractorService,
  type ContractorRole,
} from '../services/contractor.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/contractors')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeContractorController {
  constructor(private readonly contractors: ContractorService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  list(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.contractors.list(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  analytics(@Req() req: Request & { user?: { id?: number } }) {
    const userId = resolveUserId(req);
    return buildSuccess(this.contractors.analytics(userId), {
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
    return buildSuccess(this.contractors.getById(id), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('onboard')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  onboard(
    @Body()
    body: {
      firstName: string;
      lastName: string;
      email: string;
      companyId: string;
      companyName: string;
      role: ContractorRole;
      certifications?: string[];
      documentName?: string;
      documentType?: 'certification' | 'license' | 'safety_training';
      expiresAt?: string | null;
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const contractor = this.contractors.onboard(body, userId);
    return buildSuccess(contractor, {
      userId,
      forgeStatus: contractor.complianceScore >= 80 ? 'verified' : 'pending',
    });
  }

  @Post(':id/documents')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  uploadDocument(
    @Param('id') id: string,
    @Body()
    body: {
      type: 'certification' | 'license' | 'safety_training';
      name: string;
      expiresAt?: string | null;
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.contractors.uploadDocument(id, body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post(':id/training/assign')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_ASSIGN)
  assignTraining(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.contractors.assignTraining(id, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post(':id/training/progress')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_UPDATE)
  updateTrainingProgress(
    @Param('id') id: string,
    @Body() body: { moduleId: string; progress: number; userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.contractors.updateTrainingProgress(
        id,
        body.moduleId,
        body.progress,
        userId,
      ),
      {
        userId,
        forgeStatus: 'forged',
      },
    );
  }

  @Post(':id/forge-check')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_START)
  forgeCheck(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.contractors.runForgeCheck(id, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus:
        result.contractor.forgeStatus === 'Pass'
          ? 'verified'
          : result.contractor.forgeStatus === 'Fail'
            ? 'failed'
            : 'pending',
    });
  }
}
