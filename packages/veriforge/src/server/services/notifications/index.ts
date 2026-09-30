import { logger } from "../../utils/logger";

export type NotificationKind =
  | "compliance.expiry_warning"
  | "compliance.expired"
  | "compliance.review_pending"
  | "trial.ending_soon";

export const notificationsService = {
  async enqueue(kind: NotificationKind, payload: Record<string, unknown>) {
    logger.info("notification.enqueue", { kind, ...payload });
    return { queued: true, kind };
  },
};
