import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { Permission } from '../security/security.types';
import type { IncidentSifEngineInput } from '../pm-safety-events/incident-sif-engine.types';
import { IncidentIntelligenceAiService } from './incident-intelligence-ai.service';
import type { IncidentIntelligenceAiInput } from './incident-intelligence-ai.types';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/** Incident Intelligence Engine — classification, SIF, RCA, training gaps, recurrence. */
@Controller('api/ai/incident-intelligence')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class IncidentIntelligenceAiController {
  constructor(
    private readonly incidentIntelligence: IncidentIntelligenceAiService,
  ) {}

  @Post('analyze')
  @HttpCode(200)
  analyze(@Body() body: IncidentIntelligenceAiInput) {
    return this.incidentIntelligence.analyze(body);
  }

  @Post('analyze/event/:eventId')
  @HttpCode(200)
  analyzeEvent(@Param('eventId') eventId: string) {
    return this.incidentIntelligence.analyze({ eventId });
  }

  @Post('analyze/narrative')
  @HttpCode(200)
  analyzeNarrative(@Body() body: IncidentSifEngineInput) {
    return this.incidentIntelligence.analyze({ engineInput: body });
  }
}
