import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../../config/routes';
import { SUPERVISOR_ROLES } from '../../vera-core/roles';
import { WorkerOrientationProfileService } from './worker-orientation-profile.service';

@Controller(`${API_V1_PREFIX}/workers`)
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkerOrientationProfileController {
  constructor(private readonly profiles: WorkerOrientationProfileService) {}

  @Get(':workerId/orientation-profile')
  @Roles(...SUPERVISOR_ROLES, UserRole.WORKER, UserRole.CONTRACTOR_USER)
  getProfile(
    @Param('workerId', ParseIntPipe) workerId: number,
    @Query('companyId') companyIdRaw?: string,
    @Query('projectId') projectIdRaw?: string,
    @Query('siteId') siteIdRaw?: string,
    @Query('tradeId') tradeId?: string,
    @Query('unionDispatchType') unionDispatchType?: string,
  ) {
    return this.profiles.getProfile(workerId, {
      companyId: companyIdRaw ? parseInt(companyIdRaw, 10) : undefined,
      projectId: projectIdRaw ? parseInt(projectIdRaw, 10) : undefined,
      siteId: siteIdRaw ? parseInt(siteIdRaw, 10) : undefined,
      tradeId,
      unionDispatchType,
    });
  }
}
