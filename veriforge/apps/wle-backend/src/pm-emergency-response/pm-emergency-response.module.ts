import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PmCorrectiveActionsModule } from '../pm-corrective-actions/pm-corrective-actions.module';
import { PmEmergencyResponseController } from './pm-emergency-response.controller';
import { PmEmergencyController } from './pm-emergency.controller';
import { PmEmergencyResponseService } from './pm-emergency-response.service';
import { PmEmergencyCailIntelligenceService } from './pm-emergency-cail-intelligence.service';

@Module({
  imports: [PrismaModule, NotificationsModule, PmCorrectiveActionsModule],
  controllers: [PmEmergencyResponseController, PmEmergencyController],
  providers: [PmEmergencyResponseService, PmEmergencyCailIntelligenceService],
  exports: [PmEmergencyResponseService, PmEmergencyCailIntelligenceService],
})
export class PmEmergencyResponseModule {}
