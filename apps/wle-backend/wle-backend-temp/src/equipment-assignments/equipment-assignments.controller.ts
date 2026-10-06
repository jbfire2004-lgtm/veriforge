import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { EquipmentAssignmentsService } from './equipment-assignments.service';
import { CreateEquipmentAssignmentDto } from './dto/create-equipment-assignment.dto';
import { UpdateEquipmentAssignmentDto } from './dto/update-equipment-assignment.dto';

@Controller('equipment-assignments')
export class EquipmentAssignmentsController {
  constructor(private readonly service: EquipmentAssignmentsService) {}

  @Post()
  create(@Body() dto: CreateEquipmentAssignmentDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('worker/:workerId')
  findByWorker(@Param('workerId', ParseIntPipe) workerId: number) {
    return this.service.findByWorker(workerId);
  }

  @Get('equipment/:equipmentId')
  findByEquipment(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.service.findByEquipment(equipmentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipmentAssignmentDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/return')
  returnEquipment(@Param('id', ParseIntPipe) id: number) {
    return this.service.returnEquipment(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
