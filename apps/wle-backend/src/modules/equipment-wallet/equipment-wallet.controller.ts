import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { STAFF_ROLES } from '../vera-core/roles';
import { EquipmentWalletService } from './equipment-wallet.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/equipment/:equipmentId/wallet`)
export class EquipmentWalletController {
  constructor(private readonly wallet: EquipmentWalletService) {}

  @Get()
  @Roles(...STAFF_ROLES)
  full(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.wallet.getFullWallet(equipmentId);
  }

  @Get('qr')
  @Roles(...STAFF_ROLES)
  qr(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.wallet.getQr(equipmentId);
  }

  @Get('inspections')
  @Roles(...STAFF_ROLES)
  inspections(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.wallet.getInspectionHistory(equipmentId);
  }

  @Get('competency-requirements')
  @Roles(...STAFF_ROLES)
  competency(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.wallet.getCompetencyRequirements(equipmentId);
  }

  @Get('assigned-workers')
  @Roles(...STAFF_ROLES)
  workers(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.wallet.getAssignedWorkers(equipmentId);
  }

  @Get('assigned-projects')
  @Roles(...STAFF_ROLES)
  projects(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.wallet.getAssignedProjects(equipmentId);
  }

  @Get('compliance')
  @Roles(...STAFF_ROLES)
  compliance(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.wallet.getComplianceStatus(equipmentId);
  }

  @Get('maintenance')
  @Roles(...STAFF_ROLES)
  maintenance(@Param('equipmentId', ParseIntPipe) equipmentId: number) {
    return this.wallet.getMaintenanceCalibration(equipmentId);
  }
}
