import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { CoreActionCailBackfillService } from './core-action-cail-backfill.service';

class BackfillBodyDto {
  dryRun?: boolean;
  limit?: number;
}

@Controller(`${API_V1_PREFIX}/pm/safety-intelligence/admin`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class CailMigrationController {
  constructor(private readonly backfill: CoreActionCailBackfillService) {}

  @Post('backfill-core-actions')
  async backfillCoreActions(@Body() body: BackfillBodyDto) {
    return this.backfill.backfillFromSafetyFormActions({
      dryRun: body.dryRun ?? false,
      limit: body.limit ?? 500,
    });
  }
}
