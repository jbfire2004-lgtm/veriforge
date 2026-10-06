import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { STAFF_ROLES } from '../../vera-core/roles';
import { V1_ROUTES } from '../../../config/routes.registry';
import { ComplianceApiService } from '../services/compliance-api.service';
import { ApiSuccess } from '../decorators/api-success.decorator';
import { ApiSuccessInterceptor } from '../interceptors/api-success.interceptor';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ApiSuccessInterceptor)
@Controller(V1_ROUTES.compliance)
export class ComplianceApiController {
  constructor(private readonly compliance: ComplianceApiService) {}

  @Get('worker/:id')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  worker(@Param('id', ParseIntPipe) id: number) {
    return this.compliance.workerCompliance(id);
  }

  @Get('equipment')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  equipment(@Query('companyId') companyId?: string) {
    return this.compliance.equipmentCompliance(
      companyId ? Number(companyId) : undefined,
    );
  }

  @Get('project/:id')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  project(
    @Param('id', ParseIntPipe) id: number,
    @Query('companyId') companyId?: string,
  ) {
    return this.compliance.projectReadiness(
      companyId ? Number(companyId) : undefined,
      id,
    );
  }

  @Get('training-expiry')
  @Roles(...STAFF_ROLES)
  @ApiSuccess()
  trainingExpiry(@Query('companyId') companyId?: string) {
    return this.compliance.trainingExpiry(
      companyId ? Number(companyId) : undefined,
    );
  }
}
