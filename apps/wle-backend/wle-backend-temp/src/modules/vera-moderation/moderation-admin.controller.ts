import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { ModerationQueueService } from './moderation-queue.service';
import { ModerationAutoRulesService } from './moderation-auto-rules.service';
import { ExpertVerificationService } from './expert-verification.service';
import { SocialPostModerationService } from './social-post-moderation.service';

@Controller('api/v1/admin/moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN)
export class ModerationAdminController {
  constructor(
    private readonly queue: ModerationQueueService,
    private readonly rules: ModerationAutoRulesService,
    private readonly expertVerification: ExpertVerificationService,
    private readonly socialFlags: SocialPostModerationService,
  ) {}

  @Get('stats')
  async stats() {
    const [queue, social] = await Promise.all([
      this.queue.queueStats(),
      this.socialFlags.flagStats(),
    ]);
    return { ...queue, socialPostFlagsOpen: social.open };
  }

  @Get('social-flags')
  listSocialFlags(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.socialFlags.listOpenFlags({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Patch('social-flags/:id')
  resolveSocialFlag(
    @Req() req: { user: { id: number } },
    @Param('id') id: string,
    @Body() body: { action: 'DISMISS' | 'HIDE_POST'; note?: string },
  ) {
    return this.socialFlags.resolveFlag(
      id,
      req.user.id,
      body.action,
      body.note,
    );
  }

  @Get('queue')
  listQueue(
    @Query('status') status?: string,
    @Query('targetType') targetType?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.queue.listQueue({
      status: status as never,
      targetType: targetType as never,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Patch('cases/:id')
  resolveCase(
    @Req() req: { user: { id: number } },
    @Param('id') id: string,
    @Body()
    body: {
      status: string;
      resolution?: string;
      resolutionNote?: string;
    },
  ) {
    return this.queue.resolveCase(id, req.user.id, {
      status: body.status as never,
      resolution: body.resolution as never,
      resolutionNote: body.resolutionNote,
    });
  }

  @Get('rules')
  listRules() {
    return this.rules.listRules();
  }

  @Post('rules')
  upsertRule(@Body() body: Record<string, unknown>) {
    return this.rules.upsertRule(body as never);
  }

  @Get('expert-verification')
  listExpertVerification() {
    return this.expertVerification.listPending();
  }

  @Patch('expert-verification/:id')
  reviewExpertVerification(
    @Req() req: { user: { id: number } },
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED'; reviewNote?: string },
  ) {
    return this.expertVerification.review(
      id,
      req.user.id,
      body.status,
      body.reviewNote,
    );
  }
}
