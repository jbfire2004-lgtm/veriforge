import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { EquipmentAttachmentType } from '@prisma/client';

export class CreateAttachmentDto {
  @IsEnum(EquipmentAttachmentType)
  type!: EquipmentAttachmentType;

  @IsString()
  name!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
