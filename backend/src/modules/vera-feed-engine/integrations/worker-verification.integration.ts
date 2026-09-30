import { Injectable } from '@nestjs/common';
import { VeraCoreFeedService } from '../vera-core-feed.service';

/** Batch sync worker verification outcomes into the feed. */
@Injectable()
export class WorkerVerificationIntegration {
  constructor(private readonly veraCoreFeed: VeraCoreFeedService) {}

  async syncToFeed(scope: {
    companyId?: number;
    workerId?: number;
  }): Promise<number> {
    const result = await this.veraCoreFeed.syncBatch(scope);
    return result.verification;
  }
}
