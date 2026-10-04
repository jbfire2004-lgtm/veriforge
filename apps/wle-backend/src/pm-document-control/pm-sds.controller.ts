import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmDocumentControlService } from './pm-document-control.service';
import { PmDocumentCailIntelligenceService } from './pm-document-cail-intelligence.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/** Spec-aligned alias routes: `/api/v1/pm/sds` → document-control service */
@Controller(`${API_V1_PREFIX}/pm/sds`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmSdsController {
  constructor(
    private readonly docs: PmDocumentControlService,
    private readonly cail: PmDocumentCailIntelligenceService,
  ) {}

  @Post('offline/sync')
  offlineSync(
    @Body()
    body: {
      projectId: number;
      acknowledgments?: Array<Record<string, unknown>>;
      sdsCreates?: Array<Record<string, unknown>>;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.docs.applyOfflineSync(
      body.projectId,
      body as never,
      req.user.id,
    );
  }

  @Get('worker/:workerId/compliance')
  workerCompliance(
    @Param('workerId') workerId: string,
    @Query('projectId') projectId: string,
  ) {
    return this.cail.workerSdsCompliance(
      parseInt(workerId, 10),
      parseInt(projectId, 10),
    );
  }

  @Get('worker/:workerId')
  workerSds(
    @Param('workerId') workerId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.docs.getWorkerSds(
      parseInt(workerId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Post()
  create(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.docs.createSds(
      body as Parameters<PmDocumentControlService['createSds']>[0],
      req.user.id,
    );
  }

  @Get(':id/hazards')
  extractHazards(@Param('id') id: string) {
    return this.docs.extractSdsHazards(id);
  }

  @Get(':id/score')
  score(@Param('id') id: string) {
    return this.docs.scoreSds(id);
  }

  @Post(':id/acknowledge')
  acknowledge(
    @Param('id') id: string,
    @Body()
    body: {
      workerId: number;
      signatureData?: string;
      deviceId?: string;
      clientSyncId?: string;
    },
  ) {
    return this.docs.acknowledgeDocument({
      workerId: body.workerId,
      sdsDocumentId: id,
      signatureData: body.signatureData,
      clientSyncId: body.clientSyncId,
      deviceId: body.deviceId,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.docs.getSds(id);
  }
}
