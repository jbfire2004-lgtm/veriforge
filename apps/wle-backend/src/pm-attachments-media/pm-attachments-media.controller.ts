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
import { PmAttachmentsMediaService } from './pm-attachments-media.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/attachments-media`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmAttachmentsMediaController {
  constructor(private readonly media: PmAttachmentsMediaService) {}

  @Post('upload')
  upload(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.media.upload(
      {
        companyId: body.companyId as number | undefined,
        projectId: body.projectId as number | undefined,
        moduleType: String(body.moduleType ?? body.entityType),
        moduleRecordId: String(body.moduleRecordId ?? body.entityId),
        fileName: body.fileName as string | undefined,
        mimeType: body.mimeType as string | undefined,
        storageKey: body.storageKey as string | undefined,
        dataUrl: body.dataUrl as string | undefined,
        fileSize: body.fileSize as number | undefined,
        coreFileId: body.coreFileId as number | undefined,
        clientSyncId: body.clientSyncId as string | undefined,
      },
      req.user.id,
    );
  }

  @Post('offline/sync')
  offlineSync(
    @Body()
    body: {
      projectId: number;
      attachments?: Array<Record<string, unknown>>;
      annotations?: Array<Record<string, unknown>>;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.media.applyOfflineSync(body.projectId, body, req.user.id);
  }

  @Get('entity/list')
  listEntity(
    @Query('moduleType') moduleType: string,
    @Query('moduleRecordId') moduleRecordId: string,
  ) {
    return this.media.listForEntity(moduleType, moduleRecordId);
  }

  @Get('analytics/project/:projectId')
  analyticsProject(@Param('projectId') projectId: string) {
    return this.media.analytics(parseInt(projectId, 10));
  }

  @Get('sync/project/:projectId')
  syncBundle(@Param('projectId') projectId: string) {
    return this.media.syncBundle(parseInt(projectId, 10));
  }

  @Get(':id/thumbnail')
  thumbnail(@Param('id') id: string) {
    return this.media.getThumbnail(id);
  }

  @Get(':id/predict')
  predict(@Param('id') id: string) {
    return this.media.predict(id);
  }

  @Post(':id/annotate')
  annotate(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.media.annotate(
      id,
      {
        annotationType: String(body.annotationType ?? 'markup'),
        annotationData: (body.annotationData as Record<string, unknown>) ?? {},
        clientSyncId: body.clientSyncId as string | undefined,
      },
      req.user.id,
    );
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.media.getById(id);
  }
}
