import { Type, Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class AssignWorkersCompanyDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @Type(() => Number)
  @IsInt({ each: true })
  workerIds: number[];

  /** When true, sets each worker's `companyId` to null (unassigned pool). */
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  unassign?: boolean;

  /** Target employer company (required when `unassign` is not true). */
  @ValidateIf((o) => !o.unassign)
  @Type(() => Number)
  @IsInt()
  companyId?: number;
}
