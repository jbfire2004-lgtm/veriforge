import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

/** Multipart fields for POST /api/v1/training-ingestion/upload */
export class TrainingIngestUploadFieldsDto {
  @Type(() => Number)
  @IsInt()
  companyId!: number;

  /**
   * JSON string: one training row, `{ "rows": [ ... ] }`, or a top-level array.
   * Required for PDF/PNG/JPG unless the JSON file itself contains rows.
   */
  @IsOptional()
  @IsString()
  metadata?: string;
}
