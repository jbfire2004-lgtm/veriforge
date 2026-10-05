import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SitesService } from './sites.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  @Roles(UserRole.WORKER, UserRole.SUPERVISOR, UserRole.ADMIN)
  findAll() {
    return this.sitesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.WORKER, UserRole.SUPERVISOR, UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sitesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  create(@Body() body: { name: string; location?: string }) {
    return this.sitesService.create(body);
  }

  @Patch(':id')
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<{ name: string; location: string }>,
  ) {
    return this.sitesService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sitesService.remove(id);
  }

  @Get(':id/summary')
  @Roles(UserRole.WORKER, UserRole.SUPERVISOR, UserRole.ADMIN)
  summary(@Param('id', ParseIntPipe) id: number) {
    return this.sitesService.summary(id);
  }
}
