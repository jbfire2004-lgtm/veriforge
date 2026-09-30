import type { Request, Response, NextFunction } from 'express';
import { attachmentService } from '../services/attachment.service';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function resolveCompanyId(req: Request): string {
  if (req.downloadToken) return req.downloadToken.companyId;
  return (req.query.company_id as string) || req.companyId!;
}

export const attachmentController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'file is required', code: 'VALIDATION_ERROR' });
      }

      const companyId = req.body.company_id as string;
      attachmentService.assertCompanyAccess(req.companyId!, companyId);

      const attachment = await attachmentService.upload({
        companyId,
        projectId: req.body.project_id as string | undefined,
        moduleType: req.body.module_type,
        moduleRecordId: req.body.module_record_id,
        uploadedBy: req.userId!,
        fileName: file.originalname,
        mimeType: file.mimetype,
        buffer: file.buffer,
      });

      return res.status(201).json(attachment);
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = resolveCompanyId(req);
      if (!req.downloadToken) {
        attachmentService.assertCompanyAccess(req.companyId!, companyId);
      }

      const presigned = req.query.presigned;
      const includeUrls =
        presigned === undefined || presigned === 'true' || presigned === '1';

      const attachment = await attachmentService.getMetadata(
        companyId,
        routeParam(req.params.id),
        includeUrls,
      );

      return res.json(attachment);
    } catch (e) {
      next(e);
    }
  },

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = resolveCompanyId(req);
      const id = routeParam(req.params.id);

      if (req.downloadToken) {
        if (req.downloadToken.attachmentId !== id) {
          return res.status(403).json({ error: 'Token mismatch', code: 'FORBIDDEN' });
        }
      } else {
        attachmentService.assertCompanyAccess(req.companyId!, companyId);
      }

      const { buffer, contentType, fileName } = await attachmentService.getFileStream(
        companyId,
        id,
        'file',
      );

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Cache-Control', 'private, no-store');
      return res.send(buffer);
    } catch (e) {
      next(e);
    }
  },

  async thumbnail(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = resolveCompanyId(req);
      const id = routeParam(req.params.id);

      if (req.downloadToken) {
        if (req.downloadToken.attachmentId !== id || req.downloadToken.kind !== 'thumbnail') {
          return res.status(403).json({ error: 'Token mismatch', code: 'FORBIDDEN' });
        }
      } else {
        attachmentService.assertCompanyAccess(req.companyId!, companyId);
      }

      const { buffer, contentType } = await attachmentService.getFileStream(
        companyId,
        id,
        'thumbnail',
      );

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'private, no-store');
      return res.send(buffer);
    } catch (e) {
      next(e);
    }
  },
};
