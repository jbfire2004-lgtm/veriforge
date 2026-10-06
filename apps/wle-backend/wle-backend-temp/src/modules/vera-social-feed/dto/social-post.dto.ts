import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body!: string;

  @IsOptional()
  @IsEnum([
    'PROVIDER_POST',
    'COMPANY_ANNOUNCEMENT',
    'SAFETY_BULLETIN',
    'JOB_POSTING',
    'WORKER_MILESTONE',
    'TRAINING_UPLOAD',
    'SYSTEM_UPDATE',
  ])
  postType?:
    | 'PROVIDER_POST'
    | 'COMPANY_ANNOUNCEMENT'
    | 'SAFETY_BULLETIN'
    | 'JOB_POSTING'
    | 'WORKER_MILESTONE'
    | 'TRAINING_UPLOAD'
    | 'SYSTEM_UPDATE';

  @IsOptional()
  @IsEnum(['PUBLIC', 'COMPANY', 'FOLLOWERS'])
  visibility?: 'PUBLIC' | 'COMPANY' | 'FOLLOWERS';

  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsInt()
  trainingProviderId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}

export class EditPostDto {
  @IsUUID()
  postId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body?: string;
}

export class PostIdDto {
  @IsUUID()
  postId!: string;
}

export class CommentPostDto {
  @IsUUID()
  postId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  body!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class FollowDto {
  @IsEnum(['COMPANY', 'PROVIDER', 'USER'])
  targetType!: 'COMPANY' | 'PROVIDER' | 'USER';

  @IsString()
  targetId!: string;
}

export class ReportPostDto {
  @IsUUID()
  postId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  reason!: string;
}

export class PinPostDto {
  @IsUUID()
  postId!: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  scopeKey?: string;
}

export class FeedQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsInt()
  limit?: number;
}

export class MediaUploadDto {
  @IsString()
  fileType!: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsInt()
  sizeBytes?: number;

  @IsOptional()
  @IsUUID()
  postId?: string;
}
