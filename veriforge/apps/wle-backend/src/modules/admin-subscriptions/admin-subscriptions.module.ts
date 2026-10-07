import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminSubscriptionsController } from './admin-subscriptions.controller';
import { AdminSubscriptionsService } from './admin-subscriptions.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminSubscriptionsController],
  providers: [AdminSubscriptionsService],
  exports: [AdminSubscriptionsService],
})
export class AdminSubscriptionsModule {}
