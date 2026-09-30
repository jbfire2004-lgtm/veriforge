import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  companyId?: number;
}
