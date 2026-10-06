import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PmPredictiveSafetyAnalyticsController } from './pm-predictive-safety-analytics.controller';
import { PmPredictiveSafetyAnalyticsService } from './pm-predictive-safety-analytics.service';
import { PredictiveFeatureExtractionService } from './feature-extraction.service';
import { PredictiveMlPipelineService } from './ml-pipeline.service';
import { PredictiveAlertsService } from './predictive-alerts.service';
import { RiskScoringModelEngine } from './engines/risk-scoring-model.engine';
import { WeeklyForecastEngine } from './engines/weekly-forecast.engine';
import { PmPredictiveSafetyAnalyticsScheduler } from './pm-predictive-safety-analytics.scheduler';
import { AnalyticsSafetyCultureEngineService } from './analytics-safety-culture-engine.service';

@Module({
  imports: [PrismaModule, NotificationsModule, ScheduleModule],
  controllers: [PmPredictiveSafetyAnalyticsController],
  providers: [
    PmPredictiveSafetyAnalyticsService,
    PredictiveFeatureExtractionService,
    PredictiveMlPipelineService,
    PredictiveAlertsService,
    RiskScoringModelEngine,
    WeeklyForecastEngine,
    PmPredictiveSafetyAnalyticsScheduler,
    AnalyticsSafetyCultureEngineService,
  ],
  exports: [PmPredictiveSafetyAnalyticsService],
})
export class PmPredictiveSafetyAnalyticsModule {}
