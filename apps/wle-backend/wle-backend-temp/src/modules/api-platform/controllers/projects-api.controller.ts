import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { COMPANY_ADMIN_ROLES, STAFF_ROLES } from '../../vera-core/roles';
import { V1_ROUTES } from '../../../config/routes.registry';
import { ProjectApiService } from '../services/project-api.service';
import { ApiSuccess } from '../decorators/api-success.decorator';
import { ApiSuccessInterceptor } from '../interceptors/api-success.interceptor';
import { ProjectScopeGuard } from '../guards/project-scope.guard';
import { ProjectScoped } from '../decorators/scoped.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, ProjectScopeGuard)
@UseInterceptors(ApiSuccessInterceptor)
@Controller(V1_ROUTES.projects)
export class ProjectsApiController {
  constructor(private readonly projects: ProjectApiService) {}

  @Post()
  @Roles(...COMPANY_ADMIN_ROLES)
  @ApiSuccess()
  create(@Body() body: Parameters<ProjectApiService['create']>[0]) {
    return this.projects.create(body);
  }

  @Get(':id')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  @ProjectScoped('id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.projects.get(id);
  }

  @Post(':id/assign-worker')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  @ProjectScoped('id')
  assignWorker(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { workerId: number },
  ) {
    return this.projects.assignWorker(id, body.workerId);
  }

  @Post(':id/assign-equipment')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  @ProjectScoped('id')
  assignEquipment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { equipmentId: number },
  ) {
    return this.projects.assignEquipment(id, body.equipmentId);
  }

  @Get(':id/readiness')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  @ProjectScoped('id')
  readiness(@Param('id', ParseIntPipe) id: number) {
    return this.projects.readiness(undefined, id);
  }

  @Post(':id/close')
  @Roles(...COMPANY_ADMIN_ROLES)
  @ApiSuccess()
  @ProjectScoped('id')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.projects.close(id);
  }
}
