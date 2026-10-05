import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.ADMIN,
  UserRole.SUPERVISOR,
  UserRole.PROJECT_MANAGER,
  UserRole.WORKER,
)
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  findAll() {
    return this.equipmentService.findAll();
  }

  @Get('company/:companyId')
  findByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.equipmentService.findByCompany(companyId);
  }

  // More specific than `:id` — register first
  @Get(':id/profile')
  profile(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.getProfile(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  create(@Body() dto: CreateEquipmentDto) {
    return this.equipmentService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.PROJECT_MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.equipmentService.remove(id);
  }
}
