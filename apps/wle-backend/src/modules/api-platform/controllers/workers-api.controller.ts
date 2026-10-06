import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { STAFF_ROLES } from '../../vera-core/roles';
import { V1_ROUTES } from '../../../config/routes.registry';
import { WorkerApiService } from '../services/worker-api.service';
import { CreateWorkerDto } from '../../../workers/dto/create-worker.dto';
import { UpdateWorkerDto } from '../../../workers/dto/update-worker.dto';
import { ApiSuccess } from '../decorators/api-success.decorator';
import { ApiSuccessInterceptor } from '../interceptors/api-success.interceptor';
import { CompanyScoped } from '../decorators/scoped.decorator';
import { CompanyScopeGuard } from '../guards/company-scope.guard';
import { apiPaginated } from '../responses/api-response';
import { toSecurityActor } from '../../../security/actor.util';
import { PermissionService } from '../../../security/permission.service';

@UseGuards(JwtAuthGuard, RolesGuard, CompanyScopeGuard)
@UseInterceptors(ApiSuccessInterceptor)
@Controller(V1_ROUTES.workers)
export class WorkersApiController {
  constructor(
    private readonly workers: WorkerApiService,
    private readonly permissions: PermissionService,
  ) {}

  @Get('search')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  @CompanyScoped('companyId')
  async search(
    @Query('q') q?: string,
    @Query('companyId') companyId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.workers.searchWorkers({
      q,
      companyId: companyId ? Number(companyId) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 25,
    });
    return apiPaginated(result.items, {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / result.pageSize) || 1,
    });
  }

  @Get(':id/project-readiness')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  async getProjectReadiness(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: Parameters<typeof toSecurityActor>[0] },
    @Query('projectId', ParseIntPipe) projectId: number,
  ) {
    await this.permissions.assertCanViewWorker(toSecurityActor(req.user), id);
    return this.workers.getWorkerProjectReadiness(id, projectId);
  }

  @Get(':id/training')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  async getTraining(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: Parameters<typeof toSecurityActor>[0] },
    @Query('requiredTraining') requiredTraining?: string,
    @Query('roleType') roleType?: string,
    @Query('projectId') projectId?: string,
  ) {
    await this.permissions.assertCanViewWorker(toSecurityActor(req.user), id);
    const requiredCodes = requiredTraining
      ? requiredTraining
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;
    return this.workers.getWorkerTraining(id, {
      roleType,
      requiredCodes,
      projectId: projectId ? Number(projectId) : undefined,
    });
  }

  @Get(':id')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  async get(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: Parameters<typeof toSecurityActor>[0] },
  ) {
    await this.permissions.assertCanViewWorker(toSecurityActor(req.user), id);
    return this.workers.getWorker(id);
  }

  @Post()
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  create(@Body() body: CreateWorkerDto) {
    return this.workers.createWorker(body);
  }

  @Patch(':id')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateWorkerDto) {
    return this.workers.updateWorker(id, body);
  }

  @Post(':id/link-company')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  linkCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { companyId: number; role?: string; trade?: string },
  ) {
    return this.workers.linkCompany(id, body.companyId, body.role, body.trade);
  }

  @Post(':id/unlink-company')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  unlinkCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { companyId: number },
  ) {
    return this.workers.unlinkCompany(id, body.companyId);
  }

  @Post(':id/assign-project')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  assignProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { projectId: number },
  ) {
    return this.workers.assignProject(id, body.projectId);
  }

  @Post(':id/training')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  uploadTraining(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.workers.uploadTraining({ ...body, workerId: id });
  }
}
