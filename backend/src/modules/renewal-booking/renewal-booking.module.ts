import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../prisma/prisma.module';
import { VendorIntegrationModule } from '../vendor-integration/vendor-integration.module';
import { BookingController } from './booking.controller';
import { RenewalDetectionService } from './services/renewal-detection.service';
import { BookingAggregatorService } from './services/booking-aggregator.service';
import { BookingWorkflowService } from './services/booking-workflow.service';
import { CertificationService } from './services/certification.service';
import { NotificationService } from './services/notification.service';
import {
  NFTService,
  NftReissueService,
  WalletService,
} from './services/nft-reissue.service';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), VendorIntegrationModule],
  controllers: [BookingController],
  providers: [
    RenewalDetectionService,
    BookingAggregatorService,
    BookingWorkflowService,
    CertificationService,
    NotificationService,
    NftReissueService,
    NFTService,
    WalletService,
  ],
  exports: [
    RenewalDetectionService,
    BookingAggregatorService,
    BookingWorkflowService,
    NftReissueService,
  ],
})
export class RenewalBookingModule {}
