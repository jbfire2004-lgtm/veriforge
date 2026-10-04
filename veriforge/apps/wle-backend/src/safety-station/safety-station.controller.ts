import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { SafetyStationService } from './safety-station.service';

@Controller('safety-stations')
export class SafetyStationController {
  constructor(private readonly stations: SafetyStationService) {}

  @Post()
  create(
    @Body()
    body: {
      name: string;
      code: string;
      siteId?: number;
    },
  ) {
    return this.stations.create(body);
  }

  @Get()
  findAll() {
    return this.stations.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stations.findOne(id);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.stations.findByCode(code);
  }

  @Post('ping/:code')
  ping(@Param('code') code: string) {
    return this.stations.ping(code);
  }

  @Get('site/:id')
  forSite(@Param('id', ParseIntPipe) id: number) {
    return this.stations.forSite(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: Partial<{ name: string; siteId: number | null; active: boolean }>,
  ) {
    return this.stations.update(id, body);
  }
}
