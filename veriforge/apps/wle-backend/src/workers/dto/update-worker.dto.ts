import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateWorkerDto } from './create-worker.dto';

export class UpdateWorkerDto extends PartialType(CreateWorkerDto) {
  /** Explicit null unassigns the worker from their employer roster. */
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @Type(() => Number)
  @IsInt()
  companyId?: number | null;
}
