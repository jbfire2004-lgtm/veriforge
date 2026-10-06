import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SiteAccessDto {
  @IsBoolean()
  allowed: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}
