import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProviderController],
  providers: [ProviderService, PrismaService],
  exports: [ProviderService],
})
export class ProviderModule {}
