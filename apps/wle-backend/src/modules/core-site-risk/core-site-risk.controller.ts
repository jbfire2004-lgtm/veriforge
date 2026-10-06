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
import { CreateCoreSiteRiskDto } from './dto/create-core-site-risk.dto';
import { ListCoreSiteRiskQueryDto } from './dto/list-core-site-risk.query.dto';
import { UpdateCoreSiteRiskDto } from './dto/update-core-site-risk.dto';
import { CoreSiteRiskService } from './core-site-risk.service';

@Controller(`${API_V1_PREFIX}/core-site-risks`)
export class CoreSiteRiskController {
  constructor(private readonly service: CoreSiteRiskService) {}

  @Get()
  list(@Query() query: ListCoreSiteRiskQueryDto) {
    return this.service.findAll({
      companyId: query.companyId,
      siteId: query.siteId,
      status: query.status,
      category: query.category,
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
  create(@Body() dto: CreateCoreSiteRiskDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoreSiteRiskDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
