import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { WorkersService } from './workers.service';
import { AssignWorkersCompanyDto } from './dto/assign-workers-company.dto';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerExpiryRulesDto } from './dto/update-worker-expiry-rules.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { toSecurityActor } from '../security/actor.util';
import { TenantScoped } from '../security/decorators/tenant-scoped.decorator';
import { PermissionService } from '../security/permission.service';
import type { SecurityActor } from '../security/security.types';
import { WorkerExpiryRulesStore } from './worker-expiry-rules.store';

type AuthedRequest = { user?: SecurityActor };

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
@Controller('workers')
export class WorkersController {
  constructor(
    private readonly workersService: WorkersService,
    private readonly permissions: PermissionService,
    private readonly expiryRulesStore: WorkerExpiryRulesStore,
  ) {}

  // GET /workers
  @Get()
  findAll() {
    return this.workersService.findAll();
  }

  @Get('company/:companyId')
  @TenantScoped('companyId')
  findByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.workersService.findByCompany(companyId);
  }

  @Get('expiry-rules')
  @TenantScoped('companyId')
  getExpiryRules(@Query('companyId', ParseIntPipe) companyId: number) {
    return this.expiryRulesStore.getRules(companyId);
  }

  @Patch('expiry-rules')
  @TenantScoped('companyId')
  updateExpiryRules(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Body() dto: UpdateWorkerExpiryRulesDto,
  ) {
    return this.expiryRulesStore.saveRules(companyId, dto);
  }

  @Post(':id/heartbeat')
  @HttpCode(HttpStatus.OK)
  heartbeat(@Param('id', ParseIntPipe) id: number) {
    return this.workersService.registerHeartbeat(id);
  }

  /** Bulk roster move: set employer `companyId` for many workers, or unassign. */
  @Post('assign-company')
  assignCompany(@Body() dto: AssignWorkersCompanyDto) {
    if (dto.unassign) {
      return this.workersService.assignCompanyBatch(dto.workerIds, null);
    }
    if (dto.companyId == null || !Number.isFinite(dto.companyId)) {
      throw new BadRequestException(
        'companyId is required unless unassign is true',
      );
    }
    return this.workersService.assignCompanyBatch(dto.workerIds, dto.companyId);
  }

  /** Worker may only read their own row (linked by `Worker.userId`). */
  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PROJECT_MANAGER,
    UserRole.WORKER,
  )
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthedRequest,
  ) {
    await this.assertWorkerSelfOrElevated(req, id);
    return this.workersService.findOne(id);
  }

  // POST /workers
  @Post()
  create(@Body() body: CreateWorkerDto) {
    return this.workersService.create(body);
  }

  // PATCH /workers/:id
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateWorkerDto) {
    return this.workersService.update(id, body);
  }

  // DELETE /workers/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workersService.remove(id);
  }

  // ---------------------------------------------------------
  // FULL PROFILE FOR WORKER PROFILE PAGE
  // ---------------------------------------------------------
  @Get(':id/profile')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PROJECT_MANAGER,
    UserRole.WORKER,
  )
  async profile(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthedRequest,
  ) {
    await this.assertWorkerSelfOrElevated(req, id);
    return this.workersService.getProfile(id);
  }

  // ---------------------------------------------------------
  // PHASE 1: COMPLIANCE ONLY
  // ---------------------------------------------------------
  @Get(':id/compliance')
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.PROJECT_MANAGER,
    UserRole.WORKER,
  )
  async compliance(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthedRequest,
  ) {
    await this.assertWorkerSelfOrElevated(req, id);
    return this.workersService.getCompliance(id);
  }

  private async assertWorkerSelfOrElevated(
    req: AuthedRequest,
    workerId: number,
  ) {
    const u = req.user;
    if (!u) throw new ForbiddenException();
    if (u.role === UserRole.WORKER) {
      const own = await this.workersService.findWorkerIdByUserId(u.id);
      if (own !== workerId) {
        throw new ForbiddenException(
          'Workers may only access their own profile',
        );
      }
      return;
    }
    await this.permissions.assertCanViewWorker(toSecurityActor(u), workerId);
  }
}
