import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SupervisorService } from './supervisor.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
@Controller('supervisor')
export class SupervisorController {
  constructor(private readonly supervisor: SupervisorService) {}

  @Get('dashboard')
  dashboardSummary() {
    return this.supervisor.globalDashboard();
  }

  @Get('stations')
  stations() {
    return this.supervisor.listSafetyStations();
  }

  @Get(':id/profile')
  profile(@Param('id', ParseIntPipe) id: number) {
    return this.supervisor.profile(id);
  }

  @Get(':id/overview')
  overview(@Param('id', ParseIntPipe) id: number) {
    return this.supervisor.overview(id);
  }

  @Get(':id/signoffs')
  signoffs(@Param('id', ParseIntPipe) id: number) {
    return this.supervisor.recentSignoffs(id);
  }

  @Get(':id/incidents')
  incidents(@Param('id', ParseIntPipe) id: number) {
    return this.supervisor.recentIncidents(id);
  }

  @Get(':id/workers')
  workers(@Param('id', ParseIntPipe) id: number) {
    return this.supervisor.workersForCompany(id);
  }

  @Get(':id/training-risk')
  trainingRisk(@Param('id', ParseIntPipe) id: number) {
    return this.supervisor.trainingRisk(id);
  }
}
