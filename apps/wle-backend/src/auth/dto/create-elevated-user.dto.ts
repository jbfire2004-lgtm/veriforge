import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export class CreateElevatedUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn(['ADMIN', 'SUPERVISOR'])
  role: 'ADMIN' | 'SUPERVISOR';
}
