import { Injectable } from '@nestjs/common';
import type { SeoSitemapIndex } from '@vera/api-contract';
import { SeoIndexService } from './seo-index.service';
import { SeoMetadataService } from './seo-metadata.service';

@Injectable()
export class SeoEngineService {
  constructor(
    private readonly index: SeoIndexService,
    private readonly metadata: SeoMetadataService,
  ) {}

  getSitemap(): Promise<SeoSitemapIndex> {
    return this.index.buildSitemap();
  }

  getSitemapXml(): Promise<string> {
    return this.index.buildSitemap().then((s) => this.index.toXml(s));
  }

  getMetadata = this.metadata.getMetadata.bind(this.metadata);
  getSchema = this.metadata.getSchema.bind(this.metadata);

  indexArticles = this.index.indexArticles.bind(this.index);
  indexJobs = this.index.indexJobs.bind(this.index);
  indexProfiles = this.index.indexProfiles.bind(this.index);
  indexQuestions = this.index.indexQuestions.bind(this.index);
}
