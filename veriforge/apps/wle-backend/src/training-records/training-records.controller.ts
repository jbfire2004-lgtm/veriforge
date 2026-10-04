import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TrainingRecordsService } from './training-records.service';
import { CreateTrainingRecordDto } from './dto/create-training-record.dto';
import { UpdateTrainingRecordDto } from './dto/update-training-record.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
@Controller('training-records')
export class TrainingRecordsController {
  constructor(private readonly service: TrainingRecordsService) {}

  @Post()
  create(@Body() dto: CreateTrainingRecordDto) {
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

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const row = await this.service.findOne(id);
    if (!row) throw new NotFoundException('Training record not found');
    return row;
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrainingRecordDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.service.markComplete(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
