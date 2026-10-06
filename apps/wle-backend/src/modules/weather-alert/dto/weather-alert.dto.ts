import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateWeatherSettingsDto {
  @IsOptional()
  @IsBoolean()
  weatherNotificationsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  weatherWalletDisplayEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  showWeatherAlerts?: boolean;
}

export class RecordUserLocationDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsString()
  source?: 'gps' | 'worksite' | 'primary';
}
