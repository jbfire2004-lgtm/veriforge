import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { AdoptionAnalyticsService } from './adoption-analytics.service';
import { FeedbackService } from './feedback.service';
import { UpdateFeedbackStatusDto } from './dto/update-feedback-status.dto';

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdoptionAnalyticsAdminController {
  constructor(
    private readonly analytics: AdoptionAnalyticsService,
    private readonly feedback: FeedbackService,
  ) {}

  @Get('adoption-map')
  getAdoptionMap() {
    return this.analytics.getAdoptionMap();
  }

  @Get('growth-stats')
  getGrowthStats() {
    return this.analytics.getGrowthStats();
  }

  @Get('module-usage')
  getModuleUsage() {
    return this.analytics.getModuleUsage();
  }

  @Get('feedback')
  listFeedback() {
    return this.feedback.listForAdmin();
  }

  @Patch('feedback/:id/status')
  updateFeedbackStatus(
    @Param('id') id: string,
    @Body() body: UpdateFeedbackStatusDto,
  ) {
    return this.feedback.updateStatus(
      parseInt(id, 10),
      body.status,
      body.internalNotes,
    );
  }
}
