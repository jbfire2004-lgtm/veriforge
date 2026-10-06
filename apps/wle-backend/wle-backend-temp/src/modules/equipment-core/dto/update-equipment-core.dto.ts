import { PartialType } from '@nestjs/mapped-types';
import { CreateEquipmentCoreDto } from './create-equipment-core.dto';

export class UpdateEquipmentCoreDto extends PartialType(
  CreateEquipmentCoreDto,
) {}
