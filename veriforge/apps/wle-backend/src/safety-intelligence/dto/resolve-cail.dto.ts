import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CailAttachmentInput {
  @IsString()
  fileName!: string;

  @IsOptional()
  @IsString()
  storageKey?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  dataUrl?: string;
}

export class ResolveCailDto {
  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  @IsOptional()
  evidenceAfter?: unknown[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CailAttachmentInput)
  attachments?: CailAttachmentInput[];
}
