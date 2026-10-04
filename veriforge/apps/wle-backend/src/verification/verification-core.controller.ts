import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '@prisma/client';
import { PublicRateLimited } from '../security/decorators/public-rate-limit.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { API_V1_PREFIX } from '../config/routes';
import { parseValidateTrainingRecordQuery } from './parse-validate-training-record-query';
import { VerificationService } from './verification.service';

type JwtRequestUser = { id: number; email?: string; role?: string };

/**
 * Versioned, structured training verification (VERA Core).
 * - GET validate may remain public for kiosk / QR flows (optional query hardening in service).
 * - POST complete is **authenticated** supervisor / admin / PM only.
 */
@Controller(`${API_V1_PREFIX}/core/verification`)
export class VerificationCoreController {
  constructor(private readonly verification: VerificationService) {}

  /**
   * Runs {@link VerificationService.validateTrainingRecord}: structured checks on the record.
   *
   * Query: `expectedWorkerId` — optional; identity check fails if it does not match the record’s worker.
   * Query: `expectedCompanyId` — optional; worker’s employer must match (tenant / QR hardening).
   * Query: `expectedTrainingType` — optional; certification name or code (case-insensitive).
   * Query: `expectedCertificateNumber` — optional; must equal stored certificate number.
   * Query: `expectedProvider` — optional; must match linked provider name (case-insensitive).
   */
  @PublicRateLimited(30)
  @Get('training/:id')
  async trainingRecord(
    @Param('id', ParseIntPipe) id: number,
    @Query('expectedWorkerId') expectedWorkerId?: string,
    @Query('expectedCompanyId') expectedCompanyId?: string,
    @Query('expectedTrainingType') expectedTrainingType?: string,
    @Query('expectedCertificateNumber') expectedCertificateNumber?: string,
    @Query('expectedProvider') expectedProvider?: string,
  ) {
    return this.verification.validateTrainingRecord(
      id,
      parseValidateTrainingRecordQuery({
        expectedWorkerId,
        expectedCompanyId,
        expectedTrainingType,
        expectedCertificateNumber,
        expectedProvider,
      }),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('training/:id/snapshot')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  trainingSnapshot(@Param('id', ParseIntPipe) id: number) {
    return this.verification.getTrainingVerificationSnapshot(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  @Post('training/:id/complete')
  completeTrainingRecord(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user?: JwtRequestUser },
  ) {
    const u = req.user;
    return this.verification.completeTrainingVerification(
      id,
      u?.id != null ? { userId: u.id } : null,
    );
  }
}
