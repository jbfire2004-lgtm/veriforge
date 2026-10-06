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
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserLocationSource } from '@prisma/client';
import { Public } from '../../auth/public.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { API_V1_PREFIX } from '../../config/routes';
import {
  UpdateWeatherSettingsDto,
  RecordUserLocationDto,
} from './dto/weather-alert.dto';
import { UserLocationResolverService } from './user-location-resolver.service';
import { WeatherAlertService } from './weather-alert.service';

type AuthReq = { user?: { id: number } };

function requireUserId(req: AuthReq): number {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedException('Authenticated user id missing');
  return userId;
}

@Controller(`${API_V1_PREFIX}/weather-alerts`)
export class WeatherAlertController {
  constructor(
    private readonly weatherAlerts: WeatherAlertService,
    private readonly locationResolver: UserLocationResolverService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('active')
  getActive(@Req() req: AuthReq) {
    return this.weatherAlerts.getActiveForUser(requireUserId(req));
  }

  @UseGuards(JwtAuthGuard)
  @Get('zone/:zoneId')
  getByZone(@Param('zoneId') zoneId: string) {
    return this.weatherAlerts.getActiveByZone(zoneId);
  }

  @Public()
  @Get('wallet/:workerId')
  getWallet(@Param('workerId', ParseIntPipe) workerId: number) {
    return this.weatherAlerts.getWalletAlertsForWorker(workerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('settings')
  getSettings(@Req() req: AuthReq) {
    return this.weatherAlerts.getSettings(requireUserId(req));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('settings')
  updateSettings(@Req() req: AuthReq, @Body() dto: UpdateWeatherSettingsDto) {
    return this.weatherAlerts.updateSettings(requireUserId(req), dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('location')
  async recordLocation(
    @Req() req: AuthReq,
    @Body() dto: RecordUserLocationDto,
  ) {
    const userId = requireUserId(req);
    const source =
      dto.source === 'gps'
        ? UserLocationSource.GPS
        : dto.source === 'worksite'
          ? UserLocationSource.WORKSITE
          : UserLocationSource.PRIMARY;
    await this.locationResolver.recordLocation(
      userId,
      dto.lat,
      dto.lng,
      source,
    );
    return { ok: true };
  }
}
