import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { STAFF_ROLES } from '../../vera-core/roles';
import { V1_ROUTES } from '../../../config/routes.registry';
import { SyncApiService } from '../services/sync-api.service';
import { ApiSuccess } from '../decorators/api-success.decorator';
import { ApiSuccessInterceptor } from '../interceptors/api-success.interceptor';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ApiSuccessInterceptor)
@Controller(V1_ROUTES.sync)
export class SyncApiController {
  constructor(private readonly sync: SyncApiService) {}

  @Post('batch')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  batch(
    @Body()
    body: {
      actions: {
        type: string;
        payload: Record<string, unknown>;
        clientTimestamp?: string;
        clientVersion?: number;
      }[];
      batchId?: string;
      clientId?: string;
    },
    @Req() req: { user?: { id?: number } },
  ) {
    return this.sync.processBatch(body.actions ?? [], req.user?.id ?? 0, {
      batchId: body.batchId,
      clientId: body.clientId,
    });
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ApiSuccessInterceptor)
@Controller(V1_ROUTES.dashboard)
export class DashboardApiController {
  constructor(private readonly sync: SyncApiService) {}

  @Get('widgets')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  widgets(
    @Req() req: { user?: { role?: string } },
    @Query('companyId') companyId?: string,
    @Query('unionHallId') unionHallId?: string,
  ) {
    return this.sync.getDashboardWidgets(
      req.user?.role ?? '',
      companyId ? Number(companyId) : undefined,
      unionHallId ? Number(unionHallId) : undefined,
    );
  }
}
