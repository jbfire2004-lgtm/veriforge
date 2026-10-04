import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AddInspectionSignatureDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  role!: string;

  @IsOptional()
  @IsString()
  signatureData?: string;

  @IsOptional()
  @IsInt()
  coreFileId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  signerName?: string;

  @IsOptional()
  @IsInt()
  signerUserId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  clientSyncId?: string;
}
