import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { Permission } from '../security/security.types';
import { ComplianceCalendarAiService } from './compliance-calendar-ai.service';
import type { ComplianceCalendarAiInput } from './compliance-calendar-ai.types';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/** Compliance Calendar Engine — expiry tracking, risk prediction, reminders. */
@Controller('api/ai/compliance-calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class ComplianceCalendarAiController {
  constructor(
    private readonly complianceCalendar: ComplianceCalendarAiService,
  ) {}

  @Post('analyze')
  @HttpCode(200)
  analyze(@Body() body: ComplianceCalendarAiInput) {
    return this.complianceCalendar.analyze(body);
  }
}
