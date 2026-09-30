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
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { IncidentsService } from './incidents.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidents: IncidentsService) {}

  @Post()
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PROJECT_MANAGER,
    UserRole.WORKER,
  )
  create(
    @Body()
    body: {
      title?: string;
      description?: string;
      category?: string;
      latitude?: number | null;
      longitude?: number | null;
      metadata?: Record<string, unknown> | null;
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      workerId?: number;
      equipmentId?: number;
      companyId?: number;
      siteId?: number;
      createdById?: number;
    },
  ) {
    return this.incidents.create(body);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  list(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('companyId') companyId?: string,
    @Query('siteId') siteId?: string,
    @Query('workerId') workerId?: string,
    @Query('equipmentId') equipmentId?: string,
  ) {
    return this.incidents.list({
      status: status || undefined,
      severity: severity || undefined,
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      siteId: siteId ? parseInt(siteId, 10) : undefined,
      workerId: workerId ? parseInt(workerId, 10) : undefined,
      equipmentId: equipmentId ? parseInt(equipmentId, 10) : undefined,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.incidents.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: Partial<{
      title: string;
      description: string | null;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }>,
  ) {
    return this.incidents.update(id, body);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: { status: 'OPEN' | 'IN_REVIEW' | 'ACTION_REQUIRED' | 'CLOSED' },
  ) {
    return this.incidents.changeStatus(id, body.status);
  }

  @Patch(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { assignedToId: number | null },
  ) {
    return this.incidents.assign(id, body.assignedToId);
  }

  @Post(':id/comments')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PROJECT_MANAGER,
    UserRole.WORKER,
  )
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId?: number; message: string },
  ) {
    return this.incidents.addComment({
      incidentId: id,
      userId: body.userId,
      message: body.message,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.incidents.remove(id);
  }
}
