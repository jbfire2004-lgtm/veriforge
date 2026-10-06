import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PmSiteAccessControlModule } from '../pm-site-access-control/pm-site-access-control.module';
import { PmEquipmentSafetyModule } from '../pm-equipment-safety/pm-equipment-safety.module';
import { PmEmergencyResponseModule } from '../pm-emergency-response/pm-emergency-response.module';
import { PmDocumentControlModule } from '../pm-document-control/pm-document-control.module';
import { PmSafetyStationsController } from './pm-safety-stations.controller';
import { PmStationController } from './pm-station.controller';
import { PmSafetyStationsService } from './pm-safety-stations.service';
import { PmSafetyStationsCailIntelligenceService } from './pm-safety-stations-cail-intelligence.service';

@Module({
  imports: [
    PrismaModule,
    PmSiteAccessControlModule,
    PmEquipmentSafetyModule,
    PmEmergencyResponseModule,
    PmDocumentControlModule,
  ],
  controllers: [PmSafetyStationsController, PmStationController],
  providers: [PmSafetyStationsService, PmSafetyStationsCailIntelligenceService],
  exports: [PmSafetyStationsService, PmSafetyStationsCailIntelligenceService],
})
export class PmSafetyStationsModule {}
