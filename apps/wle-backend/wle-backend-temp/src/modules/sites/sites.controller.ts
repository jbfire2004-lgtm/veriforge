import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { CreateSiteDto } from './dto/create-site.dto';
import { QuerySiteDto } from './dto/query-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SitesService } from './sites.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/sites`)
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  @Get()
  @Roles(UserRole.WORKER, UserRole.SUPERVISOR, UserRole.ADMIN)
  list(@Query() query: QuerySiteDto) {
    return this.sites.findPage(query);
  }

  @Get(':id/verify')
  @Roles(UserRole.WORKER, UserRole.SUPERVISOR, UserRole.ADMIN)
  verify(@Param('id', ParseIntPipe) id: number) {
    return this.sites.verify(id);
  }

  @Get(':id')
  @Roles(UserRole.WORKER, UserRole.SUPERVISOR, UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sites.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSiteDto) {
    return this.sites.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSiteDto) {
    return this.sites.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sites.remove(id);
  }
}
