import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PmPermitType, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmProjectManagementService } from './pm-project-management.service';
import { PmProjectManagementCailIntelligenceService } from './pm-project-management-cail-intelligence.service';
import { PmSchedulingBridgeService } from './pm-scheduling-bridge.service';
import {
  RequireFeature,
  RequireModule,
} from '../acp/decorators/vera-access.decorator';
import { VeraFeatureGuard } from '../acp/guards/vera-feature.guard';
import { VeraModuleGuard } from '../acp/guards/vera-module.guard';

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

@Controller(`${API_V1_PREFIX}/pm/project-management`)
@UseGuards(JwtAuthGuard, RolesGuard, VeraModuleGuard)
@RequireModule('pm')
@Roles(...PM_ROLES)
export class PmProjectManagementController {
  constructor(
    private readonly pm: PmProjectManagementService,
    private readonly cail: PmProjectManagementCailIntelligenceService,
    private readonly bridge: PmSchedulingBridgeService,
  ) {}

  @Post('project')
  @Roles(...SUPERVISOR_ROLES)
  createProject(
    @Body() body: Parameters<PmProjectManagementService['createProject']>[0],
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.createProject(body, req.user.id);
  }

  @Get('project/:projectId/dashboard')
  dashboard(@Param('projectId') projectId: string) {
    return this.pm.getProjectDashboard(parseInt(projectId, 10));
  }

  @Get('project/:projectId/cail')
  cailBundle(@Param('projectId') projectId: string) {
    return this.pm.getCailBundle(parseInt(projectId, 10));
  }

  @Get('project/:projectId/analytics')
  analytics(@Param('projectId') projectId: string) {
    return this.pm.getAnalytics(parseInt(projectId, 10));
  }

  @Put('project/:projectId/configure')
  @Roles(...SUPERVISOR_ROLES)
  configure(
    @Param('projectId') projectId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.configureProject(
      parseInt(projectId, 10),
      body as Parameters<PmProjectManagementService['configureProject']>[1],
      req.user.id,
    );
  }

  @Get('project/:projectId/work-packages')
  listWorkPackages(@Param('projectId') projectId: string) {
    return this.pm.listWorkPackages(parseInt(projectId, 10));
  }

  @Post('project/:projectId/work-packages')
  @Roles(...SUPERVISOR_ROLES)
  createWorkPackage(
    @Param('projectId') projectId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.createWorkPackage(
      parseInt(projectId, 10),
      body as Parameters<PmProjectManagementService['createWorkPackage']>[1],
      req.user.id,
    );
  }

  @Post('work-packages/:id/publish')
  @Roles(...SUPERVISOR_ROLES)
  publishWorkPackage(
    @Param('id') id: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.publishWorkPackage(id, req.user.id);
  }

  @Get('project/:projectId/tasks')
  listTasks(
    @Param('projectId') projectId: string,
    @Query('workPackageId') workPackageId?: string,
  ) {
    return this.pm.listTasks(parseInt(projectId, 10), workPackageId);
  }

  @Post('project/:projectId/tasks')
  @Roles(...SUPERVISOR_ROLES)
  createTask(
    @Param('projectId') projectId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.createTask(
      parseInt(projectId, 10),
      body as Parameters<PmProjectManagementService['createTask']>[1],
      req.user.id,
    );
  }

  @Post('tasks/:taskId/start')
  startTask(
    @Param('taskId') taskId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.startTask(taskId, req.user.id);
  }

  @Post('tasks/:taskId/progress')
  updateProgress(
    @Param('taskId') taskId: string,
    @Body() body: { progressPct: number },
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.updateTaskProgress(taskId, body.progressPct, req.user.id);
  }

  @Get('project/:projectId/schedule')
  listSchedule(@Param('projectId') projectId: string) {
    return this.pm.listSchedule(parseInt(projectId, 10));
  }

  @Post('project/:projectId/schedule')
  @Roles(...SUPERVISOR_ROLES)
  createSchedule(
    @Param('projectId') projectId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.createScheduleEntry(
      parseInt(projectId, 10),
      body as Parameters<PmProjectManagementService['createScheduleEntry']>[1],
      req.user.id,
    );
  }

  @Post('project/:projectId/assignments/worker')
  assignWorker(
    @Param('projectId') projectId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.assignWorker(
      parseInt(projectId, 10),
      body as Parameters<PmProjectManagementService['assignWorker']>[1],
      req.user.id,
    );
  }

  @Post('project/:projectId/assignments/equipment')
  assignEquipment(
    @Param('projectId') projectId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.assignEquipment(
      parseInt(projectId, 10),
      body as Parameters<PmProjectManagementService['assignEquipment']>[1],
      req.user.id,
    );
  }

  @Get('project/:projectId/permits')
  listPermits(@Param('projectId') projectId: string) {
    return this.pm.listPermits(parseInt(projectId, 10));
  }

  @Post('project/:projectId/permits')
  @Roles(...SUPERVISOR_ROLES)
  createPermit(
    @Param('projectId') projectId: string,
    @Body()
    body: { permitType: PmPermitType; title: string } & Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.createPermit(
      parseInt(projectId, 10),
      body as Parameters<PmProjectManagementService['createPermit']>[1],
      req.user.id,
    );
  }

