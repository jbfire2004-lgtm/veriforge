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
import { CoreComplianceNoteService } from './core-compliance-note.service';
import { CreateCoreComplianceNoteDto } from './dto/create-core-compliance-note.dto';
import { ListCoreComplianceNoteQueryDto } from './dto/list-core-compliance-note.query.dto';
import { UpdateCoreComplianceNoteDto } from './dto/update-core-compliance-note.dto';

@Controller(`${API_V1_PREFIX}/core-compliance-notes`)
export class CoreComplianceNoteController {
  constructor(private readonly service: CoreComplianceNoteService) {}

  @Get()
  list(@Query() query: ListCoreComplianceNoteQueryDto) {
    return this.service.findAll({
      companyId: query.companyId,
      siteId: query.siteId,
      status: query.status,
      category: query.category,
      priority: query.priority,
      dueFrom: query.dueFrom,
      dueTo: query.dueTo,
      skip: query.skip,
      take: query.take,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCoreComplianceNoteDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoreComplianceNoteDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
