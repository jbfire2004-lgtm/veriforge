import { PrismaClient } from '@prisma/client';
import { SeoEngineService } from './seo-engine.service';
import { SeoIndexService } from './seo-index.service';
import { SeoMetadataService } from './seo-metadata.service';

export function createSeoEngineService(prisma: PrismaClient): SeoEngineService {
  const index = new SeoIndexService(prisma as never);
  const metadata = new SeoMetadataService(prisma as never);
  return new SeoEngineService(index, metadata);
}
