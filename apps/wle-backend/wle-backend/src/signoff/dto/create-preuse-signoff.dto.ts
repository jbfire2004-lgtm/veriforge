import {
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsObject,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePreUseSignoffDto {
  @IsOptional()
  @ValidateIf((_o, v) => v !== null && v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  workerId?: number | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null && v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  equipmentId?: number | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null && v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  supervisorId?: number | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null && v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  siteId?: number | null;

  @IsObject()
  checklist: Record<string, boolean>;

  @IsOptional()
  @IsString()
  workerSignature?: string | null;

  @IsNotEmpty()
  @IsString()
  supervisorSignature: string;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
