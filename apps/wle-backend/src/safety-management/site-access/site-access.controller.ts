import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { SiteAccessService } from './site-access.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/safety/site-access`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class SiteAccessController {
  constructor(private readonly siteAccess: SiteAccessService) {}

  @Get('rules')
  listRules(@Query('projectId') projectId: string) {
    return this.siteAccess.listRules(parseInt(projectId, 10));
  }

  @Post('rules')
  upsertRule(
    @Body()
    body: {
      projectId: number;
      zoneCode?: string;
      requiresFlhaHours?: number;
      requiresTrainingCodes?: string[];
      requiresOrientation?: boolean;
    },
  ) {
    return this.siteAccess.upsertRule(body);
  }

  @Post('evaluate')
  evaluate(
    @Body()
    body: {
      workerId: number;
      projectId: number;
      zoneCode?: string;
    },
  ) {
    return this.siteAccess.evaluateAccess(body);
  }

  @Post('grant')
  grant(
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      workerId: number;
      projectId: number;
      zoneCode?: string;
      expiresInHours?: number;
    },
  ) {
    return this.siteAccess.grantAccess({
      ...body,
      grantedByUserId: req.user?.userId,
    });
  }

  @Get('grants')
  listGrants(
    @Query('projectId') projectId: string,
    @Query('workerId') workerId?: string,
  ) {
    return this.siteAccess.listGrants(
      parseInt(projectId, 10),
      workerId ? parseInt(workerId, 10) : undefined,
    );
  }

  @Post('grants/:id/revoke')
  revoke(@Param('id') id: string) {
    return this.siteAccess.revokeGrant(id);
  }
}
