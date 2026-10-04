import { IsInt, IsString } from 'class-validator';

export class ScanEquipmentQrDto {
  @IsString()
  qrToken!: string;

  @IsInt()
  companyId!: number;
}
