import { Module } from '@nestjs/common';
import { AcpAccessController } from './acp-access.controller';
import { AcpController } from './acp.controller';
import { AcpService } from './acp.service';
import { AcpAccessService } from './acp-access.service';
import { AcpAccessGuard } from './acp-access.guard';
import { VeraAccessGuard } from './vera-access.guard';
import { VeraFeatureGuard } from './guards/vera-feature.guard';
import { VeraModuleGuard } from './guards/vera-module.guard';
import { VeraPermissionGuard } from './guards/vera-permission.guard';
import { VeraTierGuard } from './guards/vera-tier.guard';
import { VeraRoleGuard } from './guards/vera-role.guard';
import { AcpSeedService } from './acp-seed.service';

@Module({
  controllers: [AcpController, AcpAccessController],
  providers: [
    AcpService,
    AcpAccessService,
    AcpAccessGuard,
    VeraAccessGuard,
    VeraPermissionGuard,
    VeraFeatureGuard,
    VeraTierGuard,
    VeraModuleGuard,
    VeraRoleGuard,
    AcpSeedService,
  ],
  exports: [
    AcpAccessService,
    AcpService,
    VeraAccessGuard,
    AcpAccessGuard,
    VeraPermissionGuard,
    VeraFeatureGuard,
    VeraTierGuard,
    VeraModuleGuard,
    VeraRoleGuard,
  ],
})
export class AcpModule {}
