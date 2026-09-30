import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
} from '@nestjs/common';
import { DigitalSignoffService } from './digital-signoff.service';

@Controller('signoff')
export class DigitalSignoffController {
  constructor(private readonly service: DigitalSignoffService) {}

  // CREATE SIGNOFF
  @Post()
  create(
    @Body()
    body: {
      workerId?: number;
      equipmentId?: number;
      supervisorId: number;
      siteId?: number;
      checklist: any;
      workerSignature?: string;
      supervisorSignature: string;
      notes?: string;
    },
  ) {
    return this.service.create(body);
  }

  // GET SIGNOFF BY ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // LIST ALL SIGNOFFS
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // FILTERS
  @Get('worker/:id')
  forWorker(@Param('id', ParseIntPipe) id: number) {
    return this.service.forWorker(id);
  }

  @Get('equipment/:id')
  forEquipment(@Param('id', ParseIntPipe) id: number) {
    return this.service.forEquipment(id);
  }

  @Get('supervisor/:id')
  forSupervisor(@Param('id', ParseIntPipe) id: number) {
    return this.service.forSupervisor(id);
  }

  @Get('site/:id')
  forSite(@Param('id', ParseIntPipe) id: number) {
    return this.service.forSite(id);
  }
}
