import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { InactivationService } from './inactivation.service';

@Module({
  imports: [PrismaModule],
  providers: [InactivationService],
  exports: [InactivationService],
})
export class InactivationModule {}
