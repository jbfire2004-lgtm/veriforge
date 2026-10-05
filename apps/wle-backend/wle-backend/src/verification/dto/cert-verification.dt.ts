import { IsString, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CertVerificationDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @Type(() => Date)
  issuedAt: Date;

  @Type(() => Date)
  expiresAt: Date;

  @IsBoolean()
  isValid: boolean;
}
