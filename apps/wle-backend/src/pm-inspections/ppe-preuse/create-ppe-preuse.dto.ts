import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PPE_PREUSE_CHECKLIST } from './ppe-preuse.constants';

const ITEM_IDS = PPE_PREUSE_CHECKLIST.map((i) => i.id);

export class PpePreUseItemDto {
  @IsString()
  @IsIn(ITEM_IDS)
  id!: string;

  @IsIn(['pass', 'fail', 'na'])
  result!: 'pass' | 'fail' | 'na';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class CreatePpePreUseDto {
  @IsInt()
  projectId!: number;

  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsInt()
  workerId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  locationNote?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  taskType?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PpePreUseItemDto)
  items!: PpePreUseItemDto[];

  @IsOptional()
  @IsString()
  deficiencies?: string;

  @IsOptional()
  @IsBoolean()
  removedFromService?: boolean;

  @IsOptional()
  @IsBoolean()
  acknowledgedSafeToWork?: boolean;

  @IsOptional()
  @IsDateString()
  inspectedAt?: string;
}
