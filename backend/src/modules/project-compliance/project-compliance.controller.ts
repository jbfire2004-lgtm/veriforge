import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Request } from 'express';

import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

import { Roles } from '../../auth/roles.decorator';

import { RolesGuard } from '../../auth/roles.guard';

import { AuditLogService } from '../../audit/audit-log.service';

import { V1_ROUTES } from '../../config/routes.registry';

import { rolesFor } from '../../security/rbac';

import { ApiSuccess } from '../api-platform/decorators/api-success.decorator';

import { ApiSuccessInterceptor } from '../api-platform/interceptors/api-success.interceptor';

import { ProjectScopeGuard } from '../api-platform/guards/project-scope.guard';

import { ProjectScoped } from '../api-platform/decorators/scoped.decorator';

import { ProjectComplianceAlertsService } from './project-compliance-alerts.service';

import { ProjectComplianceService } from './project-compliance.service';

import { CreateComplianceRuleDto } from './dto/create-compliance-rule.dto';

type AuthReq = Request & { user?: { id: number; companyId?: number | null } };

@UseGuards(JwtAuthGuard, RolesGuard, ProjectScopeGuard)
@UseInterceptors(ApiSuccessInterceptor)
@Controller(V1_ROUTES.projects)
export class ProjectComplianceController {
  constructor(
    private readonly compliance: ProjectComplianceService,

    private readonly alerts: ProjectComplianceAlertsService,

    private readonly audit: AuditLogService,
  ) {}

  @Get(':id/compliance')
  @Roles(...rolesFor('viewProjectCompliance'))
  @ApiSuccess()
  @ProjectScoped('id')
  projectCompliance(@Param('id', ParseIntPipe) id: number) {
    return this.compliance.evaluateProject(id);
  }

  @Get(':id/workers/:workerId/compliance')
  @Roles(...rolesFor('viewProjectCompliance'))
  @ApiSuccess()
  @ProjectScoped('id')
  workerCompliance(
    @Param('id', ParseIntPipe) id: number,

    @Param('workerId', ParseIntPipe) workerId: number,
  ) {
    return this.compliance.evaluateWorkerOnProject(id, workerId);
  }

  @Get(':id/compliance/alerts')
  @Roles(...rolesFor('viewProjectCompliance'))
  @ApiSuccess()
  @ProjectScoped('id')
  async listAlerts(
    @Param('id', ParseIntPipe) id: number,

    @Query('includeResolved') includeResolved?: string,
  ) {
    // Keep alert rows aligned with current compliance state for UI/API callers.
    await this.alerts.syncAlertsForProject(id);
    return this.alerts.listAlerts(id, {
      includeResolved: includeResolved === 'true',
    });
  }

  @Post(':id/compliance/alerts/:alertId/resolve')
  @Roles(...rolesFor('manageProjectCompliance'))
  @ApiSuccess()
  @ProjectScoped('id')
  async resolveAlert(
    @Param('id', ParseIntPipe) id: number,

    @Param('alertId', ParseIntPipe) alertId: number,

    @Req() req: AuthReq,
  ) {
    const result = await this.alerts.resolveAlert(id, alertId);

    await this.audit.logAudit(
      req.user
        ? { id: req.user.id, companyId: req.user.companyId ?? undefined }
        : null,

      'project_compliance.alert.resolve',

      {
        type: 'ProjectComplianceAlert',
        id: alertId,
        tenantId: req.user?.companyId ?? undefined,
      },

      { projectId: id },
    );

    return result;
  }

  @Get(':id/compliance/rules')
  @Roles(...rolesFor('viewProjectCompliance'))
  @ApiSuccess()
  @ProjectScoped('id')
  listRules(@Param('id', ParseIntPipe) id: number) {
    return this.compliance.listRules(id);
  }

  @Post(':id/compliance/rules')
  @Roles(...rolesFor('manageProjectCompliance'))
  @ApiSuccess()
  @ProjectScoped('id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createRule(
    @Param('id', ParseIntPipe) id: number,

    @Body() body: CreateComplianceRuleDto,

    @Req() req: AuthReq,
  ) {
    const result = await this.compliance.createRule(id, body);

    await this.audit.logAudit(
      req.user
        ? { id: req.user.id, companyId: req.user.companyId ?? undefined }
        : null,

      'project_compliance.rule.create',

      {
        type: 'ProjectComplianceRule',
        id: result.id,
        tenantId: req.user?.companyId ?? undefined,
      },

      { projectId: id, ruleType: body.ruleType },
    );

    return result;
  }
}
