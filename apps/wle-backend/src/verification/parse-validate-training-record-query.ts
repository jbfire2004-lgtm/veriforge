import { BadRequestException } from '@nestjs/common';
import type { ValidateTrainingRecordQueryDto } from './dto/validate-training-record-query.dto';
import type { ValidateTrainingRecordOptions } from './types/training-record-verification.types';

/**
 * Maps HTTP query strings to {@link VerificationService.validateTrainingRecord} options.
 * Throws {@link BadRequestException} when `expectedWorkerId` is present but not an integer.
 */
export function parseValidateTrainingRecordQuery(
  q: Partial<ValidateTrainingRecordQueryDto>,
): ValidateTrainingRecordOptions {
  const out: ValidateTrainingRecordOptions = {};

  if (q.expectedWorkerId != null && q.expectedWorkerId !== '') {
    if (!/^\d+$/.test(q.expectedWorkerId)) {
      throw new BadRequestException(
        'expectedWorkerId must be a positive integer',
      );
    }
    const n = Number(q.expectedWorkerId);
    if (!Number.isSafeInteger(n) || n < 1) {
      throw new BadRequestException(
        'expectedWorkerId must be a positive integer',
      );
    }
    out.expectedWorkerId = n;
  }

  if (q.expectedCompanyId != null && q.expectedCompanyId !== '') {
    if (!/^\d+$/.test(q.expectedCompanyId)) {
      throw new BadRequestException(
        'expectedCompanyId must be a positive integer',
      );
    }
    const n = Number(q.expectedCompanyId);
    if (!Number.isSafeInteger(n) || n < 1) {
      throw new BadRequestException(
        'expectedCompanyId must be a positive integer',
      );
    }
    out.expectedCompanyId = n;
  }

  if (q.expectedTrainingType != null && q.expectedTrainingType !== '') {
    out.expectedTrainingType = q.expectedTrainingType;
  }

  if (
    q.expectedCertificateNumber != null &&
    q.expectedCertificateNumber !== ''
  ) {
    out.expectedCertificateNumber = q.expectedCertificateNumber;
  }

  if (q.expectedProvider != null && q.expectedProvider !== '') {
    out.expectedProvider = q.expectedProvider;
  }

  return out;
}
