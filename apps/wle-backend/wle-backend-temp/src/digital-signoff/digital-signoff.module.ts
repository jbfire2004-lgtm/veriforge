import { Module } from '@nestjs/common';
import { DigitalSignoffController } from './digital-signoff.controller';
import { DigitalSignoffService } from './digital-signoff.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DigitalSignoffController],
  providers: [DigitalSignoffService, PrismaService],
  exports: [DigitalSignoffService],
})
export class DigitalSignoffModule {}
