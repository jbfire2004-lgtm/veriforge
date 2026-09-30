import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { API_V1_PREFIX } from '../config/routes';
import { TrainingVerificationEngine } from '../services/trainingVerification';
import { TrainingVerificationIngestDto } from '../services/dto/training-verification-ingest.dto';
import { parseValidateTrainingRecordQuery } from '../verification/parse-validate-training-record-query';

type JwtRequestUser = { id: number; email?: string; role?: string };

const ENGINE_ROLES = [
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.SUPERVISOR,
  UserRole.PROJECT_MANAGER,
  UserRole.COMPANY_ADMIN,
];

/**
 * Training Verification Engine — HTTP routes
 *
 * POST /api/v1/training/verify/ingest     — provider ingest + full pipeline
 * POST /api/v1/training/verify/:id/run    — validate existing record
 * POST /api/v1/training/verify/:id/finalize — validate + attest + propagate
 * GET  /api/v1/training/verify/:id        — latest verified record
 * GET  /api/v1/training/verify/:id/runs   — audit history
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/training/verify`)
export class TrainingVerificationRoutesController {
  constructor(private readonly engine: TrainingVerificationEngine) {}

  @Post('ingest')
  @Roles(...ENGINE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  ingestAndVerify(
    @Body() dto: TrainingVerificationIngestDto,
    @Req() req: { user?: JwtRequestUser },
  ) {
    return this.engine.ingestAndVerify(dto, req.user?.id);
  }

  @Post(':id/run')
  @Roles(...ENGINE_ROLES)
  @HttpCode(HttpStatus.OK)
  runVerification(
    @Param('id', ParseIntPipe) id: number,
    @Query('expectedWorkerId') expectedWorkerId?: string,
    @Query('expectedCompanyId') expectedCompanyId?: string,
    @Query('expectedTrainingType') expectedTrainingType?: string,
    @Query('expectedCertificateNumber') expectedCertificateNumber?: string,
    @Query('expectedProvider') expectedProvider?: string,
    @Query('jurisdictionCode') jurisdictionCode?: string,
    @Req() req?: { user?: JwtRequestUser },
  ) {
    const parsed = parseValidateTrainingRecordQuery({
      expectedWorkerId,
      expectedCompanyId,
      expectedTrainingType,
      expectedCertificateNumber,
      expectedProvider,
    });
    return this.engine.verifyRecord(id, {
      ...parsed,
      jurisdictionCode,
      actorId: req?.user?.id,
      finalize: false,
    });
  }

  @Post(':id/finalize')
  @Roles(...ENGINE_ROLES)
  @HttpCode(HttpStatus.OK)
  finalizeVerification(
    @Param('id', ParseIntPipe) id: number,
    @Query('jurisdictionCode') jurisdictionCode?: string,
    @Req() req?: { user?: JwtRequestUser },
  ) {
    return this.engine.verifyRecord(id, {
      jurisdictionCode,
      actorId: req?.user?.id,
      finalize: true,
    });
  }

  @Get(':id/runs')
  @Roles(...ENGINE_ROLES)
  listRuns(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
  ) {
    return this.engine.listVerificationRuns(
      id,
      limit ? Number(limit) : undefined,
    );
  }

  @Get(':id')
  @Roles(...ENGINE_ROLES)
  async getVerified(@Param('id', ParseIntPipe) id: number) {
    const record = await this.engine.getVerifiedRecord(id);
    if (!record) {
      return this.engine.verifyRecord(id, { finalize: false });
    }
    return record;
  }
}
