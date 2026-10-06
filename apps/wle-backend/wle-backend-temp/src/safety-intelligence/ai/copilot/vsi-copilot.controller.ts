import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../../config/routes';
import { TenantScoped } from '../../../security/decorators/tenant-scoped.decorator';
import { TenantScopeService } from '../../../security/tenant-scope.service';
import type { SecurityActor } from '../../../security/security.types';
import { VsiCopilotEngineService } from './vsi-copilot-engine.service';
import type { CopilotRunRequest, VsiCopilotModule } from './vsi-copilot.types';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

class CopilotRunBodyDto implements CopilotRunRequest {
  module!: VsiCopilotModule;
  sourceType?: CopilotRunRequest['sourceType'];
  projectId?: number;
  /** Optional hint — non-admins are always bound to JWT companyId. */
  companyId?: number;
  context!: Record<string, unknown>;
}

@Controller(`${API_V1_PREFIX}/pm/safety-intelligence/ai/copilot`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class VsiCopilotController {
  constructor(
    private readonly copilot: VsiCopilotEngineService,
    private readonly tenant: TenantScopeService,
  ) {}

  /**
   * companyId for VeriAgent comes from the JWT tenant (not a trusted body field).
   * Platform admins (SUPER_ADMIN / ADMIN) may target an explicit companyId in the body.
   */
  @Post('run')
  @HttpCode(HttpStatus.OK)
  @Throttle(10, 60)
  @TenantScoped()
  run(
    @Req() req: { user: SecurityActor },
    @Body() body: CopilotRunBodyDto,
  ) {
    const companyId = this.tenant.effectiveCompanyId(
      req.user,
      body.companyId,
    );
    return this.copilot.run({
      ...body,
      companyId,
      actor: {
        userId: req.user.id,
        role: String(req.user.role),
        companyId: req.user.companyId ?? undefined,
      },
    });
  }
}
