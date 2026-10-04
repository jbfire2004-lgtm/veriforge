import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateUnionHallDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  localNumber?: string;

  @IsOptional()
  @IsString()
  region?: string;
}

export class AddUnionMemberDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  memberNumber?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class DispatchWorkerDto {
  @IsInt()
  workerId!: number;

  @IsInt()
  companyId!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
