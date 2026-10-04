import {
  Body,
  Controller,
  Get,
  Post,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Throttle(10, 60)
  @Post('login')
  login(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    body: AdminLoginDto,
  ) {
    return this.adminService.login(body.email, body.password);
  }

  @Roles(UserRole.ADMIN)
  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }

  @Roles(UserRole.ADMIN)
  @Get('recent')
  recent() {
    return this.adminService.recentActivity();
  }

  @Roles(UserRole.ADMIN)
  @Get('compliance')
  compliance() {
    return this.adminService.complianceSnapshot();
  }
}
