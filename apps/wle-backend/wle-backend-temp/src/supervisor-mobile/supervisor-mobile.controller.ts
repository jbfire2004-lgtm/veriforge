import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SupervisorMobileService } from './supervisor-mobile.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
@Controller('supervisor-mobile')
export class SupervisorMobileController {
  constructor(private readonly sup: SupervisorMobileService) {}

  @Get('assignments')
  quickView() {
    return this.sup.quickView();
  }

  @Post('assign')
  quickAssign(
    @Body()
    body: {
      workerId: number;
      siteId?: number;
      equipmentId?: number;
      companyId?: number;
      assignedBy: number;
    },
  ) {
    return this.sup.quickAssign(body);
  }
}
