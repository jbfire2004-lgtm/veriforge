import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class MultipartFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  purpose?: string;

  /** Optional company override (staff); otherwise JWT company is used. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  companyId?: number;

  /** Document Storage linked_project_id */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  projectId?: number;
}
