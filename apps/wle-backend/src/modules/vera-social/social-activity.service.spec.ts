import { SocialActivityService } from './social-activity.service';

describe('SocialActivityService', () => {
  it('logs activity via prisma', async () => {
    const create = jest.fn().mockResolvedValue({});
    const prisma = { socialActivityLog: { create } } as never;
    const svc = new SocialActivityService(prisma);
    await svc.log({
      actorUserId: 1,
      verb: 'LIKE',
      targetType: 'FEED_ITEM',
      targetId: 'item-1',
      feedItemId: 'item-1',
    });
    expect(create).toHaveBeenCalled();
  });
});
