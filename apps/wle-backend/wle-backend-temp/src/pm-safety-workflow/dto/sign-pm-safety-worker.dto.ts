import { IsString, MaxLength, MinLength } from 'class-validator';

export class SignPmSafetyWorkerDto {
  @IsString()
  @MinLength(3)
  @MaxLength(4000)
  attestationText!: string;
}
