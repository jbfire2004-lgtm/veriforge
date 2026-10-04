import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ComplianceService } from './compliance.service';

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly compliance: ComplianceService) {}

  @Get('worker/:id')
  worker(@Param('id', ParseIntPipe) id: number) {
    return this.compliance.workerCompliance(id);
  }

  @Get('company/:id')
  company(@Param('id', ParseIntPipe) id: number) {
    return this.compliance.companyCompliance(id);
  }

  @Get('site/:id')
  site(@Param('id', ParseIntPipe) id: number) {
    return this.compliance.siteCompliance(id);
  }
}
