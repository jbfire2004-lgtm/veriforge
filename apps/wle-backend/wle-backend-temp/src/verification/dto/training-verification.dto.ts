import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TrainingItemDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @IsString()
  course: string;

  @IsString()
  module: string;

  @IsString()
  assignment: string;

  @Type(() => Date)
  completedAt: Date;

  @IsOptional()
  @IsNumber()
  score?: number | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class TrainingVerificationDto {
  @Type(() => Number)
  @IsInt()
  userId: number;

  @IsString()
  name: string;

  @ValidateNested({ each: true })
  @Type(() => TrainingItemDto)
  training: TrainingItemDto[];
}
