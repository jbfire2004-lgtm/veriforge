import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { CoreActionCailBackfillService } from './core-action-cail-backfill.service';

@Controller(`${API_V1_PREFIX}/pm/safety-intelligence/admin`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class VsiAdminController {
  constructor(private readonly backfill: CoreActionCailBackfillService) {}

  /**
   * Migrate legacy SafetyFormAction → CoreActionItem rows into CAIL + form links.
   * Query: dryRun=true to preview counts without writing.
   */
  @Post('backfill/core-actions')
  backfillCoreActions(
    @Query('dryRun') dryRun?: string,
    @Query('limit') limit?: string,
  ) {
    return this.backfill.backfillFromSafetyFormActions({
      dryRun: dryRun === 'true' || dryRun === '1',
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
