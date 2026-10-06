import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { STAFF_ROLES } from '../../vera-core/roles';
import { V1_ROUTES } from '../../../config/routes.registry';
import { EquipmentApiService } from '../services/equipment-api.service';
import { ApiSuccess } from '../decorators/api-success.decorator';
import { ApiSuccessInterceptor } from '../interceptors/api-success.interceptor';
import { apiPaginated } from '../responses/api-response';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ApiSuccessInterceptor)
@Controller(V1_ROUTES.equipment)
export class EquipmentApiController {
  constructor(private readonly equipment: EquipmentApiService) {}

  @Get()
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  async list(
    @Query('companyId') companyId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.equipment.list(
      companyId ? Number(companyId) : undefined,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 25,
    );
    return apiPaginated(result.items, {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / result.pageSize) || 1,
    });
  }

  @Get(':id')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  get(@Param('id', ParseIntPipe) id: number) {
    return this.equipment.getEquipment(id);
  }

  @Post()
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  create(@Body() body: Record<string, unknown>) {
    return this.equipment.create(body);
  }

  @Patch(':id')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.equipment.update(id, body);
  }

  @Post(':id/link-company')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  linkCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { companyId: number },
  ) {
    return this.equipment.linkCompany(id, body.companyId);
  }

  @Post(':id/assign-project')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  assignProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { projectId: number },
  ) {
    return this.equipment.assignProject(id, body.projectId);
  }

  @Post(':id/lockout')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  lockout(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason?: string },
  ) {
    return this.equipment.lockout(id, body.reason);
  }

  @Post(':id/unlock')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  unlock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { notes?: string },
  ) {
    return this.equipment.unlock(id, body.notes);
  }
}
