import { IsInt, IsOptional, IsString } from 'class-validator';

export class LinkUnionHallProviderDto {
  @IsInt()
  trainingProviderId!: number;
}

export class PushUnionHallTrainingDto {
  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsInt()
  equipmentId?: number;
}

export class UnionHallTrainingNotesDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
