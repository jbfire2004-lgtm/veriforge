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
  SafetyAiPredictiveService,
  type PredictionType,
} from '../services/safety-ai-predictive.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/predictive')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgePredictiveController {
  constructor(private readonly engine: SafetyAiPredictiveService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.engine.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.engine.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus: data.criticalCount > 0 ? 'failed' : 'verified',
    });
  }

  @Get('models')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  models(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.engine.listModels(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('zones')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  zones(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.engine.listZones(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('type/:type')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  byType(
    @Param('type') type: PredictionType,
    @Req() req: VeriForgeRequest,
  ) {
    return buildSuccess(this.engine.listByType(type), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get(':id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_VIEW)
  get(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    return buildSuccess(this.engine.get(id), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('run')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  run(
    @Body()
    body: {
      type: PredictionType;
      title?: string;
      modelId?: string;
      horizonDays?: number;
      seedScore?: number;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.engine.run(body, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus:
        result.prediction.classification === 'critical' ? 'failed' : 'forged',
    });
  }

  @Post('refresh/:id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.COMPLIANCE_UPDATE)
  refresh(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.engine.refresh(id, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus:
        result.prediction.classification === 'critical' ? 'failed' : 'forged',
    });
  }
}
