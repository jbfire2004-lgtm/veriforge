import { IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCertificationDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsInt()
  expiryDays: number;
}
