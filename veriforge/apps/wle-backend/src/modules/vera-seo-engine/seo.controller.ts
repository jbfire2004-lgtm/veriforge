import { Controller, Get, Query, Header } from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { SeoEngineService } from './seo-engine.service';
import type { SeoContentType } from '@vera/api-contract';

@Controller('api/v1/seo')
@Public()
export class SeoController {
  constructor(private readonly seo: SeoEngineService) {}

  @Get('sitemap')
  sitemap() {
    return this.seo.getSitemap();
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  sitemapXml() {
    return this.seo.getSitemapXml();
  }

  @Get('index/articles')
  indexArticles() {
    return this.seo.indexArticles();
  }

  @Get('index/jobs')
  indexJobs() {
    return this.seo.indexJobs();
  }

  @Get('index/profiles')
  indexProfiles() {
    return this.seo.indexProfiles();
  }

  @Get('index/questions')
  indexQuestions() {
    return this.seo.indexQuestions();
  }

  @Get('metadata')
  metadata(
    @Query('type') type: SeoContentType,
    @Query('slug') slug?: string,
    @Query('userId') userId?: string,
    @Query('workerId') workerId?: string,
  ) {
    return this.seo.getMetadata({
      type,
      slug,
      userId: userId ? parseInt(userId, 10) : undefined,
      workerId: workerId ? parseInt(workerId, 10) : undefined,
    });
  }

  @Get('schema')
  schema(
    @Query('type') type: SeoContentType,
    @Query('slug') slug?: string,
    @Query('userId') userId?: string,
    @Query('workerId') workerId?: string,
  ) {
    return this.seo.getSchema({
      type,
      slug,
      userId: userId ? parseInt(userId, 10) : undefined,
      workerId: workerId ? parseInt(workerId, 10) : undefined,
    });
  }
}
