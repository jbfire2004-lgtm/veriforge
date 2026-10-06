import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export class CredentialLedgerBackfillDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  companyId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5000)
  limit?: number;

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}
