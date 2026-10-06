import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ReportingService } from './reporting.service';

@Controller('reporting')
export class ReportingController {
  constructor(private readonly reporting: ReportingService) {}

  @Get('system')
  systemOverview() {
    return this.reporting.systemOverview();
  }

  @Get('incidents')
  incidentSummary() {
    return this.reporting.incidentSummary();
  }

  @Get('training-expiry')
  trainingExpiry() {
    return this.reporting.trainingExpiryReport();
  }

  @Get('company/:id')
  companyRisk(@Param('id', ParseIntPipe) id: number) {
    return this.reporting.companyRisk(id);
  }

  @Get('site/:id')
  siteSafety(@Param('id', ParseIntPipe) id: number) {
    return this.reporting.siteSafetyReport(id);
  }

  @Get('equipment-health')
  equipmentHealth() {
    return this.reporting.equipmentHealth();
  }

  @Get('worker/:id')
  workerSafety(@Param('id', ParseIntPipe) id: number) {
    return this.reporting.workerSafety(id);
  }
}
