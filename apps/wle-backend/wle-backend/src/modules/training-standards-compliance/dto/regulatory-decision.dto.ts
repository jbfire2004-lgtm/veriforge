import { IsInt, IsOptional, IsString } from 'class-validator';

export class RegulatoryDecisionBodyDto {
  @IsInt()
  trainingRecordId!: number;

  @IsOptional()
  @IsString()
  jurisdictionCode?: string;
}
