import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class BulkVerifyDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  validationResultIds!: number[];

  @IsOptional()
  @IsString()
  notes?: string;
}
