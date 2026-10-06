import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { InspectionsService } from './inspections.service';

@Controller('inspections')
export class InspectionsController {
  constructor(private service: InspectionsService) {}

  @Post()
  create(@Body() body: any) {
    return this.service.createInspection(body);
  }

  @Get('equipment/:id')
  getEquipment(@Param('id', ParseIntPipe) id: number) {
    return this.service.getEquipmentInspections(id);
  }
}
