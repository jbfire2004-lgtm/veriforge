import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { AssignmentService } from './assignment.service';

@Controller('assignments')
export class AssignmentController {
  constructor(private readonly assign: AssignmentService) {}

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
    return this.assign.end(id);
  }

  @Get('worker/:id/active')
  activeForWorker(@Param('id', ParseIntPipe) id: number) {
    return this.assign.activeForWorker(id);
  }

  @Get('worker/:id/history')
  historyForWorker(@Param('id', ParseIntPipe) id: number) {
    return this.assign.historyForWorker(id);
  }
}
