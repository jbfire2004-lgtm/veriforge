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
  BrandExpansionService,
  type AssetKind,
  type GovernanceSeverity,
  type SubBrandId,
} from '../services/brand-expansion.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/brand-expansion')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeBrandExpansionController {
  constructor(private readonly brand: BrandExpansionService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    return buildSuccess(this.brand.overview(), {
      userId: resolveUserId(req),
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.TRAINING_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req);
    const data = this.brand.analytics(userId);
    return buildSuccess(data, {
      userId,
      forgeStatus: data.brandConsistencyScore < 70 ? 'failed' : 'verified',
    });
  }

  @Post('sub-brands/:id/active')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  setActive(
    @Param('id') id: SubBrandId,
    @Body() body: { active: boolean; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    const row = this.brand.setSubBrandActive(id, body.active, userId);
    return buildSuccess(row, {
      userId,
      forgeStatus: row.active ? 'verified' : 'failed',
    });
  }

  @Post('products')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  createProduct(
    @Body()
    body: {
      subBrandId: SubBrandId;
      name: string;
      code?: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.brand.createProduct(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('campaigns')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  createCampaign(
    @Body()
    body: {
      title: string;
      subBrandId?: SubBrandId | 'core';
      heroLine?: string;
      cta?: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.brand.createCampaign(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }

  @Post('campaigns/:id/activate')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  activateCampaign(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    const userId = resolveUserId(req) ?? 0;
    return buildSuccess(this.brand.activateCampaign(id, userId), {
      userId,
      forgeStatus: 'verified',
    });
  }

  @Post('governance')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  addRule(
    @Body()
    body: {
      domain: 'logo' | 'color' | 'typography' | 'motion';
      rule: string;
      severity: GovernanceSeverity;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.brand.addRule(body, userId), {
      userId,
      forgeStatus: body.severity === 'forbidden' ? 'failed' : 'forged',
    });
  }

  @Post('assets')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.SETTINGS_UPDATE)
  addAsset(
    @Body()
    body: {
      kind: AssetKind;
      name: string;
      subBrandId?: SubBrandId | 'core';
      description: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const userId = resolveUserId(req, body) ?? 0;
    return buildSuccess(this.brand.addAsset(body, userId), {
      userId,
      forgeStatus: 'forged',
    });
  }
}
