import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { Permission } from '../security/security.types';
import { SafetyContentGeneratorAiService } from './safety-content-generator-ai.service';
import type { SafetyContentGeneratorInput } from './safety-content-generator-ai.types';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/** Safety Content Generator — JHA/FLHA/SIF templates, toolbox talks, SOPs, ERP. */
@Controller('api/ai/safety-content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class SafetyContentGeneratorAiController {
  constructor(
    private readonly contentGenerator: SafetyContentGeneratorAiService,
  ) {}

  @Post('generate')
  @HttpCode(200)
  generate(@Body() body: SafetyContentGeneratorInput) {
    return this.contentGenerator.generate(body);
  }
}
