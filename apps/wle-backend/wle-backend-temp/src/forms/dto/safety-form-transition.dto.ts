import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SafetyFormStatus } from '@prisma/client';

export class SafetyFormTransitionDto {
  @IsEnum(SafetyFormStatus)
  status!: SafetyFormStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
