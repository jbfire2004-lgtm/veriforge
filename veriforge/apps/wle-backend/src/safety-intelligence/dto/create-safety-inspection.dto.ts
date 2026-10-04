import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSafetyInspectionDto {
  @IsInt()
  projectId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsInt()
  siteId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  locationNote?: string;
}
