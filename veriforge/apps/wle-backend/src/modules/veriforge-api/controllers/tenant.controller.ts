import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../../../auth/public.decorator';
import { buildSuccess } from '../veriforge-response';
import { VeriForgeExceptionFilter } from '../veriforge-exception.filter';
import {
  resolveUserId,
  requireTenantId,
  type VeriForgeRequest,
} from '../veriforge-request.util';
import { TenantRegistryService } from '../tenancy/tenant-registry.service';
import { TenantAuthService } from '../tenancy/tenant-auth.service';
import { TenantStorageService } from '../tenancy/tenant-storage.service';
import { TenantScalingService } from '../tenancy/tenant-scaling.service';
import { TenantAwareDomainService } from '../tenancy/tenant-aware-domain.service';
import { TenantIsolationService } from '../tenancy/tenant-isolation.service';
import { VeriForgeTenantGuard } from '../tenancy/veriforge-tenant.guard';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS, normalizeVeriForgeRoleName } from '../rbac/permissions';

@Controller('veriforge/tenants')
@UseFilters(VeriForgeExceptionFilter)
export class VeriForgeTenantController {
  constructor(
    private readonly registry: TenantRegistryService,
    private readonly tenantAuth: TenantAuthService,
    private readonly storage: TenantStorageService,
    private readonly scaling: TenantScalingService,
    private readonly domain: TenantAwareDomainService,
    private readonly isolation: TenantIsolationService,
  ) {}

