import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkersModule } from '../workers/workers.module';
import { DomainEventBusModule } from '../modules/api-platform/events/domain-event-bus.module';
import { PmPermitsController } from './pm-permits.controller';
import { PmPermitsService } from './pm-permits.service';
import { FieldOsPermitClient } from './fieldos-permit-client.service';
import { VeripmFieldosPermitsService } from './veripm-fieldos-permits.service';
import { VeripmFieldosPermitsController } from './veripm-fieldos-permits.controller';
import {
  VeripmPermitActivityService,
  VeripmPermitEventPipeline,
} from './veripm-permit-activity.service';

/**
 * Logical microservices co-located in Nest:
 * - VERIPM Permits (PmPermitsService)
 * - FieldOS Integration (FieldOsPermitClient + VeripmFieldosPermitsService)
 * - Activity + event pipeline (VeripmPermitActivityService / VeripmPermitEventPipeline)
 * Downstream: VERICore safety links + CSS impact + dashboard invalidate via EventBus.
 */
@Module({
  imports: [PrismaModule, WorkersModule, DomainEventBusModule],
  controllers: [PmPermitsController, VeripmFieldosPermitsController],
  providers: [
    PmPermitsService,
    FieldOsPermitClient,
    VeripmFieldosPermitsService,
    VeripmPermitActivityService,
    VeripmPermitEventPipeline,
  ],
  exports: [
    PmPermitsService,
    VeripmFieldosPermitsService,
    FieldOsPermitClient,
    VeripmPermitActivityService,
  ],
})
export class PmPermitsModule {}
