import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { buildSuccess } from '../veriforge-response';
import { VeriForgeExceptionFilter } from '../veriforge-exception.filter';
import { resolveUserId } from '../veriforge-request.util';
import { TrainingService } from '../services/training.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/training')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeTrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get('modules')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  modules(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.trainingService.modules(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('modules/:id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  moduleById(
    @Param('id') id: string,
    @Req() req: Request & { user?: { id?: number } },
  ) {
    return buildSuccess(this.trainingService.moduleById(id), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('modules/create')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_UPDATE)
  createModule(
    @Body()
    body: {
      title: string;
      description: string;
      category: string;
      durationMinutes: number;
      materialName?: string;
      materialFormat?: string;
      contentSections?: string[];
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.trainingService.createModule(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('modules/assign')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_ASSIGN)
  assign(
    @Body()
    body: {
      moduleId: string;
      userId: number;
      targetType?: 'user' | 'role' | 'department';
      targetId?: string;
      targetLabel?: string;
      dueAt?: string;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    return buildSuccess(this.trainingService.assign(body), {
      userId: resolveUserId(req, body) ?? body.userId,
      forgeStatus: 'forged',
    });
  }

  @Get('assignments')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  assignments(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.trainingService.listAssignments(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('assignments/:id/start')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  startDelivery(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.trainingService.startDelivery(id, userId), {
      userId,
      forgeStatus: 'pending',
    });
  }

  @Post('assignments/:id/progress')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  updateProgress(
    @Param('id') id: string,
    @Body() body: { progress: number; sectionIndex?: number; userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.trainingService.updateProgress(id, body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('assignments/:id/score')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  submitScore(
    @Param('id') id: string,
    @Body() body: { answers: number[]; userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.trainingService.submitScore(id, body, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus: result.passed ? 'verified' : 'failed',
    });
  }

  @Get('certificates')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  certificates(@Req() req: Request & { user?: { id?: number } }) {
    return buildSuccess(this.trainingService.listCertificates(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  analytics(@Req() req: Request & { user?: { id?: number } }) {
    const userId = resolveUserId(req);
    return buildSuccess(this.trainingService.analytics(userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Get('progress/:userId')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  progress(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: Request & { user?: { id?: number } },
  ) {
    return buildSuccess(this.trainingService.progress(userId), {
      userId: resolveUserId(req) ?? userId,
      forgeStatus: 'verified',
    });
  }
}
