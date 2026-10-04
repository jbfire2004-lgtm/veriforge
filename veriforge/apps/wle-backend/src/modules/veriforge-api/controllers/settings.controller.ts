import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { buildSuccess } from '../veriforge-response';
import { VeriForgeExceptionFilter } from '../veriforge-exception.filter';
import { resolveUserId } from '../veriforge-request.util';
import { SettingsService } from '../services/settings.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/settings')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('profile')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  profile(@Req() req: Request & { user?: { id?: number } }) {
    const userId = resolveUserId(req);
    return buildSuccess(this.settingsService.profile(userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Put('profile/update')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  updateProfile(
    @Body() body: { displayName?: string; email?: string; userId?: number },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body);
    return buildSuccess(
      this.settingsService.updateProfile({ ...body, userId }),
      {
        userId,
        forgeStatus: 'forged',
      },
    );
  }

  @Get('preferences')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  preferences(@Req() req: Request & { user?: { id?: number } }) {
    const userId = resolveUserId(req);
    return buildSuccess(this.settingsService.preferences(userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Put('preferences/update')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  updatePreferences(
    @Body()
    body: {
      highContrast?: boolean;
      verificationPulseAlerts?: boolean;
      userId?: number;
    },
    @Req() req: Request & { user?: { id?: number } },
  ) {
    const userId = resolveUserId(req, body);
    return buildSuccess(
      this.settingsService.updatePreferences({ ...body, userId }),
      {
        userId,
        forgeStatus: 'forged',
      },
    );
  }
}
