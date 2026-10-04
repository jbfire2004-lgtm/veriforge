import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import {
  COMPANY_ADMIN_ROLES,
  STAFF_ROLES,
  SUPERVISOR_ROLES,
} from '../vera-core/roles';
import {
  AssignToProjectDto,
  AssignToWorkerDto,
  CreatePpeDto,
  CreateToolDto,
  PpeInspectDto,
  ToolInspectDto,
  UpdateToolDto,
} from './dto/tools-ppe.dto';
import { ToolsPpeCoreService } from './tools-ppe-core.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/tools-ppe`)
export class ToolsPpeCoreController {
  constructor(private readonly toolsPpe: ToolsPpeCoreService) {}

  @Get('dashboard')
  @Roles(...SUPERVISOR_ROLES)
  dashboard(@Query('companyId') companyId?: string) {
    return this.toolsPpe.dashboard(companyId ? Number(companyId) : undefined);
  }

  @Post('ppe/process-expiry')
  @Roles(...COMPANY_ADMIN_ROLES)
  @HttpCode(HttpStatus.OK)
  processExpiry(@Query('companyId') companyId?: string) {
    return this.toolsPpe.processPpeExpiry(
      companyId ? Number(companyId) : undefined,
    );
  }

  @Get('tools')
  @Roles(...STAFF_ROLES)
  listTools(@Query('companyId') companyId?: string) {
    return this.toolsPpe.listTools(companyId ? Number(companyId) : undefined);
  }

  @Post('tools')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  createTool(@Body() dto: CreateToolDto) {
    return this.toolsPpe.createTool(dto);
  }

  @Get('tools/:id')
  @Roles(...STAFF_ROLES)
  getTool(@Param('id', ParseIntPipe) id: number) {
    return this.toolsPpe.getTool(id);
  }

  @Patch('tools/:id')
  @Roles(...SUPERVISOR_ROLES)
  updateTool(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateToolDto,
  ) {
    return this.toolsPpe.updateTool(id, dto);
  }

  @Post('tools/:id/inspect')
  @Roles(...SUPERVISOR_ROLES, UserRole.WORKER)
  @HttpCode(HttpStatus.CREATED)
  inspectTool(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ToolInspectDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.toolsPpe.inspectTool(id, dto, req.user.id);
  }

  @Post('tools/:id/assign-worker')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  assignToolWorker(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignToWorkerDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.toolsPpe.assignToolToWorker(id, dto, req.user.id);
  }

  @Post('tools/:id/assign-project')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  assignToolProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignToProjectDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.toolsPpe.assignToolToProject(id, dto, req.user.id);
  }

  @Post('tools/:id/return')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.OK)
  returnTool(@Param('id', ParseIntPipe) id: number) {
    return this.toolsPpe.returnTool(id);
  }

  @Get('ppe')
  @Roles(...STAFF_ROLES)
  listPpe(@Query('companyId') companyId?: string) {
    return this.toolsPpe.listPpe(companyId ? Number(companyId) : undefined);
  }

  @Post('ppe')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  createPpe(@Body() dto: CreatePpeDto) {
    return this.toolsPpe.createPpe(dto);
  }

  @Get('ppe/:id')
  @Roles(...STAFF_ROLES)
  getPpe(@Param('id', ParseIntPipe) id: number) {
    return this.toolsPpe.getPpe(id);
  }

  @Post('ppe/:id/inspect')
  @Roles(...SUPERVISOR_ROLES, UserRole.WORKER)
  @HttpCode(HttpStatus.CREATED)
  inspectPpe(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PpeInspectDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.toolsPpe.inspectPpe(id, dto, req.user.id);
  }

  @Post('ppe/:id/assign-worker')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  assignPpeWorker(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignToWorkerDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.toolsPpe.assignPpeToWorker(id, dto, req.user.id);
  }

  @Post('ppe/:id/assign-project')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  assignPpeProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignToProjectDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.toolsPpe.assignPpeToProject(id, dto, req.user.id);
  }

  @Post('ppe/:id/return')
  @Roles(...SUPERVISOR_ROLES)
  @HttpCode(HttpStatus.OK)
  returnPpe(@Param('id', ParseIntPipe) id: number) {
    return this.toolsPpe.returnPpe(id);
  }

  @Get('workers/:workerId/assignments')
  @Roles(...STAFF_ROLES)
  workerAssignments(@Param('workerId', ParseIntPipe) workerId: number) {
    return this.toolsPpe.getWorkerToolsPpe(workerId);
  }
}
