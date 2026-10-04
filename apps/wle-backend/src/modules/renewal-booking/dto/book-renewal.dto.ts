import { IsNotEmpty, IsString } from 'class-validator';

export class BookRenewalDto {
  @IsString()
  @IsNotEmpty()
  workerId!: string;

  @IsString()
  @IsNotEmpty()
  certificationId!: string;

  @IsString()
  @IsNotEmpty()
  vendorId!: string;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  time!: string;
}
