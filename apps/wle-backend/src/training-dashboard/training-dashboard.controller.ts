import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TrainingDashboardService } from './training-dashboard.service';

@Controller('training-dashboard')
export class TrainingDashboardController {
  constructor(private readonly dashboard: TrainingDashboardService) {}

  @Get('company/:companyId')
  getDashboard(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.dashboard.getCompanyDashboard(companyId);
  }
}
