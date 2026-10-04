import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class AiGenerateOrientationDto {
  @IsString()
  industry: string;

  @IsString()
  businessType: string;

  @IsString()
  workEnvironment: string;

  @IsArray()
  hazards: string[];

  @IsArray()
  ppeRequirements: string[];

  @IsArray()
  safetyPrograms: string[];

  @IsString()
  regulatoryRegion: string;

  @IsOptional()
  @IsString()
  companyRules?: string;

  @IsOptional()
  @IsString()
  siteRules?: string;
}
