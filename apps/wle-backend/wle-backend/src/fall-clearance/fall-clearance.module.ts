import { Module } from '@nestjs/common';
import { FallClearanceService } from './fall-clearance.service';
import { FallClearanceController } from './fall-clearance.controller';
import { EquipmentCatalogService } from './equipment-catalog.service';
import { EquipmentManualAiParserService } from './equipment-manual-ai-parser.service';
import { StandardsLibraryService } from './standards-library.service';
import { AuditLogService } from './audit-log.service';

@Module({
  controllers: [FallClearanceController],
  providers: [
    FallClearanceService,
    EquipmentCatalogService,
    EquipmentManualAiParserService,
    StandardsLibraryService,
    AuditLogService,
  ],
  exports: [FallClearanceService, EquipmentCatalogService],
})
export class FallClearanceModule {}
