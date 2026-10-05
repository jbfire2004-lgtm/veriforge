import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class EmailAttachmentDto {
  @IsString()
  filename!: string;

  @IsString()
  mimeType!: string;

  @IsString()
  contentBase64!: string;
}

export class EmailIngestDto {
  @IsInt()
  companyId!: number;

  @IsString()
  fromEmail!: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EmailAttachmentDto)
  attachments!: EmailAttachmentDto[];
}
