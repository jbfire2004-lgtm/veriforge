import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private queue: Array<{
    id: string;
    title: string;
    message: string;
    category: string;
    forgeStatus: 'pending' | 'forged' | 'verified' | 'failed';
    createdAt: string;
  }> = [];

  listQueue() {
    return [...this.queue];
  }

  enqueue(input: {
    title: string;
    message: string;
    category: string;
    forgeStatus?: 'pending' | 'forged' | 'verified' | 'failed';
  }) {
    const item = {
      id: `notif-${Date.now()}`,
      title: input.title,
      message: input.message,
      category: input.category,
      forgeStatus: input.forgeStatus ?? 'pending',
      createdAt: new Date().toISOString(),
    };
    this.queue.unshift(item);
    return item;
  }
}
