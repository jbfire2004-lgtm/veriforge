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
import { SafetyMeetingStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmSafetyMeetingsService } from './pm-safety-meetings.service';
import { PmSafetyMeetingsTemplatesService } from './pm-safety-meetings-templates.service';
import { PmSafetyMeetingsTopicLibraryService } from './pm-safety-meetings-topic-library.service';
import { PmSafetyMeetingsIntelligenceService } from './pm-safety-meetings-intelligence.service';

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

@Controller(`${API_V1_PREFIX}/pm/safety-meetings`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmSafetyMeetingsController {
  constructor(
    private readonly meetings: PmSafetyMeetingsService,
    private readonly templates: PmSafetyMeetingsTemplatesService,
    private readonly topics: PmSafetyMeetingsTopicLibraryService,
    private readonly intelligence: PmSafetyMeetingsIntelligenceService,
  ) {}

  @Get()
  list(
    @Query('projectId') projectId?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: SafetyMeetingStatus,
    @Query('meetingType') meetingType?: string,
  ) {
    return this.meetings.list({
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      status,
      meetingType,
    });
  }

  @Get('analytics/project/:projectId')
  analytics(@Param('projectId') projectId: string) {
    return this.intelligence.projectAnalytics(parseInt(projectId, 10));
  }

  @Get('access/worker')
  workerAccess(
    @Query('workerId') workerId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.meetings.workerMeetingAccess(
      parseInt(workerId, 10),
      parseInt(projectId, 10),
    );
  }

  @Post('sync')
  sync(
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.meetings.syncOffline({
      ...body,
      createdByUserId:
        (body.createdByUserId as number) ?? req.user?.userId ?? 0,
    });
  }

  @Get('topics')
  listTopics(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('category') category?: string,
  ) {
    return this.topics.listTopics(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
      category,
    );
  }

  @Post('topics')
  createTopic(@Body() body: Record<string, unknown>) {
    return this.topics.createTopic(body as never);
  }

  @Get('topics/suggest')
  suggestTopics(
    @Query('projectId') projectId: string,
    @Query('companyId') companyId: string,
  ) {
    return this.topics.suggestTopics(
      parseInt(projectId, 10),
      parseInt(companyId, 10),
    );
  }

  @Get('templates')
  listTemplates(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('meetingType') meetingType?: string,
  ) {
    return this.templates.list(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
      meetingType,
    );
  }

  @Post('templates')
  createTemplate(@Body() body: Record<string, unknown>) {
    return this.templates.create(body as never);
  }

  @Post('templates/:id/publish')
  @Roles(...SUPERVISOR_ROLES)
  publishTemplate(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.templates.publish(id, req.user?.userId ?? 0);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.meetings.get(id);
  }

  @Post()
  create(
    @Req() req: { user?: { userId?: number } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.meetings.create({
      ...(body as object),
      createdByUserId: req.user?.userId ?? 0,
    } as Parameters<PmSafetyMeetingsService['create']>[0]);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @Req() req: { user?: { userId?: number } }) {
    return this.meetings.publish(id, req.user?.userId ?? 0);
  }

  @Post(':id/start')
  start(@Param('id') id: string, @Req() req: { user?: { userId?: number } }) {
    return this.meetings.start(id, req.user?.userId ?? 0);
  }

  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.meetings.transition(id, 'completed', req.user?.userId ?? 0);
  }

  @Post(':id/lock')
  @Roles(...SUPERVISOR_ROLES)
  lock(@Param('id') id: string, @Req() req: { user?: { userId?: number } }) {
    return this.meetings.transition(id, 'locked', req.user?.userId ?? 0);
  }

  @Post(':id/review')
  @Roles(...SUPERVISOR_ROLES)
  review(
    @Param('id') id: string,
    @Body() body: { outcome: string; notes?: string },
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.meetings.supervisorReview(
      id,
      body.outcome as 'approved' | 'rejected' | 'changes_requested',
      req.user?.userId ?? 0,
      body.notes,
    );
  }

  @Post(':id/attendees')
  addAttendee(
    @Param('id') id: string,
    @Body() body: { workerId: number },
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.meetings.addAttendee(id, body.workerId, req.user?.userId ?? 0);
  }

  @Post(':id/attendees/:workerId/check-in')
  checkIn(
    @Param('id') id: string,
    @Param('workerId') workerId: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.meetings.checkInAttendee(
      id,
      parseInt(workerId, 10),
      req.user?.userId ?? 0,
    );
  }

  /** Worker field sign-on: roster + present + signature (on-project tracking). */
  @Post(':id/sign-on')
  signOn(
    @Param('id') id: string,
    @Body()
    body: {
      workerId: number;
      signatureData?: string;
      signerName?: string;
    },
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.meetings.signOnWorker({
      meetingId: id,
      workerId: body.workerId,
      actorId: req.user?.userId ?? 0,
      signatureData: body.signatureData,
      signerName: body.signerName,
    });
  }

  @Post(':id/signatures')
  sign(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.meetings.addSignature({
      meetingId: id,
      ...(body as object),
    } as Parameters<PmSafetyMeetingsService['addSignature']>[0]);
  }

  @Post(':id/corrective-actions')
  createCapa(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.meetings.createCapaFromMeeting({
      meetingId: id,
      ...(body as object),
      createdByUserId: req.user?.userId ?? 0,
    } as Parameters<PmSafetyMeetingsService['createCapaFromMeeting']>[0]);
  }

  @Get(':id/intelligence/score')
  score(@Param('id') id: string) {
    return this.intelligence.scoreMeeting(id);
  }

  @Put(':id/station/:stationId')
  linkStation(@Param('id') id: string, @Param('stationId') stationId: string) {
    return this.meetings.linkStation(id, parseInt(stationId, 10));
  }
}
