import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { AdminSubscriptionsService } from './admin-subscriptions.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Controller(`${API_V1_PREFIX}/admin/subscriptions`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminSubscriptionsController {
  constructor(private readonly subscriptions: AdminSubscriptionsService) {}

  @Get()
  list() {
    return this.subscriptions.listSubscriptions();
  }

  @Get('summary')
  summary() {
    return this.subscriptions.getSummary();
  }

  @Get('map')
  map() {
    return this.subscriptions.getMap();
  }

  @Get('growth')
  growth() {
    return this.subscriptions.getGrowth();
  }

  @Post('update')
  update(
    @Body() body: UpdateSubscriptionDto,
    @Req() req: { user: { id: number } },
  ) {
    return this.subscriptions.updateSubscription(body, req.user.id);
  }
}
