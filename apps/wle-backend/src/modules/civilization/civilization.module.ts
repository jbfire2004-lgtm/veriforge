import { Module } from '@nestjs/common';
import { CivilizationController } from './civilization.controller';
import { CivilizationService } from './civilization.service';
import { DigitalTwinModule } from '../digital-twin/digital-twin.module';
import { InterstellarModule } from '../interstellar/interstellar.module';

@Module({
  imports: [DigitalTwinModule, InterstellarModule],
  controllers: [CivilizationController],
  providers: [CivilizationService],
  exports: [CivilizationService],
})
export class CivilizationModule {}
