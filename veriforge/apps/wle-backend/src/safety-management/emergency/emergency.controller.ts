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
import { EmergencyService } from './emergency.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/safety/emergency`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class EmergencyController {
  constructor(private readonly emergency: EmergencyService) {}

  @Get('plans')
  listPlans(@Query('siteId') siteId: string) {
    return this.emergency.listPlans(parseInt(siteId, 10));
  }

  @Post('plans')
  createPlan(
    @Body()
    body: {
      siteId: number;
      title: string;
      planType?: string;
      contentJson?: Record<string, unknown>;
    },
  ) {
    return this.emergency.createPlan(body);
  }

  @Post('muster/trigger')
  triggerMuster(
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: { siteId: number; projectId?: number; notes?: string },
  ) {
    return this.emergency.triggerMuster({
      ...body,
      triggeredByUser: req.user?.userId,
    });
  }

  @Get('muster/active')
  activeMuster(@Query('siteId') siteId: string) {
    return this.emergency.getActiveMuster(parseInt(siteId, 10));
  }

  @Post('muster/:id/checkin')
  checkIn(
    @Param('id') id: string,
    @Body() body: { workerId: number; method?: string },
  ) {
    return this.emergency.checkIn({
      musterEventId: id,
      workerId: body.workerId,
      method: body.method,
    });
  }

  @Post('muster/:id/all-clear')
  allClear(@Param('id') id: string) {
    return this.emergency.allClear(id);
  }

  @Get('muster/history')
  history(@Query('siteId') siteId: string) {
    return this.emergency.listMusterHistory(parseInt(siteId, 10));
  }
}
