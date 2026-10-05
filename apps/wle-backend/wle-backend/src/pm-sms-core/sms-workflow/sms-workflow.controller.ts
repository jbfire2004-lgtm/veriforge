import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { SMS_WORKFLOW_API_SURFACE } from './sms-workflow.constants';
import { SmsWorkflowService } from './sms-workflow.service';
import { SmsWorkflowListQueryDto } from './dto/sms-workflow-list-query.dto';
import { SmsWorkflowCreateDto } from './dto/sms-workflow-create.dto';
import { SmsWorkflowUpdateDto } from './dto/sms-workflow-update.dto';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
  UserRole.CONTRACTOR_ADMIN,
  UserRole.CONTRACTOR_USER,
];

/**
 * Unified SMS workflow REST facade.
 *
 * Canonical paths:
 * - GET    /api/v1/pm/sms/workflows
 * - GET    /api/v1/pm/sms/workflows/:entity
 * - POST   /api/v1/pm/sms/workflows/:entity
 * - GET    /api/v1/pm/sms/workflows/:entity/:id
 * - PATCH  /api/v1/pm/sms/workflows/:entity/:id
 * - POST   /api/v1/pm/sms/workflows/:entity/:id/submit
 *
 * Entity-specific routes (hazards, photos, signatures) remain on legacy modules.
 */
@Controller(`${API_V1_PREFIX}/pm/sms/workflows`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class SmsWorkflowController {
  constructor(private readonly workflows: SmsWorkflowService) {}

  @Get()
  surface() {
    return SMS_WORKFLOW_API_SURFACE;
  }

  @Get(':entity')
  list(
    @Param('entity') entity: string,
    @Query() query: SmsWorkflowListQueryDto,
  ) {
    return this.workflows.list(entity, query);
  }

  @Post(':entity')
  create(
    @Param('entity') entity: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: SmsWorkflowCreateDto,
  ) {
    return this.workflows.create(entity, body, req.user?.userId);
  }

  @Get(':entity/:id')
  get(@Param('entity') entity: string, @Param('id') id: string) {
    return this.workflows.getById(entity, id);
  }

  @Patch(':entity/:id')
  patch(
    @Param('entity') entity: string,
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
    @Body() body: SmsWorkflowUpdateDto,
  ) {
    return this.workflows.patch(entity, id, body, req.user?.userId);
  }

  @Post(':entity/:id/submit')
  submit(
    @Param('entity') entity: string,
    @Param('id') id: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    return this.workflows.submit(entity, id, req.user?.userId);
  }
}
