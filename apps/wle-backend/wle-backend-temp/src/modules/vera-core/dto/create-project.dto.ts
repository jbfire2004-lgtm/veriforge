import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsInt()
  companyId!: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsInt()
  siteId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;
}

export class AssignToProjectDto {
  @IsOptional()
  @IsInt()
  workerId?: number;

  @IsOptional()
  @IsInt()
  equipmentId?: number;
}
