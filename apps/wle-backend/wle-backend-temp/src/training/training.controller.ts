import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { TrainingService } from './training.service';

@Controller('training')
export class TrainingController {
  constructor(private readonly training: TrainingService) {}

  /** Every training record + `isValid` (used by admin home and legacy `/training` clients). */
  @Get()
  listAllWithCompliance() {
    return this.training.listAllRecordsWithCompliance();
  }

  // CERTIFICATIONS
  @Get('certifications')
  listCertifications() {
    return this.training.listCertifications();
  }

  @Post('certifications')
  createCertification(
    @Body()
    body: {
      name: string;
      code: string;
      description?: string;
    },
  ) {
    return this.training.createCertification(body);
  }

  // TRAINING RECORDS
  @Post('records')
  addRecord(
    @Body()
    body: {
      workerId: number;
      certificationId: number;
      providerId?: number;
      issuedAt?: Date;
      expiresAt?: Date;
      notes?: string;
    },
  ) {
    return this.training.addRecord(body);
  }

  @Patch('records/:id')
  updateRecord(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: Partial<{
      issuedAt: Date;
      expiresAt: Date | null;
      notes: string | null;
    }>,
  ) {
    return this.training.updateRecord(id, body);
  }

  @Delete('records/:id')
  removeRecord(@Param('id', ParseIntPipe) id: number) {
    return this.training.removeRecord(id);
  }

  // WORKER VIEWS
  @Get('worker/:id')
  recordsForWorker(@Param('id', ParseIntPipe) id: number) {
    return this.training.recordsForWorker(id);
  }

  @Get('worker/:id/summary')
  summaryForWorker(@Param('id', ParseIntPipe) id: number) {
    return this.training.summaryForWorker(id);
  }

  // COMPANY VIEW
  @Get('company/:id/summary')
  summaryForCompany(@Param('id', ParseIntPipe) id: number) {
    return this.training.summaryForCompany(id);
  }
}
