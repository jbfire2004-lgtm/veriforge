import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JhaFlhaModule } from '../jha-flha/jha-flha.module';
import { SifHecaModule } from '../sif-heca/sif-heca.module';
import { AcpModule } from '../acp/acp.module';
import { SafetySuiteController } from './safety-suite.controller';
import { SafetySuiteService } from './safety-suite.service';

@Module({
  imports: [PrismaModule, JhaFlhaModule, SifHecaModule, AcpModule],
  controllers: [SafetySuiteController],
  providers: [SafetySuiteService],
  exports: [SafetySuiteService],
})
export class SafetySuiteModule {}
