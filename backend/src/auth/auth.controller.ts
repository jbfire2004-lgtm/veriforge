import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { CreateElevatedUserDto } from './dto/create-elevated-user.dto';
import {
  ForgotPasswordDto,
  LogoutDto,
  RefreshTokenDto,
  ResetPasswordDto,
} from './dto/auth-refresh.dto';
import { Public } from './public.decorator';
import { Roles } from './roles.decorator';

type JwtRequestUser = { id: number; email: string; role: string };

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle(10, 60)
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  register(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
    body: RegisterDto,
  ) {
    return this.auth.register(body);
  }

  @Public()
  @Throttle(10, 60)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }

  @Public()
  @Throttle(20, 60)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() body: RefreshTokenDto) {
    return this.auth.refresh(body.refreshToken);
  }

  @Public()
  @Throttle(20, 60)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Body() body: LogoutDto) {
    return this.auth.logout(body.refreshToken);
  }

  @Public()
  @Throttle(5, 60)
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.auth.requestPasswordReset(body.email);
  }

  @Public()
  @Throttle(5, 60)
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.auth.resetPassword(body.token, body.newPassword);
  }

  @Get('me')
  me(@Req() req: Request & { user: JwtRequestUser & { role: UserRole } }) {
    return this.auth.getMe(req.user.id, req.user.role);
  }

  @Roles(UserRole.ADMIN)
  @Post('admin/users')
  createElevatedUser(@Body() body: CreateElevatedUserDto) {
    return this.auth.createElevatedUser(body);
  }
}
