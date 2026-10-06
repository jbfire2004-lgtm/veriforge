import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

@Module({
  controllers: [SitesController],
  providers: [SitesService, PrismaService],
  exports: [SitesService],
})
export class SitesModule {}
