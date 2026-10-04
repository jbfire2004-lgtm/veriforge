import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { Roles } from '../auth/roles.decorator';
import { SUPERVISOR_ROLES } from '../modules/vera-core/roles';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { toSecurityActor } from '../security/actor.util';
import { Permission } from '../security/security.types';
import { PermissionGuard } from '../security/guards/permission.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('audit')
@UseGuards(RolesGuard, PermissionGuard)
@Roles(...SUPERVISOR_ROLES)
@RequirePermission(Permission.ADMIN_ACCESS)
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  all(
    @Req() req: { user: Parameters<typeof toSecurityActor>[0] },
    @Query('companyId') companyId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.audit.findAll(
      toSecurityActor(req.user),
      parsePositiveInt(companyId),
      parsePositiveInt(limit) ?? 200,
    );
  }

  @Get('user/:id')
  forUser(
    @Req() req: { user: Parameters<typeof toSecurityActor>[0] },
    @Param('id', ParseIntPipe) id: number,
    @Query('companyId') companyId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.audit.findForUser(
      toSecurityActor(req.user),
      id,
      parsePositiveInt(companyId),
      parsePositiveInt(limit) ?? 200,
    );
  }

  @Get('entity/:entity/:id')
  forEntity(
    @Req() req: { user: Parameters<typeof toSecurityActor>[0] },
    @Param('entity') entity: string,
    @Param('id') id: string,
    @Query('companyId') companyId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.audit.findForEntity(
      toSecurityActor(req.user),
      entity,
      id,
      parsePositiveInt(companyId),
      parsePositiveInt(limit) ?? 200,
    );
  }
}

function parsePositiveInt(raw?: string): number | undefined {
  if (!raw) return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return Math.trunc(value);
}
