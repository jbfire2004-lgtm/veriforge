import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { API_V1_PREFIX } from '../config/routes';
import { AcpAccessService } from './acp-access.service';

type AuthReq = { user: { id: number; role?: string } };

/** Access engine — any authenticated Vera user. */
@UseGuards(JwtAuthGuard)
@Controller(`${API_V1_PREFIX}/access`)
export class AcpAccessController {
  constructor(private readonly access: AcpAccessService) {}

  @Get('me')
  getMyAccess(@Req() req: AuthReq) {
    return this.access.resolveContext(req.user.id);
  }

  @Post('check')
  checkAccess(
    @Req() req: AuthReq,
    @Body()
    body: {
      permission?: string;
      feature?: string;
      module?: string;
      minTier?: string;
    },
  ) {
    return this.access.check({ userId: req.user.id, ...body });
  }

  @Get('hub-modules')
  hubModules(@Req() req: AuthReq) {
    return this.access.hubModulesForUser(req.user.id);
  }

  @Get('modules')
  moduleCards(@Req() req: AuthReq) {
    return this.access.getModuleCardsForUser(req.user.id);
  }
}
