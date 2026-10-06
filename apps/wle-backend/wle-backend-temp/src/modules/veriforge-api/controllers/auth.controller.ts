import { Body, Controller, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import { Public } from '../../../auth/public.decorator';
import { buildSuccess } from '../veriforge-response';
import { VeriForgeExceptionFilter } from '../veriforge-exception.filter';
import {
  requireTenantId,
  resolveUserId,
  type VeriForgeRequest,
} from '../veriforge-request.util';
import { AuthService } from '../services/auth.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/auth')
@UseFilters(VeriForgeExceptionFilter)
export class VeriForgeAuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body()
    body: {
      email: string;
      password: string;
      tenantId?: string;
      tenantSlug?: string;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const data = await this.authService.login(body.email, body.password, {
      tenantId: body.tenantId,
      tenantSlug: body.tenantSlug,
    });
    const tenantId = data.tenant?.tenantId ?? data.user?.tenantId ?? null;
    return buildSuccess(data, {
      userId: data.user?.id ?? resolveUserId(req),
      tenantId,
      forgeStatus: 'verified',
    });
  }

  @UseGuards(VeriForgeRbacGuard)
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.USER_WRITE)
  @Post('register')
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      tenantId?: string;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const tenantId = requireTenantId(req);
    const data = await this.authService.register({
      name: body.name,
      email: body.email,
      password: body.password,
      tenantId,
    });
    return buildSuccess(data, {
      userId: resolveUserId(req),
      tenantId,
      forgeStatus: 'pending',
    });
  }

  @Public()
  @Post('forgot')
  async forgot(
    @Body()
    body: {
      email: string;
      tenantId?: string;
      tenantSlug?: string;
    },
  ) {
    const data = await this.authService.forgot(body.email, {
      tenantId: body.tenantId,
      tenantSlug: body.tenantSlug,
    });
    return buildSuccess(data, {
      userId: null,
      tenantId: 'tenantId' in data ? data.tenantId ?? null : null,
      forgeStatus: 'pending',
    });
  }

  @Public()
  @Post('reset')
  async reset(@Body() body: { token: string; password: string }) {
    const data = await this.authService.reset(body);
    return buildSuccess(data, {
      userId: null,
      tenantId: data.tenantId,
      forgeStatus: 'verified',
    });
  }
}
