import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCertificationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  expiryDays?: number;
}
