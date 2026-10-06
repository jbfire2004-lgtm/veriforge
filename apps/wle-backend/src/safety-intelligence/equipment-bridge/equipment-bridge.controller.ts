import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { EquipmentBridgeService } from './equipment-bridge.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/safety-intelligence/equipment`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class EquipmentBridgeController {
  constructor(private readonly bridge: EquipmentBridgeService) {}

  @Post('inspections/:inspectionId/emit-cail')
  async emit(
    @Param('inspectionId') inspectionId: string,
    @Query('projectId') projectId: string | undefined,
    @Req() req: { user: { id: number } },
  ) {
    return this.bridge.emitFromInspection(
      parseInt(inspectionId, 10),
      req.user.id,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get(':equipmentId/cail')
  async listCail(@Param('equipmentId') equipmentId: string) {
    return this.bridge.listForEquipment(parseInt(equipmentId, 10));
  }
}
