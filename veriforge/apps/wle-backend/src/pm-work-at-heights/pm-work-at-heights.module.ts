import { Module } from '@nestjs/common';
import { FallClearanceModule } from '../fall-clearance/fall-clearance.module';
import { PmWorkAtHeightsController } from './pm-work-at-heights.controller';
import { PmWorkAtHeightsService } from './pm-work-at-heights.service';

@Module({
  imports: [FallClearanceModule],
  controllers: [PmWorkAtHeightsController],
  providers: [PmWorkAtHeightsService],
  exports: [PmWorkAtHeightsService],
})
export class PmWorkAtHeightsModule {}
