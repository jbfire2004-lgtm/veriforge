import { IsInt, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class IngestTrainingCsvDto {
  @Type(() => Number)
  @IsInt()
  companyId: number;

  @IsString()
  @MinLength(1)
  csv: string;
}
