import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { SAFETY_NOTIFICATION_PREFIXES } from './safety-hub.constants';

@Injectable()
export class PmSafetyHubNotificationsService {
  constructor(private readonly notifications: NotificationsService) {}

  async listSafetyNotifications(
    userId: number,
    opts?: { unreadOnly?: boolean; take?: number },
  ) {
    const all = await this.notifications.listForUser(userId, {
      unreadOnly: opts?.unreadOnly,
      take: opts?.take ?? 100,
    });

    return all.filter((n) => {
      const type = (n.type ?? '').toLowerCase();
      return SAFETY_NOTIFICATION_PREFIXES.some((p) => type.includes(p));
    });
  }

  async unreadCount(userId: number) {
    const items = await this.listSafetyNotifications(userId, {
      unreadOnly: true,
      take: 200,
    });
    return { count: items.length };
  }
}
