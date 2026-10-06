import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { CreateSafetyObservationDto } from './dto/create-safety-observation.dto';
import { ListSafetyObservationQueryDto } from './dto/list-safety-observation.query.dto';
import { UpdateSafetyObservationDto } from './dto/update-safety-observation.dto';
import { SafetyObservationService } from './safety-observation.service';

@Controller(`${API_V1_PREFIX}/safety-observations`)
export class SafetyObservationController {
  constructor(private readonly service: SafetyObservationService) {}

  @Get()
  list(@Query() query: ListSafetyObservationQueryDto) {
    return this.service.findAll({
      companyId: query.companyId,
      siteId: query.siteId,
      status: query.status,
      severity: query.severity,
      skip: query.skip,
      take: query.take,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSafetyObservationDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSafetyObservationDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
