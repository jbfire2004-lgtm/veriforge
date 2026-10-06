import { IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export class TrackEventDto {
  @IsInt()
  companyId: number;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsString()
  event: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
