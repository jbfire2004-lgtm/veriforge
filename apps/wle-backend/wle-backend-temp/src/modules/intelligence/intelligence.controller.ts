import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { IntelligenceService } from './intelligence.service';
import type { AskVeraDto, IntelligenceQueryDto } from './intelligence.types';

@Controller(`${API_V1_PREFIX}/intelligence`)
export class IntelligenceController {
  constructor(private readonly intelligence: IntelligenceService) {}

  @Get('bundle')
  getBundle(@Query() query: IntelligenceQueryDto) {
    const companyId = query.companyId ? Number(query.companyId) : undefined;
    const projectId = query.projectId ? Number(query.projectId) : undefined;
    const workerId = query.workerId ? Number(query.workerId) : undefined;
    const equipmentId = query.equipmentId
      ? Number(query.equipmentId)
      : undefined;
    return this.intelligence.getBundle({
      companyId,
      projectId,
      workerId,
      equipmentId,
      unionHallId: query.unionHallId ? Number(query.unionHallId) : undefined,
    });
  }

  @Post('ask')
  ask(@Body() body: AskVeraDto) {
    return this.intelligence.ask(body);
  }

  @Post('automation/run')
  runAutomation(@Query('companyId') companyId?: string) {
    return this.intelligence.runAutomation(
      companyId ? Number(companyId) : undefined,
    );
  }
}
