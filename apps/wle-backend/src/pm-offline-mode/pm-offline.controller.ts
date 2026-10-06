import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmOfflineModeService } from './pm-offline-mode.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/** Spec-aligned alias: `/api/v1/pm/offline` */
@Controller(`${API_V1_PREFIX}/pm/offline`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmOfflineController {
  constructor(private readonly offline: PmOfflineModeService) {}

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @Throttle(30, 60)
  sync(
    @Body()
    body: {
      deviceId: string;
      companyId?: number;
      projectId?: number;
      actions: Array<Record<string, unknown>>;
      batchId?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.offline.sync(
      {
        deviceId: body.deviceId,
        companyId: body.companyId,
        projectId: body.projectId,
        batchId: body.batchId,
        actions: (body.actions ?? []).map((a) => ({
          type: String(a.type),
          recordId: a.recordId as string | undefined,
          payload: (a.payload as Record<string, unknown>) ?? a,
          clientVersion: a.clientVersion as number | undefined,
          lastModified: a.lastModified as string | undefined,
        })),
      },
      req.user.id,
    );
  }

  @Post('conflict/resolve')
  resolveConflict(
    @Body()
    body: {
      conflictId: string;
      strategy?: 'prefer_local' | 'prefer_server' | 'merge';
      resolvedValue?: Record<string, unknown>;
      retrySync?: boolean;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.offline.resolveConflict(body.conflictId, body, req.user.id);
  }

  @Get('device/:id')
  deviceStatus(
    @Param('id') deviceId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.offline.getDeviceStatus(
      deviceId,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }
}
