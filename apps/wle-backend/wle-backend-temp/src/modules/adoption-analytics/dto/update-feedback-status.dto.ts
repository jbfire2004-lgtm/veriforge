import { FeedbackRequestStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateFeedbackStatusDto {
  @IsEnum(FeedbackRequestStatus)
  status: FeedbackRequestStatus;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
