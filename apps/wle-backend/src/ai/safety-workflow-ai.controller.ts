import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { Permission } from '../security/security.types';
import { SafetyWorkflowAiService } from './safety-workflow-ai.service';
import type { SafetyWorkflowAiInput } from './safety-workflow-ai.types';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/** AI Safety Workflow Engine — predictive JHA/FLHA/SIF/HECA intelligence. */
@Controller('api/ai/safety-workflow')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class SafetyWorkflowAiController {
  constructor(private readonly safetyWorkflow: SafetyWorkflowAiService) {}

  @Post('analyze')
  @HttpCode(200)
  analyze(@Body() body: SafetyWorkflowAiInput) {
    return this.safetyWorkflow.analyze(body);
  }
}
