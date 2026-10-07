import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Phase1DashboardService } from './phase1-dashboard.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
@Controller('phase1')
export class Phase1DashboardController {
  constructor(private readonly dashboard: Phase1DashboardService) {}

  /** Aggregated Phase 1 metrics + recent uploads for admin / ops dashboards. */
  @Get('dashboard-summary')
  dashboardSummary() {
    return this.dashboard.getDashboardSummary();
  }
}