  @UseGuards(VeriForgeTenantGuard, VeriForgeRbacGuard)
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.USER_READ)
  @Get()
  list(@Req() req: VeriForgeRequest) {
    const jwtTenant = requireTenantId(req);
    const role = normalizeVeriForgeRoleName(req.user?.role);
    const tenants =
      role === 'SuperAdmin'
        ? this.registry.listTenants()
        : this.registry.listTenants().filter((item) => item.tenantId === jwtTenant);
    return buildSuccess(
      tenants.map((tenant) => ({
        tenantId: tenant.tenantId,
        slug: tenant.slug,
        name: tenant.name,
        status: tenant.status,
        dbMode: tenant.dbMode,
        branding: tenant.branding,
      })),
      {
        userId: resolveUserId(req),
        tenantId: jwtTenant,
        forgeStatus: 'verified',
      },
    );
  }

  @UseGuards(VeriForgeTenantGuard, VeriForgeRbacGuard)
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  @Get('scaling/topology')
  topology(@Req() req: VeriForgeRequest) {
    const tenantId = requireTenantId(req);
    return buildSuccess(this.scaling.topology(), {
      userId: resolveUserId(req),
      tenantId,
      forgeStatus: 'verified',
    });
  }

  @UseGuards(VeriForgeTenantGuard, VeriForgeRbacGuard)
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  @Post('scaling/evaluate')
  evaluateScale(@Req() req: VeriForgeRequest) {
    const tenantId = requireTenantId(req);
    return buildSuccess(this.scaling.evaluateAutoScale(), {
      userId: resolveUserId(req),
      tenantId,
      forgeStatus: 'forged',
    });
  }

  @Public()
  @Post('auth/login')
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
    const data = await this.tenantAuth.login(body);
    return buildSuccess(data, {
      userId: data.user.id,
      tenantId: data.tenant.tenantId,
      forgeStatus: 'verified',
    });
  }

  @UseGuards(VeriForgeTenantGuard, VeriForgeRbacGuard)
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.USER_WRITE)
  @Post('auth/register')
  async register(
    @Body()
    body: {
      tenantId?: string;
      name: string;
      email: string;
      password: string;
      role?: string;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const tenantId = requireTenantId(req);
    const data = await this.tenantAuth.register({
      ...body,
      tenantId,
    });
    return buildSuccess(data, {
      userId: data.user.id,
      tenantId,
      forgeStatus: 'pending',
    });
  }

  @Public()
  @Post('auth/forgot')
  async forgot(
    @Body()
    body: {
      email: string;
      tenantId?: string;
      tenantSlug?: string;
    },
  ) {
    const data = await this.tenantAuth.requestPasswordReset(body);
    return buildSuccess(data, {
      userId: null,
      tenantId: 'tenantId' in data ? data.tenantId ?? null : null,
      forgeStatus: 'pending',
    });
  }

  @Public()
  @Post('auth/reset')
  async reset(@Body() body: { token: string; password: string }) {
    const data = await this.tenantAuth.resetPassword(body);
    return buildSuccess(data, {
      userId: null,
      tenantId: data.tenantId,
      forgeStatus: 'verified',
    });
  }

  @Get(':tenantId')
  @UseGuards(VeriForgeTenantGuard)
  getTenant(
    @Param('tenantId') tenantId: string,
    @Req() req: VeriForgeRequest,
  ) {
    const tenant = this.registry.getTenant(tenantId);
    return buildSuccess(tenant, {
      userId: resolveUserId(req),
      tenantId,
      forgeStatus: 'verified',
    });
  }

  @Get(':tenantId/dashboard')
  @UseGuards(VeriForgeTenantGuard)
  dashboard(
    @Param('tenantId') tenantId: string,
    @Req() req: VeriForgeRequest,
  ) {
    return buildSuccess(this.domain.dashboard(tenantId), {
      userId: resolveUserId(req),
      tenantId,
      forgeStatus: 'verified',
    });
  }

  @Get(':tenantId/training')
  @UseGuards(VeriForgeTenantGuard)
  training(
    @Param('tenantId') tenantId: string,
    @Req() req: VeriForgeRequest,
  ) {
    return buildSuccess(
      {
        tenantId,
        dbFilter: this.isolation.sharedWhere(tenantId),
        modules: this.domain.listTraining(tenantId),
      },
      {
        userId: resolveUserId(req),
        tenantId,
        forgeStatus: 'verified',
      },
    );
  }

  @Post(':tenantId/training')
  @UseGuards(VeriForgeTenantGuard)
  createTraining(
    @Param('tenantId') tenantId: string,
    @Body() body: { title: string },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body);
    return buildSuccess(
      this.domain.createTraining(tenantId, { title: body.title, userId }),
      { userId, tenantId, forgeStatus: 'forged' },
    );
  }

  @Get(':tenantId/verification')
  @UseGuards(VeriForgeTenantGuard)
  verification(
    @Param('tenantId') tenantId: string,
    @Req() req: VeriForgeRequest,
  ) {
    return buildSuccess(
      {
        tenantId,
        checks: this.domain.listVerification(tenantId),
      },
      {
        userId: resolveUserId(req),
        tenantId,
        forgeStatus: 'verified',
      },
    );
  }

  @Post(':tenantId/verification/forge-check')
  @UseGuards(VeriForgeTenantGuard)
  forgeCheck(
    @Param('tenantId') tenantId: string,
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req);
    return buildSuccess(this.domain.runForgeCheck(tenantId, userId), {
      userId,
      tenantId,
      forgeStatus: 'verified',
    });
  }

  @Get(':tenantId/compliance')
  @UseGuards(VeriForgeTenantGuard)
  compliance(
    @Param('tenantId') tenantId: string,
    @Req() req: VeriForgeRequest,
  ) {
    return buildSuccess(
      {
        tenantId,
        items: this.domain.listCompliance(tenantId),
      },
      {
        userId: resolveUserId(req),
        tenantId,
        forgeStatus: 'verified',
      },
    );
  }

  @Post(':tenantId/compliance')
  @UseGuards(VeriForgeTenantGuard)
  upsertCompliance(
    @Param('tenantId') tenantId: string,
    @Body() body: { title: string; status?: string },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body);
    return buildSuccess(
      this.domain.upsertCompliance(tenantId, {
        title: body.title,
        status: body.status,
        userId,
      }),
      { userId, tenantId, forgeStatus: 'forged' },
    );
  }

  @Get(':tenantId/users')
  @UseGuards(VeriForgeTenantGuard)
  users(@Param('tenantId') tenantId: string, @Req() req: VeriForgeRequest) {
    return buildSuccess(this.registry.listUsers(tenantId), {
      userId: resolveUserId(req),
      tenantId,
      forgeStatus: 'verified',
    });
  }

  @Get(':tenantId/audit')
  @UseGuards(VeriForgeTenantGuard)
  audit(@Param('tenantId') tenantId: string, @Req() req: VeriForgeRequest) {
    return buildSuccess(this.registry.listAudit(tenantId), {
      userId: resolveUserId(req),
      tenantId,
      forgeStatus: 'verified',
    });
  }

  @Get(':tenantId/storage')
  @UseGuards(VeriForgeTenantGuard)
  listStorage(
    @Param('tenantId') tenantId: string,
    @Query('category') category: 'compliance' | 'training' | 'verification' | 'general' | undefined,
    @Req() req: VeriForgeRequest,
  ) {
    return buildSuccess(
      {
        tenantId,
        objects: this.storage.list(tenantId, category),
        buckets: this.storage.describeBuckets().filter((b) => b.tenantId === tenantId),
      },
      {
        userId: resolveUserId(req),
        tenantId,
        forgeStatus: 'verified',
      },
    );
  }

  @Post(':tenantId/storage/upload')
  @UseGuards(VeriForgeTenantGuard)
  upload(
    @Param('tenantId') tenantId: string,
    @Body()
    body: {
      fileName: string;
      category?: 'compliance' | 'training' | 'verification' | 'general';
      sizeBytes?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body);
    return buildSuccess(
      this.storage.upload({
        tenantId,
        fileName: body.fileName,
        category: body.category ?? 'general',
        sizeBytes: body.sizeBytes,
        uploadedBy: userId,
      }),
      { userId, tenantId, forgeStatus: 'forged' },
    );
  }

  @Get(':tenantId/branding')
  @UseGuards(VeriForgeTenantGuard)
  branding(
    @Param('tenantId') tenantId: string,
    @Req() req: VeriForgeRequest,
  ) {
    const tenant = this.registry.getTenant(tenantId);
    return buildSuccess(
      {
        tenantId,
        branding: tenant.branding,
        defaults: {
          primaryColor: '#C62828',
          accentColor: '#424242',
          background: '#1A1A1A',
        },
      },
      {
        userId: resolveUserId(req),
        tenantId,
        forgeStatus: 'verified',
      },
    );
  }

  @Put(':tenantId/branding')
  @UseGuards(VeriForgeTenantGuard)
  updateBranding(
    @Param('tenantId') tenantId: string,
    @Body()
    body: {
      logoUrl?: string | null;
      primaryColor?: string | null;
      accentColor?: string | null;
      useDefaultForgeIdentity?: boolean;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const tenant = this.registry.updateBranding(tenantId, body);
    this.registry.appendAudit({
      tenantId,
      userId: resolveUserId(req, body),
      action: 'branding.update',
      resource: tenantId,
      details: body as Record<string, unknown>,
    });
    return buildSuccess(tenant.branding, {
      userId: resolveUserId(req, body),
      tenantId,
      forgeStatus: 'forged',
    });
  }

  @Get(':tenantId/routing')
  @UseGuards(VeriForgeTenantGuard)
  routing(
    @Param('tenantId') tenantId: string,
    @Req() req: VeriForgeRequest,
  ) {
    return buildSuccess(this.scaling.routeTenant(tenantId), {
      userId: resolveUserId(req),
      tenantId,
      forgeStatus: 'verified',
    });
  }

  @Get(':tenantId/security')
  @UseGuards(VeriForgeTenantGuard)
  security(
    @Param('tenantId') tenantId: string,
    @Req() req: VeriForgeRequest,
  ) {
    const tenant = this.registry.getTenant(tenantId);
    const db = this.isolation.dedicatedConnection(tenantId);
    return buildSuccess(
      {
        tenantId,
        rowLevelSecurity: {
          enabled: true,
          predicate: `tenant_id = '${tenantId}'`,
        },
        encryption: {
          keyId: tenant.encryptionKeyId,
          scope: 'tenant-level',
        },
        database: db,
        auditRequired: true,
      },
      {
        userId: resolveUserId(req),
        tenantId,
        forgeStatus: 'verified',
      },
    );
  }
}
