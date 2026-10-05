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
import { ClientPrequalificationAiService } from './client-prequalification-ai.service';
import type { ClientPrequalificationAiInput } from './client-prequalification-ai.types';

const PREQUAL_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
  UserRole.SUPERVISOR,
];

/** Client Prequalification Engine — HSE, insurance, WCB, and safety program scoring. */
@Controller('api/ai/client-prequalification')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PREQUAL_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class ClientPrequalificationAiController {
  constructor(
    private readonly prequalification: ClientPrequalificationAiService,
  ) {}

  @Post('evaluate')
  @HttpCode(200)
  evaluate(@Body() body: ClientPrequalificationAiInput) {
    return this.prequalification.evaluate(body);
  }

  @Post('evaluate/membership/:membershipId')
  @HttpCode(200)
  evaluateMembership(@Param('membershipId') membershipId: string) {
    return this.prequalification.evaluate({ membershipId });
  }

  @Post('evaluate/company/:contractorCompanyId')
  @HttpCode(200)
  evaluateCompany(
    @Param('contractorCompanyId') contractorCompanyId: string,
    @Body() body?: { primeCompanyId?: number; projectId?: number },
  ) {
    return this.prequalification.evaluate({
      contractorCompanyId: Number(contractorCompanyId),
      primeCompanyId: body?.primeCompanyId,
      projectId: body?.projectId,
    });
  }
}
