import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class LinkWorkerDto {
  @IsInt()
  workerId!: number;

  @IsInt()
  companyId!: number;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  trade?: string;

  @IsOptional()
  @IsBoolean()
  deactivateOtherCompanies?: boolean;
}

export class LinkWorkerByQrDto {
  @IsString()
  qrToken!: string;

  @IsInt()
  companyId!: number;
}
