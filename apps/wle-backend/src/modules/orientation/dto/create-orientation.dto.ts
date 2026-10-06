import { OrientationPackageType } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateOrientationDto {
  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsEnum(OrientationPackageType)
  type: OrientationPackageType;

  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsArray()
  languages?: string[];
}
