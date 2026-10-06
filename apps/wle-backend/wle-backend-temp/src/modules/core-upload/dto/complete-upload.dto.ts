import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class CompleteUploadDto {
  @Type(() => Number)
  @IsInt()
  id!: number;
}
