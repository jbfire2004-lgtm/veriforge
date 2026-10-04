import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TrainingIngestionService } from './training-ingestion.service';
import { IngestTrainingCsvDto } from './dto/ingest-training-csv.dto';
import { IngestTrainingRowsDto } from './dto/ingest-training-rows.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
@Controller('training-ingestion')
export class TrainingIngestionController {
  constructor(private readonly ingestion: TrainingIngestionService) {}

  /** Bulk ingest from CSV text (paste or client-built string). */
  @Post('csv')
  ingestCsv(@Body() dto: IngestTrainingCsvDto) {
    return this.ingestion.ingestCsv(dto.companyId, dto.csv);
  }

  /** Bulk ingest from structured JSON rows (integrations / UI wizard). */
  @Post('rows')
  ingestRows(@Body() dto: IngestTrainingRowsDto) {
    return this.ingestion.ingestRows(dto.companyId, dto.rows);
  }
}
