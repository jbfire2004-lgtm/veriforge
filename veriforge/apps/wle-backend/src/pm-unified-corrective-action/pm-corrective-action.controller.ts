import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmUnifiedCorrectiveActionService } from './pm-unified-corrective-action.service';

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

/** Spec-aligned alias: `/api/v1/pm/corrective-action` */
@Controller(`${API_V1_PREFIX}/pm/corrective-action`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmCorrectiveActionSpecController {
  constructor(private readonly unified: PmUnifiedCorrectiveActionService) {}

  @Post()
  @Roles(...SUPERVISOR_ROLES)
  create(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.unified.createUnified(
      {
        ...(body as object),
        createdByUserId: (body.createdByUserId as number) ?? req.user.id,
      } as Parameters<PmUnifiedCorrectiveActionService['createUnified']>[0],
      req.user.id,
    );
  }

  @Post('assign')
  @Roles(...SUPERVISOR_ROLES)
  assign(
    @Body()
    body: {
      actionId: string;
      userId?: number;
      workerId?: number;
      role?: 'primary' | 'secondary';
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.unified.assign(
      body.actionId,
      { userId: body.userId, workerId: body.workerId, role: body.role },
      req.user.id,
    );
  }

  @Post('escalate')
  @Roles(...SUPERVISOR_ROLES)
  escalate(@Body() body: { projectId: number }) {
    return this.unified.runEscalationSweep(body.projectId);
  }

  @Post('verify')
  @Roles(...SUPERVISOR_ROLES)
  async verify(
    @Body()
    body: {
      actionId: string;
      outcome: 'approve' | 'reject';
      role: string;
      notes?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    const result = await this.unified.verify(
      body.actionId,
      { outcome: body.outcome, role: body.role, notes: body.notes },
      req.user.id,
    );
    if (body.outcome === 'approve') {
      await this.unified.closeDeficiencyOnVerify(body.actionId);
    }
    return result;
  }

  @Post('offline/sync')
  offlineSync(
    @Body()
    body: {
      companyId: number;
      projectId: number;
      actions?: Array<Record<string, unknown>>;
      verifications?: Array<{
        actionId: string;
        outcome: 'approve' | 'reject';
        role: string;
        notes?: string;
      }>;
      attachments?: Array<{
        actionId: string;
        fileName?: string;
        mimeType?: string;
        dataUrl?: string;
        phase?: string;
        clientSyncId?: string;
      }>;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.unified.applyOfflineSync(
      body.companyId,
      body.projectId,
      {
        actions: body.actions,
        verifications: body.verifications,
        attachments: body.attachments,
      },
      req.user.id,
    );
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.unified.getAction(id);
  }
}
