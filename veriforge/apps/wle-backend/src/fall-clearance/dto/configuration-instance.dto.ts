import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ClearanceParamsDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxFreeFallM!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  decelerationDistanceM!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  harnessStretchM!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lifelinePayoutM!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  anchorDeflectionM!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  safetyMarginM!: number;
}

export class ConfigurationInstanceDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsUUID()
  equipmentId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  anchorHeightM!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  workSurfaceHeightM!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  horizontalOffsetM?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  workerMassKg?: number;

  @IsOptional()
  @IsUUID()
  siteId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['indoor', 'outdoor', 'leading_edge', 'confined', 'general'])
  environment?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateEquipmentDto {
  @IsIn(['lanyard', 'srl', 'harness', 'anchor', 'system'])
  type!: 'lanyard' | 'srl' | 'harness' | 'anchor' | 'system';

  @IsString()
  @MinLength(1)
  manufacturer!: string;

  @IsString()
  @MinLength(1)
  model!: string;

  @ValidateNested()
  @Type(() => ClearanceParamsDto)
  @IsObject()
  clearanceParams!: ClearanceParamsDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  standardRefs?: string[];

  @IsOptional()
  @IsString()
  rawManualData?: string;
}

export type ClearanceStatus = 'PASS' | 'WARNING' | 'FAIL';

export class CalculationResultDto {
  id!: string;
  configId!: string;
  requiredClearanceM!: number;
  availableClearanceM!: number;
  status!: ClearanceStatus;
  breakdown!: {
    freeFallM: number;
    decelerationM: number;
    harnessStretchM: number;
    lifelinePayoutM: number;
    anchorDeflectionM: number;
    safetyMarginM: number;
  };
  standardBasis!: Array<{
    ref: string;
    description: string;
  }>;
  aiExplanation!: string;
}
