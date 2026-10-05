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
  SafetyCultureService,
  type BehaviorTone,
  type CulturePillar,
  type ImprovementPriority,
} from '../services/safety-culture.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/culture')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeCultureController {
  constructor(private readonly culture: SafetyCultureService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.culture.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.culture.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus: data.cultureScore < 70 ? 'failed' : 'verified',
    });
  }

  @Post('behaviors')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  logBehavior(
    @Body()
    body: {
      title: string;
      description: string;
      tone: BehaviorTone;
      location: string;
      category: CulturePillar;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const item = this.culture.logBehavior(body, userId);
    return buildSuccess(item, {
      userId,
      forgeStatus: item.tone === 'at_risk' ? 'failed' : 'forged',
    });
  }

  @Post('campaigns')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  createCampaign(
    @Body()
    body: {
      title: string;
      description: string;
      category: CulturePillar;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.culture.createCampaign(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('campaigns/:id/metrics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  updateCampaign(
    @Param('id') id: string,
    @Body()
    body: {
      participation?: number;
      completion?: number;
      impact?: number;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.culture.updateCampaignMetrics(id, body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('leadership')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  leadership(
    @Body()
    body: {
      title: string;
      coach: string;
      feedback: string;
      priority?: boolean;
      category?: CulturePillar;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const item = this.culture.createLeadershipAction(body, userId);
    return buildSuccess(item, {
      userId,
      forgeStatus: item.priority ? 'failed' : 'forged',
    });
  }

  @Post('suggestions')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  suggestion(
    @Body()
    body: {
      title: string;
      detail: string;
      anonymous?: boolean;
      category?: CulturePillar;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body);
    return buildSuccess(this.culture.submitSuggestion(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('suggestions/:id/advance')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  advanceSuggestion(
    @Param('id') id: string,
    @Body() body: { percent: number; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.culture.advanceSuggestion(id, body.percent, userId),
      { userId, forgeStatus: 'forged' },
    );
  }

  @Post('improvements')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  improvement(
    @Body()
    body: {
      title: string;
      detail: string;
      priority?: ImprovementPriority;
      category?: CulturePillar;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const item = this.culture.createImprovement(body, userId);
    return buildSuccess(item, {
      userId,
      forgeStatus: item.priority === 'priority' ? 'failed' : 'forged',
    });
  }

  @Post('improvements/:id/bump')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  bumpImprovement(
    @Param('id') id: string,
    @Body() body: { delta?: number; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(
      this.culture.bumpImprovement(id, body.delta ?? 10, userId),
      { userId, forgeStatus: 'forged' },
    );
  }
}
