import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { CoreActionItemsService } from './core-action-items.service';
import { CreateCoreActionItemDto } from './dto/create-core-action-item.dto';
import { ListCoreActionItemsQueryDto } from './dto/list-core-action-items.query.dto';
import { UpdateCoreActionItemDto } from './dto/update-core-action-item.dto';

@Controller(`${API_V1_PREFIX}/core-action-items`)
export class CoreActionItemsController {
  constructor(private readonly service: CoreActionItemsService) {}

  @Get()
  list(@Query() query: ListCoreActionItemsQueryDto) {
    return this.service.findAll({
      companyId: query.companyId,
      coreMeetingRecordId: query.coreMeetingRecordId,
      coreDailyLogId: query.coreDailyLogId,
      status: query.status,
      priority: query.priority,
      skip: query.skip,
      take: query.take,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCoreActionItemDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCoreActionItemDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
