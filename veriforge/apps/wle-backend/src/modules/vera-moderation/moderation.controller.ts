import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ModerationReportService } from './moderation-report.service';
import { ExpertVerificationService } from './expert-verification.service';

@Controller('api/v1/moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
  constructor(
    private readonly reports: ModerationReportService,
    private readonly expertVerification: ExpertVerificationService,
  ) {}

  @Post('report/post')
  @HttpCode(HttpStatus.CREATED)
  @Throttle(20, 60)
  reportPost(
    @Req() req: { user: { id: number } },
    @Body()
    body: {
      targetType: string;
      targetId: string;
      reason: string;
      details?: string;
    },
  ) {
    return this.reports.reportPost(
      req.user.id,
      body.targetType as never,
      body.targetId,
      body.reason as never,
      body.details,
    );
  }

  @Post('report/user')
  @HttpCode(HttpStatus.CREATED)
  @Throttle(20, 60)
  reportUser(
    @Req() req: { user: { id: number } },
    @Body() body: { userId: number; reason: string; details?: string },
  ) {
    return this.reports.reportUser(
      req.user.id,
      body.userId,
      body.reason as never,
      body.details,
    );
  }

  @Post('expert-verification/apply')
  @HttpCode(HttpStatus.CREATED)
  @Throttle(5, 60)
  applyExpertVerification(
    @Req() req: { user: { id: number } },
    @Body() body: { statement: string; tradeEvidence?: string },
  ) {
    return this.expertVerification.apply(
      req.user.id,
      body.statement,
      body.tradeEvidence,
    );
  }
}
