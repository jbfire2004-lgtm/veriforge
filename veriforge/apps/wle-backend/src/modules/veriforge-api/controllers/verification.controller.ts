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
import { VerificationService } from '../services/verification.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/verification')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeVerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post(['forge-check', 'forgeCheck'])
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_START)
  forgeCheck(
    @Body() body: { targetId: string; checkType: string; userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const data = this.verificationService.forgeCheck(body);
    return buildSuccess(data, {
      userId: resolveUserId(req, body),
      forgeStatus: 'pending',
    });
  }

  @Get(['forge-status/:id', 'forgeStatus/:id'])
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_VIEW)
  forgeStatus(
    @Param('id') id: string,
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const data = this.verificationService.forgeStatus(id);
    return buildSuccess(data, {
      userId: resolveUserId(req),
      forgeStatus: data.forgeStatus === 'pending' ? 'pending' : 'verified',
    });
  }

  @Post('workflow/start')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_START)
  workflowStart(
    @Body() body: { workflowId: string; targetId: string; userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const data = this.verificationService.workflowStart(body);
    return buildSuccess(data, {
      userId: resolveUserId(req, body),
      forgeStatus: 'pending',
    });
  }

  @Post('workflow/complete')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_COMPLETE)
  workflowComplete(
    @Body()
    body: {
      verificationId: string;
      outcome: 'verified' | 'failed';
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const data = this.verificationService.workflowComplete(body);
    return buildSuccess(data, {
      userId: resolveUserId(req, body),
      forgeStatus: body.outcome === 'verified' ? 'verified' : 'failed',
    });
  }
}
