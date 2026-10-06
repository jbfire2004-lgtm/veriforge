import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { API_V1_PREFIX } from '../config/routes';
import { AcpAccessGuard } from './acp-access.guard';
import { AcpAccessService } from './acp-access.service';
import { AcpService } from './acp.service';
import { RequireAcpPermission } from './decorators/acp-permission.decorator';

const ACP_ADMIN_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

@UseGuards(JwtAuthGuard, RolesGuard, AcpAccessGuard)
@Roles(...ACP_ADMIN_ROLES)
@Controller(`${API_V1_PREFIX}/acp`)
export class AcpController {
  constructor(
    private readonly acp: AcpService,
    private readonly access: AcpAccessService,
  ) {}

  @Get('tenants')
  @RequireAcpPermission('acp.tenants.read')
  listTenants() {
    return this.acp.listTenants();
  }

  @Get('tenants/:id')
  @RequireAcpPermission('acp.tenants.read')
  getTenant(@Param('id') id: string) {
    return this.acp.getTenant(id);
  }

  @Post('tenants')
  @RequireAcpPermission('acp.tenants.write')
  createTenant(
    @Body()
    body: { slug: string; name: string; companyId?: number; status?: string },
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.createTenant(
      body as Parameters<AcpService['createTenant']>[0],
      req.user.id,
    );
  }

  @Put('tenants/:id')
  @RequireAcpPermission('acp.tenants.write')
  updateTenant(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.updateTenant(id, body as never, req.user.id);
  }

  @Delete('tenants/:id')
  @RequireAcpPermission('acp.tenants.write')
  deleteTenant(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.acp.deleteTenant(id, req.user.id);
  }

  @Get('users')
  @RequireAcpPermission('acp.users.read')
  listUsers(@Query('tenantId') tenantId?: string) {
    return this.acp.listUsers(tenantId);
  }

  @Post('users')
  @RequireAcpPermission('acp.users.write')
  createUser(
    @Body()
    body: {
      email: string;
      username: string;
      password: string;
      role?: string;
      acpTenantId?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.createUser(body, req.user.id);
  }

  @Get('users/:userId')
  @RequireAcpPermission('acp.users.read')
  getUser(@Param('userId') userId: string) {
    return this.acp.getUser(parseInt(userId, 10));
  }

  @Delete('users/:userId')
  @RequireAcpPermission('acp.users.write')
  deleteUser(
    @Param('userId') userId: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.deleteUser(parseInt(userId, 10), req.user.id);
  }

  @Put('users/:userId')
  @RequireAcpPermission('acp.users.write')
  updateUser(
    @Param('userId') userId: string,
    @Body()
    body: { role?: string; acpTenantId?: string | null; active?: boolean },
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.updateUser(parseInt(userId, 10), body, req.user.id);
  }

  @Put('users/:userId/tenant')
  @RequireAcpPermission('acp.users.write')
  assignUserTenant(
    @Param('userId') userId: string,
    @Body() body: { tenantId: string | null },
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.assignUserTenant(
      parseInt(userId, 10),
      body.tenantId,
      req.user.id,
    );
  }

  @Put('users/:userId/active')
  @RequireAcpPermission('acp.users.write')
  setUserActive(
    @Param('userId') userId: string,
    @Body() body: { active: boolean },
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.setUserActive(
      parseInt(userId, 10),
      body.active,
      req.user.id,
    );
  }

  @Get('roles')
  @RequireAcpPermission('acp.users.read')
  listRoles(@Query('tenantId') tenantId?: string) {
    return this.acp.listRoles(tenantId);
  }

  @Post('roles')
  @RequireAcpPermission('acp.users.write')
  createRole(
    @Body()
    body: {
      key: string;
      name: string;
      description?: string;
      tenantId?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.createRole(body, req.user.id);
  }

  @Put('roles/:id')
  @RequireAcpPermission('acp.users.write')
  updateRole(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.updateRole(id, body, req.user.id);
  }

  @Delete('roles/:id')
  @RequireAcpPermission('acp.users.write')
  deleteRole(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.acp.deleteRole(id, req.user.id);
  }

  @Post('users/:userId/roles')
  @RequireAcpPermission('acp.users.write')
  assignRole(
    @Param('userId') userId: string,
    @Body() body: { roleId: string; tenantId?: string },
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.assignUserRole(
      parseInt(userId, 10),
      body.roleId,
      body.tenantId,
      req.user.id,
    );
  }

  @Delete('users/:userId/roles/:roleId')
  @RequireAcpPermission('acp.users.write')
  removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Query('tenantId') tenantId: string | undefined,
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.removeUserRole(
      parseInt(userId, 10),
      roleId,
      tenantId,
      req.user.id,
    );
  }

  @Get('permissions')
  @RequireAcpPermission('acp.manage')
  listPermissions() {
    return this.acp.listPermissions();
  }

  @Get('permissions/matrix')
  @RequireAcpPermission('acp.manage')
  permissionMatrix() {
    return this.acp.getPermissionMatrix();
  }

  @Put('roles/:roleId/permissions')
  @RequireAcpPermission('acp.manage')
  setRolePermissions(
    @Param('roleId') roleId: string,
    @Body() body: { permissionIds: string[] },
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.setRolePermissions(roleId, body.permissionIds, req.user.id);
  }

  @Get('subscriptions/tiers')
  @RequireAcpPermission('acp.tenants.read')
  listTiers() {
    return this.acp.listTiers();
  }

  @Put('tenants/:tenantId/subscription')
  @RequireAcpPermission('acp.tenants.write')
  assignSubscription(
    @Param('tenantId') tenantId: string,
    @Body() body: { tierId: string; status?: string },
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.assignTenantSubscription(
      tenantId,
      body.tierId,
      body.status as never,
      req.user.id,
    );
  }

  @Put('tenants/:tenantId/addons')
  @RequireAcpPermission('acp.tenants.write')
  assignAddons(
    @Param('tenantId') tenantId: string,
    @Body() body: { featureKeys: string[]; enabled?: boolean },
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.setTenantFeatureKeys(
      tenantId,
      body.featureKeys,
      body.enabled ?? true,
      req.user.id,
    );
  }

  @Put('tenants/:tenantId/modules')
  @RequireAcpPermission('acp.tenants.write')
  setTenantModules(
    @Param('tenantId') tenantId: string,
    @Body() body: { featureKeys: string[] },
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.setTenantModules(tenantId, body.featureKeys, req.user.id);
  }

  @Get('features')
  @RequireAcpPermission('acp.manage')
  listFeatures() {
    return this.acp.listFeatureFlags();
  }

  @Put('tenants/:tenantId/features/:featureFlagId')
  @RequireAcpPermission('acp.tenants.write')
  toggleTenantFeature(
    @Param('tenantId') tenantId: string,
    @Param('featureFlagId') featureFlagId: string,
    @Body() body: { enabled: boolean },
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.setTenantFeatureFlag(
      tenantId,
      featureFlagId,
      body.enabled,
      req.user.id,
    );
  }

  @Put('features/:id/default')
  @RequireAcpPermission('acp.manage')
  updateFeatureDefault(
    @Param('id') id: string,
    @Body() body: { defaultEnabled: boolean },
    @Req() req: { user: { id: number } },
  ) {
    return this.acp.updateFeatureFlagDefault(
      id,
      body.defaultEnabled,
      req.user.id,
    );
  }

  @Get('audit-logs')
  @RequireAcpPermission('acp.manage')
  auditLogs(
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.acp.listAuditLogs({
      tenantId,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
