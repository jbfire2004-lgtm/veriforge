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
  IndustrialSoundDesignService,
  type SoundCategory,
} from '../services/industrial-sound-design.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/sounds')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeSoundController {
  constructor(private readonly sounds: IndustrialSoundDesignService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.sounds.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.sounds.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus: data.criticalPlays > 0 ? 'failed' : 'verified',
    });
  }

  @Get('category/:category')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  byCategory(
    @Param('category') category: SoundCategory,
    @Req() req: VeriForgeRequest,
  ) {
    return buildSuccess(this.sounds.listByCategory(category), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('play/:id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  play(
    @Param('id') id: string,
    @Body() body: { userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.sounds.play(id, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus: result.sound.signal === 'critical' ? 'failed' : 'forged',
    });
  }
}
