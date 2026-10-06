import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreSiteRiskController } from './core-site-risk.controller';
import { CoreSiteRiskService } from './core-site-risk.service';

@Module({
  controllers: [CoreSiteRiskController],
  providers: [CoreSiteRiskService, PrismaService],
  exports: [CoreSiteRiskService],
})
export class CoreSiteRiskModule {}
