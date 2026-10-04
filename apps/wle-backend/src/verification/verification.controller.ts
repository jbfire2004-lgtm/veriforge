import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PublicRateLimited } from '../security/decorators/public-rate-limit.decorator';
import { PositiveIntPipe } from '../security/validation/positive-int.pipe';
import { STAFF_ROLES } from '../modules/vera-core/roles';
import { parseValidateTrainingRecordQuery } from './parse-validate-training-record-query';
import { VerificationService } from './verification.service';

/**
 * Public verification (QR / kiosk) — unauthenticated, rate-limited, minimal payloads.
 * Prefer token URLs (`/verify/t/{qrToken}`). Numeric ids are legacy-only.
 * Full-detail routes require staff JWT.
 */
@Controller('verify')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  /** Canonical public entry — unguessable worker or equipment token. */
  @PublicRateLimited(60)
  @Get('t/:token')
  verifyByToken(@Param('token') token: string) {
    return this.verificationService.verifyByPublicToken(token);
  }

  @PublicRateLimited(40)
  @Get('worker/:ref')
  verifyWorker(@Param('ref') ref: string) {
    return this.verificationService.verifyWorkerByRef(ref);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES, UserRole.WORKER)
  @Get('worker/:ref/full')
  verifyWorkerFull(@Param('ref') ref: string) {
    return this.verificationService.verifyWorkerFullByRef(ref);
  }

  @PublicRateLimited(30)
  @Get('cert/:id')
  verifyCert(@Param('id', PositiveIntPipe) id: number) {
    return this.verificationService.verifyCertificationPublic(id);
  }

  @PublicRateLimited(30)
  @Get('training/:id')
  verifyTraining(@Param('id', PositiveIntPipe) id: number) {
    return this.verificationService.verifyTrainingRecordPublic(id);
  }

  @PublicRateLimited(30)
  @Get('core/training-record/:id')
  verifyCoreTrainingRecord(
    @Param('id', PositiveIntPipe) id: number,
    @Query('expectedWorkerId') expectedWorkerId?: string,
    @Query('expectedCompanyId') expectedCompanyId?: string,
    @Query('expectedTrainingType') expectedTrainingType?: string,
    @Query('expectedCertificateNumber') expectedCertificateNumber?: string,
    @Query('expectedProvider') expectedProvider?: string,
  ) {
    return this.verificationService.validateTrainingRecord(
      id,
      parseValidateTrainingRecordQuery({
        expectedWorkerId,
        expectedCompanyId,
        expectedTrainingType,
        expectedCertificateNumber,
        expectedProvider,
      }),
    );
  }

  @PublicRateLimited(30)
  @Get('credential/:id')
  verifyCredential(@Param('id', PositiveIntPipe) id: number) {
    return this.verificationService.verifyCredentialPublic(id);
  }

  @PublicRateLimited(20)
  @Get('company/:id')
  verifyCompany(@Param('id', PositiveIntPipe) id: number) {
    return this.verificationService.verifyCompanyPublic(id);
  }

  @PublicRateLimited(30)
  @Get('site-access/:token')
  verifySiteAccess(@Param('token') token: string) {
    return this.verificationService.verifySiteAccessPublic(token);
  }

  /** Public equipment card — `?ref=` (token) preferred; `?id=` legacy. */
  @PublicRateLimited(40)
  @Get('equipment')
  verifyEquipmentQuery(
    @Query('ref') ref?: string,
    @Query('id') legacyId?: string,
  ) {
    const resolved = ref?.trim() || legacyId?.trim();
    if (!resolved) {
      return this.verificationService.verifyEquipmentMissingRef();
    }
    return this.verificationService.verifyEquipmentByRef(resolved);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @Get('equipment/full')
  verifyEquipmentFullQuery(
    @Query('ref') ref?: string,
    @Query('id') legacyId?: string,
  ) {
    const resolved = ref?.trim() || legacyId?.trim();
    if (!resolved) {
      return this.verificationService.verifyEquipmentMissingRef();
    }
    return this.verificationService.verifyEquipmentFullByRef(resolved);
  }

  @PublicRateLimited(20)
  @Get('combined')
  verifyCombined(
    @Query('worker') workerRef: string,
    @Query('equipment') equipmentRef: string,
  ) {
    return this.verificationService.verifyCombinedPublic(
      workerRef,
      equipmentRef,
    );
  }
}
