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
import { PmContractorDispatchStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CONTRACTOR_ROLES,
  PmContractorPortalAccessService,
  PRIME_PORTAL_ROLES,
} from './pm-contractor-portal-access.service';
import { PmContractorPortalInboxService } from './pm-contractor-portal-inbox.service';
import { PmContractorPortalFindingsService } from './pm-contractor-portal-findings.service';
import { PmContractorPortalComplianceService } from './pm-contractor-portal-compliance.service';
import { PmContractorPortalMessagesService } from './pm-contractor-portal-messages.service';
import { PmInspectionSharedService } from '../pm-inspections/pm-inspection-shared.service';
import { ContractorComplianceEngineService } from './contractor-compliance-engine.service';
import type { ContractorComplianceEngineInput } from './contractor-compliance-engine.types';
import type { SecurityActor } from '../security/security.types';

const PORTAL_ROLES: UserRole[] = [...CONTRACTOR_ROLES, ...PRIME_PORTAL_ROLES];

@Controller(`${API_V1_PREFIX}/pm/contractor-portal`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PORTAL_ROLES)
export class PmContractorPortalController {
  constructor(
    private readonly access: PmContractorPortalAccessService,
    private readonly inbox: PmContractorPortalInboxService,
    private readonly findings: PmContractorPortalFindingsService,
    private readonly compliance: PmContractorPortalComplianceService,
    private readonly messages: PmContractorPortalMessagesService,
    private readonly notifications: NotificationsService,
    private readonly sharedReports: PmInspectionSharedService,
    private readonly complianceEngine: ContractorComplianceEngineService,
  ) {}

  /** CONTRACTOR_COMPLIANCE_ENGINE — evaluate contractor safety and compliance risk */
  @Post('engine/generate')
  @Roles(
    UserRole.COMPANY_ADMIN,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.SUPERVISOR,
  )
  generateComplianceEngine(@Body() body: ContractorComplianceEngineInput) {
    return this.complianceEngine.generate(body);
  }

  @Post('memberships/:membershipId/engine/generate')
  @Roles(
    UserRole.COMPANY_ADMIN,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.SUPERVISOR,
  )
  async generateComplianceEngineFromMembership(
    @Param('membershipId') membershipId: string,
    @Body()
    body?: { work_scope?: ContractorComplianceEngineInput['work_scope'] },
  ) {
    const input = await this.complianceEngine.buildInputFromMembership(
      membershipId,
      body?.work_scope,
    );
    return this.complianceEngine.generate(input);
  }

  private securityActor(req: {
    user: { id: number; role: UserRole; companyId?: number };
  }): SecurityActor {
    return {
      id: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId ?? null,
    };
  }

  private actor(req: {
    user: { id: number; role: UserRole; companyId?: number };
  }) {
    return {
      userId: req.user.id,
      role: req.user.role,
      companyId: req.user.companyId ?? null,
    };
  }

  @Get('memberships')
  listMemberships(
    @Req() req: { user: { id: number; role: UserRole; companyId?: number } },
  ) {
    const actor = this.actor(req);
    const contractorCompanyId = this.access.requireContractorCompany(actor);
    return this.access.listMembershipsForContractor(contractorCompanyId);
  }

