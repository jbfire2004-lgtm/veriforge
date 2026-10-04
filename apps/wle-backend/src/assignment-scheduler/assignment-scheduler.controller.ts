import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AssignmentSchedulerService } from './assignment-scheduler.service';

@Controller('assignment-scheduler')
export class AssignmentSchedulerController {
  constructor(private readonly scheduler: AssignmentSchedulerService) {}

  @Post()
  schedule(
    @Body()
    body: {
      workerId: number;
      equipmentId?: number;
      siteId?: number;
      companyId?: number;
      assignedBy?: number;
      startAt: Date;
      endAt?: Date;
    },
  ) {
    return this.scheduler.schedule(body);
  }

  @Get('calendar/:workerId')
  calendar(@Param('workerId', ParseIntPipe) workerId: number) {
    return this.scheduler.calendar(workerId);
  }
}
