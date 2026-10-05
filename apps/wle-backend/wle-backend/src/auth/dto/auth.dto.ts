import { Allow, IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  /** Accepted-but-ignored to prevent privilege escalation payload breakage. */
  @IsOptional()
  @Allow()
  role?: unknown;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
