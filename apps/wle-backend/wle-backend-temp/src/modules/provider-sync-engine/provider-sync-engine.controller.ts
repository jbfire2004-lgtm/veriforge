import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { PublicRateLimited } from '../../security/decorators/public-rate-limit.decorator';
import { rolesFor } from '../../security/rbac';
import { UpsertProviderSyncConfigDto } from './dto/provider-sync-config.dto';
import { PROVIDER_API_TEMPLATES } from './provider-api-templates';
import {
  ProviderSyncEngineService,
  type ProviderWebhookPayload,
} from './provider-sync-engine.service';
import type { Request } from 'express';

type ReqUser = Request & { user?: { id: number; companyId?: number | null } };

@Controller(`${API_V1_PREFIX}/provider-sync`)
export class ProviderSyncEngineController {
  constructor(private readonly sync: ProviderSyncEngineService) {}

  @Get('templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...rolesFor('manageProviderApis'))
  listTemplates() {
    return PROVIDER_API_TEMPLATES;
  }

  @Put('providers/:providerId/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...rolesFor('manageProviderApis'))
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  upsertConfig(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() body: UpsertProviderSyncConfigDto,
    @Req() req: ReqUser,
  ) {
    return this.sync.upsertSyncConfig(providerId, body, req.user);
  }

  @Post('providers/:providerId/webhook')
  @PublicRateLimited(60, 60_000)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async webhook(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() body: ProviderWebhookPayload,
    @Headers('x-vera-signature') signature?: string,
  ) {
    return this.sync.handleWebhook(providerId, body, signature);
  }

  @Post('providers/:providerId/poll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...rolesFor('manageProviderApis'))
  poll(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Query('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.sync.pollProvider(providerId, companyId);
  }

  @Post('poll-due')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...rolesFor('manageProviderApis'))
  pollDue() {
    return this.sync.pollAllDue();
  }
}
