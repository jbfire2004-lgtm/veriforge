import { Injectable } from '@nestjs/common';
import { FeedSource } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UnionDispatchIntegration {
  constructor(private readonly prisma: PrismaService) {}

  async syncToFeed(scope: {
    unionHallId?: number;
    companyId?: number;
  }): Promise<number> {
    const dispatches = await this.prisma.unionDispatch.findMany({
      where: {
        recalledAt: null,
        ...(scope.unionHallId ? { unionHallId: scope.unionHallId } : {}),
        ...(scope.companyId ? { companyId: scope.companyId } : {}),
      },
      orderBy: { dispatchedAt: 'desc' },
      take: 20,
      include: {
        worker: true,
        company: true,
        unionHall: true,
      },
    });

    let count = 0;
    for (const d of dispatches) {
      const externalId = `dispatch-${d.id}`;
      await this.prisma.feedItem.upsert({
        where: {
          source_externalId: {
            source: FeedSource.UNION_DISPATCH,
            externalId,
          },
        },
        create: {
          source: FeedSource.UNION_DISPATCH,
          externalId,
          title: `${d.worker.firstName} ${d.worker.lastName} dispatched to ${d.company.name}`,
          summary: d.notes ?? `Union hall: ${d.unionHall.name}`,
          publishedAt: d.dispatchedAt,
          companyId: d.companyId,
          unionHallId: d.unionHallId,
          workerId: d.workerId,
          url: `/union-hall/dispatches/${d.id}`,
          metadata: { dispatchId: d.id },
          rankScore: 1,
        },
        update: {
          publishedAt: d.dispatchedAt,
          summary: d.notes ?? undefined,
        },
      });
      count += 1;
    }
    return count;
  }
}
