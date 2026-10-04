import { Controller, Get, UseGuards } from '@nestjs/common';
import { API_CONTRACT_REGISTRY } from '@vera/api-contract';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Roles } from '../../../auth/roles.decorator';
import { RolesGuard } from '../../../auth/roles.guard';
import { SUPER_ADMIN_ROLES } from '../../vera-core/roles';
import { API_V1_PREFIX } from '../../../config/routes';
import { ApiSuccess } from '../decorators/api-success.decorator';
import { apiOk } from '../responses/api-response';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/contracts`)
export class ContractsApiController {
  @Get()
  @Roles(...SUPER_ADMIN_ROLES)
  @ApiSuccess()
  list() {
    return apiOk(API_CONTRACT_REGISTRY, {
      count: API_CONTRACT_REGISTRY.length,
    });
  }
}
