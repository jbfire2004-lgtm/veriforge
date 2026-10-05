import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectSafetyRoleType, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { ProjectSafetyRoleService } from './project-safety-role.service';

@Controller(`${API_V1_PREFIX}/pm/safety-intelligence/project-roles`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
)
export class ProjectSafetyRoleController {
  constructor(private readonly roles: ProjectSafetyRoleService) {}

  @Get()
  list(@Query('projectId') projectId: string) {
    return this.roles.listForProject(parseInt(projectId, 10));
  }

  @Post()
  upsert(
    @Body()
    body: {
      projectId: number;
      userId: number;
      role: ProjectSafetyRoleType;
      companyId?: number;
    },
  ) {
    return this.roles.upsert(body);
  }

  @Delete(':projectId/:userId')
  remove(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.roles.remove(parseInt(projectId, 10), parseInt(userId, 10));
  }
}
