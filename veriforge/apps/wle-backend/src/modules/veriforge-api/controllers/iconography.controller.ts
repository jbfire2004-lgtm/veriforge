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
  IndustrialIconographyService,
  type IconCategory,
  type IconTone,
} from '../services/industrial-iconography.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/iconography')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeIconographyController {
  constructor(private readonly icons: IndustrialIconographyService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.icons.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.icons.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus: data.iconCoverageScore < 70 ? 'failed' : 'verified',
    });
  }

  @Get('category/:category')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  byCategory(
    @Param('category') category: IconCategory,
    @Req() req: VeriForgeRequest,
  ) {
    return buildSuccess(this.icons.listByCategory(category), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get(':id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  get(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    return buildSuccess(this.icons.get(id), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Post('view/:id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  view(
    @Param('id') id: string,
    @Body() body: { userId?: number; tone?: IconTone },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const result = this.icons.view(id, userId, body.tone ?? 'neutral');
    return buildSuccess(result, {
      userId,
      forgeStatus: body.tone === 'critical' ? 'failed' : 'forged',
    });
  }
}
