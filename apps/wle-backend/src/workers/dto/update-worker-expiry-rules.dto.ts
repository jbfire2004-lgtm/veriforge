import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateWorkerExpiryRulesDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  orientationExpiryDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  certificationExpiryDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  notSeenDays?: number;

  @IsOptional()
  @IsBoolean()
  autoDeactivate?: boolean;

  @IsOptional()
  @IsBoolean()
  autoNotify?: boolean;
}
