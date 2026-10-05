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
import type { ContractorComplianceEngineInput } from '../pm-contractor-portal/contractor-compliance-engine.types';
import { ContractorVerificationAiService } from './contractor-verification-ai.service';

const VERIFIER_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
  UserRole.SUPERVISOR,
];

/** AI Contractor Verification Engine — document, training, insurance, and safety stats analysis. */
@Controller('api/ai/contractor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...VERIFIER_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class ContractorVerificationAiController {
  constructor(private readonly verification: ContractorVerificationAiService) {}

  @Post('verify')
  @HttpCode(200)
  verify(
    @Body()
    body: {
      membershipId?: string;
      engineInput?: ContractorComplianceEngineInput;
      work_scope?: ContractorComplianceEngineInput['work_scope'];
    },
  ) {
    return this.verification.verify(body);
  }

  @Post('verify/membership/:membershipId')
  @HttpCode(200)
  verifyMembership(
    @Param('membershipId') membershipId: string,
    @Body()
    body?: { work_scope?: ContractorComplianceEngineInput['work_scope'] },
  ) {
    return this.verification.verify({
      membershipId,
      work_scope: body?.work_scope,
    });
  }
}
