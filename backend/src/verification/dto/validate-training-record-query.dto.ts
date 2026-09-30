import { IsOptional, IsString } from 'class-validator';

/**
 * Raw query strings for `GET .../training/:id` (VERA Core training verification).
 * Parsed to {@link ValidateTrainingRecordOptions} via {@link parseValidateTrainingRecordQuery}.
 */
export class ValidateTrainingRecordQueryDto {
  @IsOptional()
  @IsString()
  expectedWorkerId?: string;

  @IsOptional()
  @IsString()
  expectedCompanyId?: string;

  @IsOptional()
  @IsString()
  expectedTrainingType?: string;

  @IsOptional()
  @IsString()
  expectedCertificateNumber?: string;

  @IsOptional()
  @IsString()
  expectedProvider?: string;
}
