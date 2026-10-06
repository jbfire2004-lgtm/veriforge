import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { AssignmentRulesService } from './assignment-rules.service';

@Controller('assignment-rules')
export class AssignmentRulesController {
  constructor(private readonly rules: AssignmentRulesService) {}

  @Post('equipment')
  setEquipmentRequirement(
    @Body() body: { equipmentId: number; certificationId: number },
  ) {
    return this.rules.setEquipmentRequirement(
      body.equipmentId,
      body.certificationId,
    );
  }

  @Delete('equipment/:id')
  removeEquipmentRequirement(@Param('id', ParseIntPipe) id: number) {
    return this.rules.removeEquipmentRequirement(id);
  }

  @Get('equipment/:equipmentId')
  listEquipmentRequirements(
    @Param('equipmentId', ParseIntPipe) equipmentId: number,
  ) {
    return this.rules.listEquipmentRequirements(equipmentId);
  }

  @Post('ban')
  banWorkerFromSite(@Body() body: { workerId: number; siteId: number }) {
    return this.rules.banWorkerFromSite(body.workerId, body.siteId);
  }

  @Post('unban')
  unbanWorkerFromSite(@Body() body: { workerId: number; siteId: number }) {
    return this.rules.unbanWorkerFromSite(body.workerId, body.siteId);
  }
}
