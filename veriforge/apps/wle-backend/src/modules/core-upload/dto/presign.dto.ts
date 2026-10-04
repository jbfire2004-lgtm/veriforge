import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { VERA_CORE_UPLOAD_ABSOLUTE_MAX_BYTES } from '../core-upload.constants';
import {
  IsCoreUploadAllowedMime,
  IsCoreUploadSizeWithinConfiguredMax,
} from '../validators/core-upload-presign.validators';

export class PresignDto {
  @IsString()
  @MaxLength(500)
  filename!: string;

  @IsString()
  @MaxLength(200)
  @IsCoreUploadAllowedMime()
  mimeType!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(VERA_CORE_UPLOAD_ABSOLUTE_MAX_BYTES)
  @IsCoreUploadSizeWithinConfiguredMax()
  sizeBytes!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  purpose?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  projectId?: number;
}
