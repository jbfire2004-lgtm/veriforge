import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class ClassifyPhotoDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  ocrText?: string;

  @IsOptional()
  @IsInt()
  coreFileId?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsInt()
  projectId?: number;
}
