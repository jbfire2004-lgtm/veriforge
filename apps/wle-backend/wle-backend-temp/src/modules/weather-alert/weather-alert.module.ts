import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from '../../notifications/notifications.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserLocationResolverService } from './user-location-resolver.service';
import { WeatherAlertController } from './weather-alert.controller';
import { WeatherAlertRepository } from './weather-alert.repository';
import { WeatherAlertScheduler } from './weather-alert.scheduler';
import { WeatherAlertService } from './weather-alert.service';
import { WeatherCapFetcherService } from './weather-cap-fetcher.service';
import { WeatherCapParserService } from './weather-cap-parser.service';
import { WeatherZoneMatcherService } from './weather-zone-matcher.service';

@Module({
  imports: [ScheduleModule, PrismaModule, NotificationsModule],
  controllers: [WeatherAlertController],
  providers: [
    WeatherAlertService,
    WeatherAlertRepository,
    WeatherAlertScheduler,
    WeatherCapFetcherService,
    WeatherCapParserService,
    UserLocationResolverService,
    WeatherZoneMatcherService,
  ],
  exports: [WeatherAlertService],
})
export class WeatherAlertModule {}
