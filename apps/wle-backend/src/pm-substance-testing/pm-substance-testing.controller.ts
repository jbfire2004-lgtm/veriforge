import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  PmCustodyPartyRole,
  PmSubstanceTestStatus,
  PmSubstanceTestType,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmSubstanceTestingService } from './pm-substance-testing.service';
import { PmSubstanceTestingCustodyService } from './pm-substance-testing-custody.service';
import { PrismaService } from '../prisma/prisma.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

const SUPERVISOR_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/substance-testing`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmSubstanceTestingController {
  constructor(
    private readonly tests: PmSubstanceTestingService,
    private readonly custody: PmSubstanceTestingCustodyService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  list(
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
    @Query('workerId') workerId?: string,
    @Query('status') status?: PmSubstanceTestStatus,
    @Query('testType') testType?: PmSubstanceTestType,
  ) {
    return this.tests.list({
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      workerId: workerId ? parseInt(workerId, 10) : undefined,
      status,
      testType,
    });
  }

  @Get('dashboard')
  dashboard(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.tests.dashboard(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('workers/:workerId')
  listByWorker(@Param('workerId') workerId: string) {
    return this.tests.listByWorker(parseInt(workerId, 10));
  }

  @Get('incidents/:incidentId')
  listByIncident(@Param('incidentId') incidentId: string) {
    return this.tests.listByIncident(incidentId);
  }

  @Post('incidents/:incidentId/order')
  @Roles(...SUPERVISOR_ROLES)
  orderFromIncident(
    @Param('incidentId') incidentId: string,
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: { workerId: number; specimenType?: string; scheduledAt?: string },
  ) {
    return this.tests.createFromIncident(
      incidentId,
      body as never,
      req.user?.userId ?? 0,
    );
  }

  @Get('pools')
  listPools(@Query('companyId') companyId: string) {
    return this.prisma.pmSubstanceTestPool.findMany({
      where: { companyId: parseInt(companyId, 10), active: true },
      include: { _count: { select: { members: true } } },
    });
  }

  @Post('pools')
  @Roles(...SUPERVISOR_ROLES)
  createPool(
    @Body()
    body: {
      companyId: number;
      projectId?: number;
      name: string;
      selectionRatePercent?: number;
    },
  ) {
    return this.prisma.pmSubstanceTestPool.create({ data: body });
  }

  @Post('pools/:poolId/random-select')
  @Roles(...SUPERVISOR_ROLES)
  randomSelect(
    @Param('poolId') poolId: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body?: { projectId?: number; scheduledAt?: string },
  ) {
    return this.tests.createRandomFromPool(poolId, req.user?.userId ?? 0, body);
  }

  @Post('pools/:poolId/members')
  @Roles(...SUPERVISOR_ROLES)
  addPoolMember(
    @Param('poolId') poolId: string,
    @Body() body: { workerId: number },
  ) {
    return this.prisma.pmSubstanceTestPoolMember.upsert({
      where: { poolId_workerId: { poolId, workerId: body.workerId } },
      create: { poolId, workerId: body.workerId },
      update: { active: true },
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.tests.get(id);
  }

  @Post()
  @Roles(...SUPERVISOR_ROLES)
  create(
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.tests.create(body as never, req.user?.userId ?? 0);
  }

  @Put(':id/status')
  @Roles(...SUPERVISOR_ROLES)
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: PmSubstanceTestStatus },
  ) {
    return this.tests.updateStatus(id, body.status);
  }

  @Post(':id/result')
  @Roles(...SUPERVISOR_ROLES)
  recordResult(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body()
    body: {
      outcome: string;
      mroNotes?: string;
      alcoholLevel?: number;
      substancePanel?: string;
    },
  ) {
    return this.tests.recordResult(id, body as never, req.user?.userId ?? 0);
  }

  @Get(':id/custody')
  listCustody(@Param('id') id: string) {
    return this.custody.listTransfers(id);
  }

  @Post(':id/custody')
  recordCustody(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.custody.recordTransfer(id, body as never, req.user?.userId);
  }

  @Get(':id/attachments')
  listAttachments(@Param('id') id: string) {
    return this.custody.listAttachments(id);
  }

  @Post(':id/attachments')
  addAttachment(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.custody.addAttachment(id, body as never, req.user?.userId);
  }

  @Get(':id/signatures')
  listSignatures(@Param('id') id: string) {
    return this.custody.listSignatures(id);
  }
}
