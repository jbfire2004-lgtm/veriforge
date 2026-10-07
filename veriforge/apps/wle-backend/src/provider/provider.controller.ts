import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ProviderService } from './provider.service';

@Controller('provider')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.TRAINING_PROVIDER_ADMIN,
  UserRole.TRAINING_INSTRUCTOR,
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
)
export class ProviderController {
  constructor(private readonly provider: ProviderService) {}

  // ACCOUNT
  @Public()
  @Post('register')
  register(@Body() body: { name: string; email: string; password: string }) {
    return this.provider.register(body);
  }

  @Public()
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.provider.login(body.email, body.password);
  }
  
    // PROGRAMS
    @Post(':id/program')
    uploadProgram(
      @Param('id', ParseIntPipe) providerId: number,
      @Body() body: { name: string; description?: string; content: any },
    ) {
      return this.provider.uploadProgram(providerId, body);
    }
  
    @Get(':id/programs')
    listPrograms(@Param('id', ParseIntPipe) providerId: number) {
      return this.provider.listPrograms(providerId);
    }
  
    // CLASSES
    @Post(':id/class')
    createClass(
      @Param('id', ParseIntPipe) providerId: number,
      @Body() body: { programId: number; date: Date; location?: string; capacity?: number },
    ) {
      return this.provider.createClass(providerId, body);
    }
  
    @Get(':id/classes')
    listClasses(@Param('id', ParseIntPipe) providerId: number) {
      return this.provider.listClasses(providerId);
    }
  
    // CREDENTIALS
    @Post(':id/credential')
    issueCredential(
      @Param('id', ParseIntPipe) providerId: number,
      @Body() body: { workerId: number; programId: number; expiresAt?: Date },
    ) {
      return this.provider.issueCredential(providerId, body);
    }
  
    // DASHBOARD
    @Get(':id/dashboard')
    dashboard(@Param('id', ParseIntPipe) providerId: number) {
      return this.provider.dashboard(providerId);
    }
}