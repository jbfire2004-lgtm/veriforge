import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OpenIncidentInvestigationDto {
  @IsInt()
  projectId!: number;

  @IsOptional()
  @IsString()
  narrative?: string;

  @IsOptional()
  @IsString()
  immediateActions?: string;

  @IsOptional()
  @IsInt()
  leadInvestigatorId?: number;
}

export class UpdateIncidentInvestigationDto {
  @IsOptional()
  @IsString()
  narrative?: string;

  @IsOptional()
  @IsString()
  immediateActions?: string;

  @IsOptional()
  @IsString()
  investigationStatus?: string;
}

class CapaItemDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  ownerCompanyId!: number;

  @IsOptional()
  @IsInt()
  assignedUserId?: number;

  @IsOptional()
  @IsString()
  actionType?: string;
}

export class BulkIncidentCapaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CapaItemDto)
  items!: CapaItemDto[];
}
