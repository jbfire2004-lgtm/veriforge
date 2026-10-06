import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { WorkerAssignmentService } from './worker-assignment.service';

@Controller('worker-assignments')
export class WorkerAssignmentController {
  constructor(private readonly assign: WorkerAssignmentService) {}

  @Post()
  assignWorker(
    @Body()
    body: {
      workerId: number;
      equipmentId?: number;
      siteId?: number;
      companyId?: number;
      assignedBy?: number;
    },
  ) {
    return this.assign.assign(body);
  }

  @Patch(':id/end')
  end(@Param('id', ParseIntPipe) id: number) {
    return this.assign.endAssignment(id);
  }

  @Get('worker/:id/active')
  activeForWorker(@Param('id', ParseIntPipe) id: number) {
    return this.assign.activeForWorker(id);
  }

  @Get('worker/:id/history')
  historyForWorker(@Param('id', ParseIntPipe) id: number) {
    return this.assign.historyForWorker(id);
  }

  @Get('equipment/:id')
  activeForEquipment(@Param('id', ParseIntPipe) id: number) {
    return this.assign.activeForEquipment(id);
  }

  @Get('site/:id')
  activeForSite(@Param('id', ParseIntPipe) id: number) {
    return this.assign.activeForSite(id);
  }

  @Get('company/:id')
  activeForCompany(@Param('id', ParseIntPipe) id: number) {
    return this.assign.activeForCompany(id);
  }
}
