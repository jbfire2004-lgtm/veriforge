import { IsInt, IsOptional, IsString } from 'class-validator';

export class MergeWorkerDto {
  @IsInt()
  survivorId!: number;

  @IsInt()
  mergedId!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
