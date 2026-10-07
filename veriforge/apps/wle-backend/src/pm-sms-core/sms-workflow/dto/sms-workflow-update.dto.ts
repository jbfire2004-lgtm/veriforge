import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class SmsWorkflowUpdateDto {
  @IsOptional()
  @IsObject()
  overview?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  hazards?: unknown[];

  @IsOptional()
  @IsArray()
  findings?: unknown[];

  @IsOptional()
  @IsArray()
  controls?: unknown[];

  @IsOptional()
  @IsArray()
  actions?: unknown[];

  @IsOptional()
  @IsArray()
  signatures?: unknown[];

  @IsOptional()
  @IsArray()
  attachments?: unknown[];

  @IsOptional()
  @IsObject()
  answers?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  taskDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  workScope?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  locationNote?: string;

  @IsOptional()
  @IsObject()
  environmentalJson?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16000)
  narrative?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  immediateActions?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  currentStep?: number;

  @IsOptional()
  @IsObject()
  guidedAnswersJson?: Record<string, unknown>;
}
