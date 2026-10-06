import { PrismaClient } from '@prisma/client';
import { EmailService } from '../../notifications/channels/email.service';
import { SmsService } from '../../notifications/channels/sms.service';
import { PushService } from '../../notifications/channels/push.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { SocialActivityService } from './social-activity.service';
import { SocialNotificationService } from './social-notification.service';
import { SocialService } from './social.service';

export function createSocialService(prisma: PrismaClient): SocialService {
  const notifications = new NotificationsService(
    prisma as never,
    new EmailService(),
    new SmsService(),
    new PushService(),
  );
  const activity = new SocialActivityService(prisma as never);
  const notify = new SocialNotificationService(prisma as never, notifications);
  return new SocialService(prisma as never, activity, notify);
}
