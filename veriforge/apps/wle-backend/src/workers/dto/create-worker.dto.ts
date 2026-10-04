import { IsString, IsOptional, IsInt, MinLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';

function trimString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
}

export class CreateWorkerDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1, { message: 'firstName is required' })
  firstName: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(1, { message: 'lastName is required' })
  lastName: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
