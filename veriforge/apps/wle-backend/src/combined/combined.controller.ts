import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { STAFF_ROLES } from '../modules/vera-core/roles';
import { PublicRateLimited } from '../security/decorators/public-rate-limit.decorator';
import { CombinedService } from './combined.service';
import { VerificationService } from '../verification/verification.service';

/**
 * Combined worker+equipment verification.
 * Public routes return sanitized summaries; full payloads require staff JWT.
 */
@Controller('combined')
export class CombinedController {
  constructor(
    private readonly combinedService: CombinedService,
    private readonly verification: VerificationService,
  ) {}

  @PublicRateLimited(20)
  @Get()
  verifyPublic(
    @Query('worker') workerRef: string,
    @Query('equipment') equipmentRef: string,
  ) {
    return this.verification.verifyCombinedPublic(workerRef, equipmentRef);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @Get('full')
  verifyFull(
    @Query('worker') workerRef: string,
    @Query('equipment') equipmentRef: string,
  ) {
    return this.combinedService.verifyCombinedByRef(workerRef, equipmentRef);
  }

  @PublicRateLimited(20)
  @Get('result')
  view(
    @Query('worker') workerRef: string,
    @Query('equipment') equipmentRef: string,
  ) {
    return this.combinedService.getCombinedResultViewByRef(
      workerRef,
      equipmentRef,
    );
  }
}
