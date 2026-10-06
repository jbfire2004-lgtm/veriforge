import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { ExpertQaService } from './expert-qa.service';
import { ExpertProfileService } from './expert-profile.service';

@Controller('api/v1/admin/expert-qa')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
export class ExpertQaAdminController {
  constructor(
    private readonly qa: ExpertQaService,
    private readonly experts: ExpertProfileService,
  ) {}

  @Patch('questions/:id/moderate')
  moderateQuestion(@Param('id') id: string, @Body() body: { status: string }) {
    return this.qa.moderateQuestion(id, body.status);
  }

  @Patch('answers/:id/moderate')
  moderateAnswer(@Param('id') id: string, @Body() body: { status: string }) {
    return this.qa.moderateAnswer(id, body.status);
  }

  @Patch('experts/:userId/verify')
  verifyExpert(@Param('userId') userId: string) {
    return this.experts.verifyExpert(parseInt(userId, 10));
  }
}
