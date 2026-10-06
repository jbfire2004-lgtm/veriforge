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
  BadgeService,
  type ComplianceBadgeStatus,
  type ForgeCheckStatus,
} from '../services/badge.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/badges')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeBadgeController {
  constructor(private readonly badges: BadgeService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_VIEW)
  list(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.badges.list(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    return buildSuccess(this.badges.analytics(userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Get(':badgeId')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_VIEW)
  getById(
    @Param('badgeId') badgeId: string,
    @Req() req: VeriForgeRequest,
  ) {
    return buildSuccess(this.badges.getById(badgeId), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('create')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_START)
  create(
    @Body()
    body: {
      firstName: string;
      lastName: string;
      role: string;
      company: string;
      trainingPercent?: number;
      forgeStatus?: ForgeCheckStatus;
      complianceStatus?: ComplianceBadgeStatus;
      complianceScore?: number;
      expiresAt?: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const badge = this.badges.create(body, userId);
    return buildSuccess(badge, {
      userId,
      forgeStatus: badge.accessDecision === 'ALLOW' ? 'verified' : 'failed',
    });
  }

  @Post(':badgeId/status')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_START)
  updateStatus(
    @Param('badgeId') badgeId: string,
    @Body()
    body: {
      trainingPercent?: number;
      forgeStatus?: ForgeCheckStatus;
      complianceStatus?: ComplianceBadgeStatus;
      complianceScore?: number;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const badge = this.badges.updateStatuses(badgeId, body, userId);
    return buildSuccess(badge, {
      userId,
      forgeStatus: badge.accessDecision === 'ALLOW' ? 'verified' : 'failed',
    });
  }

  @Post(':badgeId/scan')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.VERIFICATION_VIEW)
  scan(
    @Param('badgeId') badgeId: string,
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req);
    const result = this.badges.scan(badgeId, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus: result.accessDecision === 'ALLOW' ? 'verified' : 'failed',
    });
  }
}
