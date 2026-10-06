import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { InvestigationsService } from './investigations.service';

@Controller('investigations')
export class InvestigationsController {
  constructor(private service: InvestigationsService) {}

  @Post(':incidentId/start')
  start(@Param('incidentId', ParseIntPipe) id: number) {
    return this.service.startInvestigation(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.updateInvestigation(id, body);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.getInvestigation(id);
  }
}
