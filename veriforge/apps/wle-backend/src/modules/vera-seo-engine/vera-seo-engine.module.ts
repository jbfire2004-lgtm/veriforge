import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SeoController } from './seo.controller';
import { SeoEngineService } from './seo-engine.service';
import { SeoIndexService } from './seo-index.service';
import { SeoMetadataService } from './seo-metadata.service';

@Module({
  imports: [PrismaModule],
  controllers: [SeoController],
  providers: [SeoEngineService, SeoIndexService, SeoMetadataService],
  exports: [SeoEngineService],
})
export class VeraSeoEngineModule {}
