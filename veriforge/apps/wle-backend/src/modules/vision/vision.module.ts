import { Module } from '@nestjs/common';
import { VisionController } from './vision.controller';
import { VisionService } from './vision.service';
import { VisionEventHandler } from './handlers/vision-event.handler';
import { DomainEventBusModule } from '../api-platform/events/domain-event-bus.module';
@Module({
  imports: [DomainEventBusModule],
  controllers: [VisionController],
  providers: [VisionService, VisionEventHandler],
  exports: [VisionService],
})
export class VisionModule {}
