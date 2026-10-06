import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { EquipmentTrainingRequirementsService } from './equipment-training-requirements.service';
import { CreateEquipmentTrainingRequirementDto } from './dto/create-equipment-training-requirement.dto';
import { UpdateEquipmentTrainingRequirementDto } from './dto/update-equipment-training-requirement.dto';

@Controller('equipment-training-requirements')
export class EquipmentTrainingRequirementsController {
  constructor(private readonly service: EquipmentTrainingRequirementsService) {}

  @Post()
  create(@Body() dto: CreateEquipmentTrainingRequirementDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
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
    @Body() dto: UpdateEquipmentTrainingRequirementDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
