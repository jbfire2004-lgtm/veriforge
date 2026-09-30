import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { privacyService } from '../services/privacy.service';

export const privacyRouter = Router();

privacyRouter.use(requireAuth);

/** GET /privacy/export — DSAR data export for the authenticated subject */
privacyRouter.get('/export', async (req, res, next) => {
  try {
    const userId = req.userId!;
    const data = await privacyService.exportSubject(userId, userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/** DELETE /privacy/me — scramble PII and disable account (owners blocked) */
privacyRouter.delete('/me', async (req, res, next) => {
  try {
    const userId = req.userId!;
    const data = await privacyService.deleteSubject(userId, userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});
