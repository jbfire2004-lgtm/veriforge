import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { Permission } from '../security/security.types';
import { PredictiveSafetyAnalyticsAiService } from './predictive-safety-analytics-ai.service';
import type { PredictiveSafetyAnalyticsAiInput } from './predictive-safety-analytics-ai.types';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/** Predictive Safety Analytics Engine — risk forecast, leading indicators, interventions. */
@Controller('api/ai/safety-analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class PredictiveSafetyAnalyticsAiController {
  constructor(
    private readonly predictiveAnalytics: PredictiveSafetyAnalyticsAiService,
  ) {}

  @Post('analyze')
  @HttpCode(200)
  analyze(@Body() body: PredictiveSafetyAnalyticsAiInput) {
    return this.predictiveAnalytics.analyze(body);
  }
}
