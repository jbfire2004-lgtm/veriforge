import { Global, Module } from '@nestjs/common';
import { SafetyEcosystemEventsService } from './safety-ecosystem-events.service';
import { PmSafetyEcosystemController } from './pm-safety-ecosystem.controller';

@Global()
@Module({
  controllers: [PmSafetyEcosystemController],
  providers: [SafetyEcosystemEventsService],
  exports: [SafetyEcosystemEventsService],
})
export class PmSafetyEcosystemModule {}
