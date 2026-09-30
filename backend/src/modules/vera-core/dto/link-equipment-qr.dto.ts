import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class LinkEquipmentByQrDto {
  @IsString()
  qrToken!: string;

  @IsInt()
  @Type(() => Number)
  companyId!: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  equipmentId?: number;
}
