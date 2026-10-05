import { Module } from '@nestjs/common';
import { SiteAccessController } from './site-access.controller';
import { SiteAccessService } from './site-access.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SiteAccessController],
  providers: [SiteAccessService, PrismaService],
  exports: [SiteAccessService],
})
export class SiteAccessModule {}
