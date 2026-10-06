import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AssignmentDashboardService } from './assignment-dashboard.service';

@Controller('assignment-dashboard')
export class AssignmentDashboardController {
  constructor(private readonly dash: AssignmentDashboardService) {}

  @Get('overview')
  overview() {
    return this.dash.overview();
  }

  @Get('active')
  activeAssignments() {
    return this.dash.activeAssignments();
  }

  @Get('worker-load')
  workerLoad() {
    return this.dash.workerLoad();
  }

  @Get('equipment-utilization')
  equipmentUtilization() {
    return this.dash.equipmentUtilization();
  }

  @Get('site-staffing')
  siteStaffing() {
    return this.dash.siteStaffing();
  }

  @Get('company/:id')
  companyAssignments(@Param('id', ParseIntPipe) id: number) {
    return this.dash.companyAssignments(id);
  }
}
