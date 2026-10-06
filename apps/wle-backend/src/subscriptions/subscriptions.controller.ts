import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { API_V1_PREFIX } from '../config/routes';
import { SubscriptionsService } from './subscriptions.service';

@Controller(`${API_V1_PREFIX}/subscriptions`)
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Public()
  @Get('catalog')
  getCatalog() {
    return this.subscriptions.getCatalog();
  }

  @Public()
  @Get('tiers')
  listTiers() {
    return this.subscriptions.listTiers();
  }

  @Public()
  @Get('features')
  listFeatures() {
    return this.subscriptions.listFeatures();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMySubscription(@Req() req: { user: { id: number } }) {
    return this.subscriptions.getCurrentSubscription(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('purchase')
  purchase(
    @Req() req: { user: { id: number } },
    @Body() body: { planKey: string; addonKeys?: string[] },
  ) {
    return this.subscriptions.purchaseSubscription(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('addons')
  purchaseAddons(
    @Req() req: { user: { id: number } },
    @Body() body: { addonKeys: string[] },
  ) {
    return this.subscriptions.purchaseAddons(req.user.id, body);
  }
}