  @Get('memberships/prime')
  @Roles(
    UserRole.COMPANY_ADMIN,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.SUPERVISOR,
  )
  listPrimeMemberships(
    @Query('primeCompanyId') primeCompanyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.access.listMembershipsForPrime(
      parseInt(primeCompanyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('dashboard')
  dashboard(
    @Req() req: { user: { id: number; role: UserRole; companyId?: number } },
  ) {
    const actor = this.actor(req);
    return Promise.all([
      this.inbox.listInbox(actor),
      this.findings.listFindings(actor, { unacknowledgedOnly: false }),
      this.compliance.getDashboard(actor),
    ]).then(([inbox, findingList, complianceData]) => ({
      inbox: inbox.summary,
      findings: findingList.summary,
      compliance: complianceData.summary,
    }));
  }

  @Get('inbox')
  listInbox(
    @Req() req: { user: { id: number; role: UserRole; companyId?: number } },
    @Query('status') status?: PmContractorDispatchStatus,
    @Query('overdueOnly') overdueOnly?: string,
  ) {
    return this.inbox.listInbox(this.actor(req), {
      status,
      overdueOnly: overdueOnly === 'true',
    });
  }

  @Post('inbox/:dispatchId/acknowledge')
  acknowledgeInbox(
    @Req() req: { user: { id: number; role: UserRole; companyId?: number } },
    @Param('dispatchId') dispatchId: string,
  ) {
    return this.inbox.acknowledgeDispatch(this.actor(req), dispatchId);
  }

  @Post('inbox/:dispatchId/evidence')
  uploadEvidence(
    @Req() req: { user: { id: number; role: UserRole; companyId?: number } },
    @Param('dispatchId') dispatchId: string,
    @Body()
    body: {
      dataUrl?: string;
      storageKey?: string;
      fileName?: string;
      mimeType?: string;
      notes?: string;
    },
  ) {
    return this.inbox.uploadEvidence(this.actor(req), dispatchId, body);
  }

  @Post('inbox/:dispatchId/complete')
  completeInbox(
    @Req() req: { user: { id: number; role: UserRole; companyId?: number } },
    @Param('dispatchId') dispatchId: string,
    @Body()
    body?: {
      storageKey?: string;
      dataUrl?: string;
      fileName?: string;
      mimeType?: string;
      notes?: string;
    },
  ) {
    return this.inbox.completeDispatch(this.actor(req), dispatchId, body);
  }

  @Get('shared-reports')
  listSharedReports(
    @Req() req: { user: { id: number; role: UserRole; companyId?: number } },
    @Query('projectId') projectId?: string,
  ) {
    return this.sharedReports.listSharedReports(
      this.securityActor(req),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('findings')
  listFindings(
    @Req() req: { user: { id: number; role: UserRole; companyId?: number } },
    @Query('projectId') projectId?: string,
    @Query('unacknowledgedOnly') unacknowledgedOnly?: string,
  ) {
    return this.findings.listFindings(this.actor(req), {
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      unacknowledgedOnly: unacknowledgedOnly === 'true',
    });
  }

  @Post('findings/:deficiencyId/acknowledge')
  acknowledgeFinding(
    @Req() req: { user: { id: number; role: UserRole; companyId?: number } },
    @Param('deficiencyId') deficiencyId: string,
    @Body() body?: { notes?: string },
  ) {
    return this.findings.acknowledgeFinding(
      this.actor(req),
      deficiencyId,
      body?.notes,
    );
  }

  @Get('compliance')
  complianceDashboard(
    @Req() req: { user: { id: number; role: UserRole; companyId?: number } },
    @Query('projectId') projectId?: string,
  ) {
    return this.compliance.getDashboard(
      this.actor(req),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('messages')
  listMessages(
    @Req() req: { user: { id: number; role: UserRole; companyId?: number } },
    @Query('primeCompanyId') primeCompanyId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.messages.listThreads(this.actor(req), {
      primeCompanyId: primeCompanyId ? parseInt(primeCompanyId, 10) : undefined,
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Post('messages')
  sendMessage(
    @Req() req: { user: { id: number; role: UserRole; companyId?: number } },
    @Body()
    body: {
      primeCompanyId: number;
      contractorCompanyId: number;
      projectId?: number;
      text: string;
      relatedType?: string;
      relatedId?: string;
    },
  ) {
    return this.messages.sendMessage(this.actor(req), body);
  }

  @Put('messages/:messageId/read')
  markMessageRead(
    @Req() req: { user: { id: number; role: UserRole; companyId?: number } },
    @Param('messageId') messageId: string,
  ) {
    return this.messages.markRead(this.actor(req), messageId);
  }

  @Get('notifications')
  listNotifications(
    @Req() req: { user: { id: number } },
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notifications.listForUser(req.user.id, {
      unreadOnly: unreadOnly === 'true',
      take: 50,
    });
  }

  @Put('notifications/:id/read')
  markNotificationRead(
    @Req() req: { user: { id: number } },
    @Param('id') id: string,
  ) {
    return this.notifications.markRead(req.user.id, parseInt(id, 10));
  }

  @Post('memberships')
  @Roles(
    UserRole.COMPANY_ADMIN,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
  )
  createMembership(
    @Body()
    body: {
      primeCompanyId: number;
      contractorCompanyId: number;
      projectId?: number;
    },
  ) {
    return this.access.ensureMembership(
      body.primeCompanyId,
      body.contractorCompanyId,
      body.projectId,
    );
  }
}