  @Post('permits/:id/submit')
  submitPermit(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.pm.submitPermitForApproval(id, req.user.id);
  }

  @Post('permits/:id/approve')
  @Roles(...SUPERVISOR_ROLES)
  approvePermit(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.pm.approvePermit(id, req.user.id);
  }

  @Post('permits/:id/activate')
  @Roles(...SUPERVISOR_ROLES)
  activatePermit(
    @Param('id') id: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.activatePermit(id, req.user.id);
  }

  @Post('attachments')
  addAttachment(@Body() body: Record<string, unknown>) {
    return this.pm.addAttachment(
      body as Parameters<PmProjectManagementService['addAttachment']>[0],
    );
  }

  @Get('attachments')
  listAttachments(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    return this.pm.listAttachments(entityType, entityId);
  }

  @Get('sync/:projectId')
  offlineBundle(@Param('projectId') projectId: string) {
    return this.pm.buildOfflineBundle(parseInt(projectId, 10));
  }

  @Post('sync/:projectId')
  applyOfflineSync(
    @Param('projectId') projectId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.pm.applyOfflineSync(
      parseInt(projectId, 10),
      body as Parameters<PmProjectManagementService['applyOfflineSync']>[1],
      req.user.id,
    );
  }

  @Get('project/:projectId/cail/insights')
  cailInsights(@Param('projectId') projectId: string) {
    return this.cail.projectInsights(parseInt(projectId, 10));
  }

  @Post('tasks/:taskId/gate')
  taskGate(@Param('taskId') taskId: string) {
    return this.pm.evaluateTaskGateById(taskId);
  }

  @Get('projects')
  listProjects(
    @Query('companyId') companyId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.pm.listProjects(
      companyId ? Number(companyId) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('project/:projectId/assignments/workers')
  listWorkerAssignments(@Param('projectId') projectId: string) {
    return this.pm.listWorkerAssignments(parseInt(projectId, 10));
  }

  @Get('project/:projectId/assignments/equipment')
  listEquipmentAssignments(@Param('projectId') projectId: string) {
    return this.pm.listEquipmentAssignments(parseInt(projectId, 10));
  }

  @Get('project/:projectId/activity')
  projectActivity(@Param('projectId') projectId: string) {
    return this.pm.getProjectActivity(parseInt(projectId, 10));
  }

  @Get('project/:projectId/readiness')
  projectReadiness(@Param('projectId') projectId: string) {
    return this.pm.getProjectReadiness(parseInt(projectId, 10));
  }

  @Post('project/:projectId/scheduling/optimize')
  @UseGuards(VeraFeatureGuard)
  @RequireFeature('predictive_scheduling')
  @Roles(...SUPERVISOR_ROLES)
  optimizeSchedule(
    @Param('projectId') projectId: string,
    @Query('companyId', ParseIntPipe) companyId: number,
    @Query('unionHallId') unionHallId?: string,
  ) {
    return this.bridge.runPredictiveOptimize(
      companyId,
      parseInt(projectId, 10),
      unionHallId ? Number(unionHallId) : undefined,
    );
  }

  @Post('project/:projectId/scheduling/apply')
  @UseGuards(VeraFeatureGuard)
  @RequireFeature('predictive_scheduling')
  @Roles(...SUPERVISOR_ROLES)
  applySchedule(
    @Param('projectId') projectId: string,
    @Body() body: { report: Record<string, unknown> },
    @Req() req: { user: { id: number } },
  ) {
    return this.bridge.applyPredictiveSchedule(
      parseInt(projectId, 10),
      body.report as Parameters<
        PmSchedulingBridgeService['applyPredictiveSchedule']
      >[1],
      req.user.id,
    );
  }

  @Post('project/:projectId/dispatch/run')
  @UseGuards(VeraFeatureGuard)
  @RequireFeature('autonomous_dispatch')
  @Roles(...SUPERVISOR_ROLES)
  runDispatch(
    @Param('projectId') projectId: string,
    @Query('companyId', ParseIntPipe) companyId: number,
    @Query('autoExecute') autoExecute?: string,
    @Query('unionHallId') unionHallId?: string,
  ) {
    return this.bridge.runAutonomousDispatch(
      companyId,
      parseInt(projectId, 10),
      autoExecute !== 'false',
      unionHallId ? Number(unionHallId) : undefined,
    );
  }

  @Post('project/:projectId/dispatch/apply')
  @UseGuards(VeraFeatureGuard)
  @RequireFeature('autonomous_dispatch')
  @Roles(...SUPERVISOR_ROLES)
  applyDispatch(
    @Param('projectId') projectId: string,
    @Body() body: { report: Record<string, unknown> },
    @Req() req: { user: { id: number } },
  ) {
    return this.bridge.applyAutonomousDispatch(
      parseInt(projectId, 10),
      body.report as Parameters<
        PmSchedulingBridgeService['applyAutonomousDispatch']
      >[1],
      req.user.id,
    );
  }
}
