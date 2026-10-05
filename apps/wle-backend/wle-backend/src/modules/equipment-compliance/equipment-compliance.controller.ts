import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { COMPANY_ADMIN_ROLES, SUPERVISOR_ROLES } from '../vera-core/roles';
import { EquipmentComplianceService } from './equipment-compliance.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/equipment-compliance`)
export class EquipmentComplianceController {
  constructor(private readonly compliance: EquipmentComplianceService) {}

  @Get('dashboard')
  @Roles(...COMPANY_ADMIN_ROLES, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  dashboard(@Query('companyId') companyId?: string) {
    return this.compliance.dashboard(companyId ? Number(companyId) : undefined);
  }

  @Post('equipment/:equipmentId/recalculate')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.OK)
  recalculate(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.compliance.recalculate(equipmentId, {
      trigger: 'MANUAL',
      notes: 'Manual compliance recalculation',
    });
  }
}
