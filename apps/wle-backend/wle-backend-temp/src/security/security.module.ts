import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionService } from './permission.service';
import { TenantScopeService } from './tenant-scope.service';
import { PermissionGuard } from './guards/permission.guard';
import { TenantIsolationGuard } from './guards/tenant-isolation.guard';
import { OriginGuard } from './guards/origin.guard';

/** Global security services and guards (APP_GUARD registration lives in AppModule). */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    PermissionService,
    TenantScopeService,
    PermissionGuard,
    TenantIsolationGuard,
    OriginGuard,
  ],
  exports: [
    PermissionService,
    TenantScopeService,
    PermissionGuard,
    TenantIsolationGuard,
    OriginGuard,
  ],
})
export class SecurityModule {}
