import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { STAFF_ROLES } from '../vera-core/roles';
import { FieldSyncBatchDto } from './dto/field-sync.dto';
import { FieldSyncService } from './field-sync.service';

type ReqUser = Request & { user: { id: number } };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/field`)
export class FieldSyncController {
  constructor(private readonly fieldSync: FieldSyncService) {}

  @Get('delta')
  @Roles(...STAFF_ROLES)
  delta(
    @Query('companyId') companyId?: string,
    @Query('since') since?: string,
  ) {
    return this.fieldSync.fetchDelta({
      companyId: companyId ? Number(companyId) : undefined,
      since,
    });
  }

  @Get('offline-bundle')
  @Roles(...STAFF_ROLES)
  offlineBundle(
    @Query('companyId') companyId?: string,
    @Query('workerId') workerId?: string,
  ) {
    return this.fieldSync.fetchOfflineBundle({
      companyId: companyId ? Number(companyId) : undefined,
      workerId: workerId ? Number(workerId) : undefined,
    });
  }

  @Post('offline-registry')
  @Roles(...STAFF_ROLES)
  registerOfflineScan(
    @Body() body: Record<string, unknown>,
    @Req() req: ReqUser,
  ) {
    return this.fieldSync.registerOfflineScan(body, req.user.id);
  }

  @Post('sync-batch')
  @Roles(...STAFF_ROLES)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  syncBatch(@Body() body: FieldSyncBatchDto, @Req() req: ReqUser) {
    return this.fieldSync.processBatch(
      body.actions.map((a) => ({
        type: a.type,
        payload: a.payload,
        clientTimestamp: a.clientTimestamp,
        clientVersion: a.clientVersion,
      })),
      req.user.id,
      { batchId: body.batchId, clientId: body.clientId },
    );
  }
}
