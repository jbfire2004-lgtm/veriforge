import {
  Body,
  Controller,
  ForbiddenException,
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
  requireTenantId,
  resolveUserId,
  type VeriForgeRequest,
} from '../veriforge-request.util';
import {
  SafetyBlockchainLedgerService,
  type BlockType,
} from '../services/safety-blockchain-ledger.service';
import { VeriForgePermissions } from '../rbac/permissions.decorator';
import { VERIFORGE_PERMISSIONS } from '../rbac/permissions';
import { VeriForgeRbacGuard } from '../rbac/veriforge-rbac.guard';

@Controller('veriforge/ledger')
@UseFilters(VeriForgeExceptionFilter)
@UseGuards(VeriForgeRbacGuard)
export class VeriForgeLedgerController {
  constructor(private readonly ledger: SafetyBlockchainLedgerService) {}

  @Get()
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_VIEW)
  overview(@Req() req: VeriForgeRequest) {
    const tenantId = requireTenantId(req);
    return buildSuccess(this.ledger.overview(tenantId), {
      userId: resolveUserId(req),
      tenantId,
      forgeStatus: 'verified',
    });
  }

  @Get('analytics')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_VIEW)
  analytics(@Req() req: VeriForgeRequest) {
    const tenantId = requireTenantId(req);
    const userId = resolveUserId(req);
    const data = this.ledger.analytics(userId, tenantId);
    return buildSuccess(data, {
      userId,
      tenantId,
      forgeStatus:
        !data.chainIntegrity || data.criticalBlocks > 0 ? 'failed' : 'verified',
    });
  }

  @Get('type/:type')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_VIEW)
  byType(@Param('type') type: BlockType, @Req() req: VeriForgeRequest) {
    const tenantId = requireTenantId(req);
    return buildSuccess(this.ledger.listByType(type, tenantId), {
      userId: resolveUserId(req),
      tenantId,
      forgeStatus: 'verified',
    });
  }

  @Get(':id')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_VIEW)
  get(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    const tenantId = requireTenantId(req);
    const block = this.ledger.get(id);
    if (block.tenantId !== tenantId) {
      throw new ForbiddenException({
        code: 'TENANT_ISOLATION_VIOLATION',
        message: 'Ledger block is not in the JWT tenant',
      });
    }
    return buildSuccess(block, {
      userId: resolveUserId(req),
      tenantId,
      forgeStatus: 'verified',
    });
  }

  @Get(':id/verify')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_VIEW)
  verify(@Param('id') id: string, @Req() req: VeriForgeRequest) {
    const tenantId = requireTenantId(req);
    const block = this.ledger.get(id);
    if (block.tenantId !== tenantId) {
      throw new ForbiddenException({
        code: 'TENANT_ISOLATION_VIOLATION',
        message: 'Ledger block is not in the JWT tenant',
      });
    }
    const result = this.ledger.verify(id);
    return buildSuccess(result, {
      userId: resolveUserId(req),
      tenantId,
      forgeStatus: result.verified ? 'verified' : 'failed',
    });
  }

  @Post('commit')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_WRITE)
  commit(
    @Body()
    body: {
      type: BlockType;
      title: string;
      summary: string;
      payload?: Record<string, string | number | boolean>;
      critical?: boolean;
      tenantId?: string;
      userId?: number;
    },
    @Req() req: VeriForgeRequest,
  ) {
    const tenantId = requireTenantId(req);
    const userId = resolveUserId(req) ?? 0;
    const result = this.ledger.commit({ ...body, tenantId }, userId);
    return buildSuccess(result, {
      userId,
      tenantId,
      forgeStatus: result.block.critical ? 'failed' : 'forged',
    });
  }

  @Post('contracts/:id/fire')
  @VeriForgePermissions(VERIFORGE_PERMISSIONS.AUDIT_WRITE)
  fireContract(
    @Param('id') id: string,
    @Body() _body: { tenantId?: string; userId?: number },
    @Req() req: VeriForgeRequest,
  ) {
    const tenantId = requireTenantId(req);
    const userId = resolveUserId(req) ?? 0;
    const result = this.ledger.fireContract(id, userId, tenantId);
    const forged =
      'block' in result && result.block?.critical ? 'failed' : 'forged';
    return buildSuccess(result, {
      userId,
      tenantId,
      forgeStatus: forged,
    });
  }
}
