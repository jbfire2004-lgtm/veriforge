import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { VendorIntegrationService } from './services/vendor-integration.service';
import { VendorSyncService } from './services/vendor-sync.service';

@Module({
  imports: [PrismaModule],
  providers: [VendorIntegrationService, VendorSyncService],
  exports: [VendorIntegrationService, VendorSyncService],
})
export class VendorIntegrationModule {}
