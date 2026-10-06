import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ProvidersService } from './providers.service';

/**
 * Training issuers (schools / programs). Linked from {@link TrainingRecord} as `providerId`,
 * not from {@link Worker} — employment stays on `Worker.companyId`.
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  findAll() {
    return this.providersService.findAll();
  }
}
