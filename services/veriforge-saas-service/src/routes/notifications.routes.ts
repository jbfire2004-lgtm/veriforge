import { Router } from 'express';
import { body } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { handleValidation } from '../middleware/error-handler';
import { requireAuth, refreshPermissions } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification.service';
import { emailService } from '../services/email.service';
import { BadRequestError } from '../utils/errors';

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth, refreshPermissions());

/** GET /notifications — current user + org inbox */
notificationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.orgId!;
    const userId = req.userId!;
    const skip = Number(req.query.skip ?? 0) || 0;
    const take = Number(req.query.take ?? 50) || 50;
    const unreadOnly = String(req.query.unreadOnly ?? '') === 'true';

    const data = await notificationService.getUserNotifications(userId, {
      orgId,
      skip,
      take,
      unreadOnly,
    });
    res.json(data);
  }),
);

/** GET /notifications/org — org-wide inbox */
notificationsRouter.get(
  '/org',
  asyncHandler(async (req, res) => {
    const orgId = req.orgId!;
    const skip = Number(req.query.skip ?? 0) || 0;
    const take = Number(req.query.take ?? 50) || 50;
    const unreadOnly = String(req.query.unreadOnly ?? '') === 'true';
    const data = await notificationService.getOrgNotifications(orgId, {
      skip,
      take,
      unreadOnly,
    });
    res.json(data);
  }),
);

/** POST /notifications/read — mark one or more as read */
notificationsRouter.post(
  '/read',
  body('ids').isArray({ min: 1 }),
  body('ids.*').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const ids = req.body.ids as string[];
    const result = await notificationService.markAsRead(ids, {
      orgId: req.orgId!,
      userId: req.userId!,
    });
    res.json(result);
  }),
);

/** POST /notifications/read-all */
notificationsRouter.post(
  '/read-all',
  asyncHandler(async (req, res) => {
    const result = await notificationService.markAllRead({
      orgId: req.orgId!,
      userId: req.userId!,
    });
    res.json(result);
  }),
);

/** POST /notifications/sendEmail — queue an email (org operators) */
notificationsRouter.post(
  '/sendEmail',
  body('to').isEmail(),
  body('subject').isString().isLength({ min: 1, max: 200 }),
  body('body').isString().isLength({ min: 1, max: 20_000 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const row = await emailService.queueEmail({
      to: String(req.body.to),
      subject: String(req.body.subject),
      body: String(req.body.body),
      orgId: req.orgId!,
    });
    if (!row) throw new BadRequestError('Failed to queue email');
    res.status(201).json({ queued: true, id: row.id });
  }),
);
