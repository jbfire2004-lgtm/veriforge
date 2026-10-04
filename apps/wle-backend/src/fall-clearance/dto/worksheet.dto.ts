import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ClearanceParamsDto } from './configuration-instance.dto';

export class WorksheetGeometryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  anchorHeightM?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  workSurfaceHeightM?: number;

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
  @IsString()
  @IsIn(['indoor', 'outdoor', 'leading_edge', 'confined', 'general'])
  environment?: string;
}

export class SaveWorksheetDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsUUID()
  equipmentId?: string;

  @ValidateNested()
  @Type(() => ClearanceParamsDto)
  @IsObject()
  referenceParams!: ClearanceParamsDto;

  @ValidateNested()
  @Type(() => ClearanceParamsDto)
  @IsObject()
  userParams!: ClearanceParamsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorksheetGeometryDto)
  @IsObject()
  geometry?: WorksheetGeometryDto;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  userRequiredM?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  userAvailableM?: number;

  @IsOptional()
  @IsString()
  userNotes?: string;

  /** Must be true to persist as SAVED. */
  @IsBoolean()
  acknowledged!: boolean;

  @IsOptional()
  @IsString()
  @MinLength(1)
  acknowledgedBy?: string;
}

export type WorksheetRecordDto = {
  id: string;
  companyId: number | null;
  projectId: number | null;
  industry: string | null;
  equipmentId: string | null;
  referenceParams: ClearanceParamsDto;
  userParams: ClearanceParamsDto;
  geometry: WorksheetGeometryDto;
  userRequiredM: number | null;
  userAvailableM: number | null;
  /** Sum of user-entered line items only — not a Vera safety verdict. */
  userLineSubtotalM: number | null;
  userNotes: string | null;
  status: 'DRAFT' | 'SAVED';
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  createdAt: string;
  updatedAt: string;
  disclaimer: string;
};
