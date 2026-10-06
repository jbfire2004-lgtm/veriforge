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
  IndustrialAnimationLibraryService,
  type AnimationComponent,
} from '../services/industrial-animation-library.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/animations')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeAnimationController {
  constructor(private readonly library: IndustrialAnimationLibraryService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.library.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.library.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus: data.criticalPlays > 0 ? 'failed' : 'verified',
    });
  }

  @Get('category/:category')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  byCategory(
    @Param('category') category: 'primitive' | AnimationComponent,
    @Req() req: VeriForgeRequest,
  ) {
    return buildSuccess(this.library.listByCategory(category), {
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
    const result = this.library.play(id, userId);
    return buildSuccess(result, {
      userId,
      forgeStatus: result.spec.signal === 'critical' ? 'failed' : 'forged',
    });
  }
}
