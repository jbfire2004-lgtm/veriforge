import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class UpsertProviderSyncConfigDto {
  @IsOptional()
  @IsIn(['webhook', 'poll'])
  syncMode?: 'webhook' | 'poll';

  @IsOptional()
  @IsUrl()
  pollUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24 * 60)
  pollIntervalMinutes?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  apiKeyEnvVar?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  webhookSecret?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(1)
  templateKey?: string;
}
