import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { PmSafetyWorkflowStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { API_V1_PREFIX } from '../config/routes';
import { CreatePmSafetyWorkflowDto } from './dto/create-pm-safety-workflow.dto';
import { SignPmSafetyWorkerDto } from './dto/sign-pm-safety-worker.dto';
import { TransitionPmSafetyWorkflowDto } from './dto/transition-pm-safety-workflow.dto';
import type { PmSafetyActor } from './pm-safety-workflow.service';
import { PmSafetyWorkflowService } from './pm-safety-workflow.service';

const STATUS_FILTER: PmSafetyWorkflowStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'CLOSED',
  'CANCELLED',
];

const ACTOR_ROLES: UserRole[] = [
  'ADMIN',
  'SUPERVISOR',
  'PROJECT_MANAGER',
  'WORKER',
];

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.PROJECT_MANAGER,
)
@Controller(`${API_V1_PREFIX}/pm/safety-workflows`)
export class PmSafetyWorkflowController {
  constructor(private readonly pmSafety: PmSafetyWorkflowService) {}

  @Get('definition')
  definition() {
    return this.pmSafety.getDefinition();
  }

  @Get()
  list(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
  ) {
    const cidRaw =
      companyId != null && companyId !== '' ? parseInt(companyId, 10) : NaN;
    const st =
      status && STATUS_FILTER.includes(status as PmSafetyWorkflowStatus)
        ? (status as PmSafetyWorkflowStatus)
        : undefined;
    return this.pmSafety.list({
      companyId: Number.isFinite(cidRaw) ? cidRaw : undefined,
      status: st,
    });
  }

  @Post()
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  create(@Body() dto: CreatePmSafetyWorkflowDto) {
    return this.pmSafety.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pmSafety.findOne(id);
  }

  @Get(':id/state')
  state(@Param('id', ParseIntPipe) id: number) {
    return this.pmSafety.getState(id);
  }

  @Post(':id/sign-worker')
  signWorker(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SignPmSafetyWorkerDto,
    @Headers('x-pm-actor-user-id') actorUserId?: string,
    @Headers('x-pm-actor-role') actorRole?: string,
  ) {
    const actor = this.parseActorRequired(actorUserId, actorRole);
    return this.pmSafety.signWorker(id, dto, actor);
  }

  @Post(':id/transition')
  @Roles(
    UserRole.WORKER,
    UserRole.SUPERVISOR,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
  )
  transition(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransitionPmSafetyWorkflowDto,
    @Headers('x-pm-actor-user-id') actorUserId?: string,
    @Headers('x-pm-actor-role') actorRole?: string,
  ) {
    const actor = this.parseActorRequired(actorUserId, actorRole);
    return this.pmSafety.transition(id, dto.action, actor, dto.note);
  }

  @Get(':id/events')
  events(@Param('id', ParseIntPipe) id: number) {
    return this.pmSafety.listEvents(id);
  }

  @Get(':id/export/pdf')
  async exportPdf(@Param('id', ParseIntPipe) id: number) {
    const buf = await this.pmSafety.exportPdfBuffer(id);
    return new StreamableFile(new Uint8Array(buf), {
      type: 'application/pdf',
      disposition: `attachment; filename="pm-safety-workflow-${id}.pdf"`,
    });
  }

  private parseActorRequired(
    userIdHeader?: string,
    roleHeader?: string,
  ): PmSafetyActor {
    if (
      userIdHeader == null ||
      userIdHeader === '' ||
      roleHeader == null ||
      roleHeader === ''
    ) {
      throw new HttpException(
        'Actor headers x-pm-actor-user-id and x-pm-actor-role are required',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.parseActorCore(userIdHeader, roleHeader);
  }

  private parseActorCore(
    userIdHeader: string,
    roleHeader: string,
  ): PmSafetyActor {
    const userId = parseInt(userIdHeader, 10);
    if (!Number.isFinite(userId)) {
      throw new HttpException(
        'x-pm-actor-user-id must be a positive integer',
        HttpStatus.BAD_REQUEST,
      );
    }
    const role = roleHeader as UserRole;
    if (!ACTOR_ROLES.includes(role)) {
      throw new HttpException(
        'x-pm-actor-role must be ADMIN, SUPERVISOR, PROJECT_MANAGER, or WORKER',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { userId, role };
  }
}
