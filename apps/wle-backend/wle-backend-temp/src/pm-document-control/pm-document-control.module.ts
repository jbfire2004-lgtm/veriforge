import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PmCorrectiveActionsModule } from '../pm-corrective-actions/pm-corrective-actions.module';
import { PmDocumentControlController } from './pm-document-control.controller';
import { PmSdsController } from './pm-sds.controller';
import { PmDocumentControlService } from './pm-document-control.service';
import { PmDocumentCailIntelligenceService } from './pm-document-cail-intelligence.service';
import { ChemicalHazardEngine } from './chemical-hazard.engine';

@Module({
  imports: [PrismaModule, PmCorrectiveActionsModule],
  controllers: [PmDocumentControlController, PmSdsController],
  providers: [
    PmDocumentControlService,
    PmDocumentCailIntelligenceService,
    ChemicalHazardEngine,
  ],
  exports: [PmDocumentControlService, PmDocumentCailIntelligenceService],
})
export class PmDocumentControlModule {}
