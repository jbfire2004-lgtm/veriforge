import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { buildSuccess } from '../veriforge-response';
import { VeriForgeExceptionFilter } from '../veriforge-exception.filter';
import {
  resolveUserId,
  type VeriForgeRequest,
} from '../veriforge-request.util';
import {
  ContractorOnboardingService,
  type DocKind,
  type DocStatus,
  type OnboardingRole,
} from '../services/contractor-onboarding.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/contractor-onboarding')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeContractorOnboardingController {
  constructor(private readonly onboarding: ContractorOnboardingService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.onboarding.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.onboarding.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus:
        data.complianceGaps > 0 || data.accessDenied > 0
          ? 'failed'
          : 'verified',
    });
  }

  @Post('companies')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  registerCompany(
    @Body()
    body: {
      name: string;
      address: string;
      safetyOfficer: string;
      industry: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.onboarding.registerCompany(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('identity')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  captureIdentity(
    @Body()
    body: {
      name: string;
      role: OnboardingRole;
      companyId: string;
      contact: string;
      certifications?: string[];
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.onboarding.captureIdentity(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('documents')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  upsertDocument(
    @Body()
    body: {
      companyId: string;
      contractorId?: string | null;
      kind: DocKind;
      name: string;
      status: DocStatus;
      expiresAt?: string | null;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const doc = this.onboarding.upsertDocument(body, userId);
    return buildSuccess(doc, {
      userId,
      forgeStatus:
        doc.status === 'missing' || doc.status === 'expired'
          ? 'failed'
          : 'forged',
    });
  }

  @Post('documents/:id/status')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  setDocumentStatus(
    @Param('id') id: string,
    @Body()
    body: { status: DocStatus; expiresAt?: string | null; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const doc = this.onboarding.setDocumentStatus(
      id,
      body.status,
      body.expiresAt ?? null,
      userId,
    );
    return buildSuccess(doc, {
      userId,
      forgeStatus:
        doc.status === 'missing' || doc.status === 'expired'
          ? 'failed'
          : 'verified',
    });
  }

  @Post('training/:id/bump')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  bumpTraining(
    @Param('id') id: string,
    @Body() body: { delta?: number; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.onboarding.bumpTraining(id, body.delta ?? 25, userId),
      { userId, forgeStatus: 'forged' },
    );
  }

  @Post(':id/forge-check')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  runForgeCheck(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req) ?? 0;
    const record = this.onboarding.runForgeCheck(id, userId);
    return buildSuccess(record, {
      userId,
      forgeStatus:
        record.forgeStatus === 'Pass'
          ? 'verified'
          : record.forgeStatus === 'Fail'
            ? 'failed'
            : 'pending',
    });
  }

  @Post(':id/badge')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  generateBadge(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req) ?? 0;
    return buildSuccess(this.onboarding.generateBadge(id, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post(':id/access')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  evaluateAccess(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req) ?? 0;
    const record = this.onboarding.evaluateAccess(id, userId);
    return buildSuccess(record, {
      userId,
      forgeStatus: record.access === 'allow' ? 'verified' : 'failed',
    });
  }
}
