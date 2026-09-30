import type { Request, Response, NextFunction } from 'express';
import { ModelVersionStatus } from '@prisma/client';
import { assertCompanyScope } from '../middleware/auth.middleware';
import { versionService } from '../services/version.service';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const versionController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      assertCompanyScope(req, companyId);
      const version = await versionService.register({
        companyId,
        modelId: req.body.model_id,
        version: req.body.version,
        createdBy: req.userId!,
        trainingJobId: req.body.training_job_id,
        artifactUri: req.body.artifact_uri,
        metadata: req.body.metadata,
      });
      return res.status(201).json(version);
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);
      const versions = await versionService.list(
        companyId,
        req.query.model_id as string | undefined,
        req.query.status as ModelVersionStatus | undefined,
      );
      return res.json({ versions });
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);
      const version = await versionService.getById(routeParam(req.params.id), companyId);
      return res.json(version);
    } catch (e) {
      next(e);
    }
  },

  async promote(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      assertCompanyScope(req, companyId);
      const version = await versionService.promote(
        req.body.version_id,
        companyId,
        req.userId!,
        req.body.reason,
      );
      return res.json(version);
    } catch (e) {
      next(e);
    }
  },

  async rollback(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      assertCompanyScope(req, companyId);
      const version = await versionService.rollback(
        req.body.version_id,
        companyId,
        req.userId!,
        req.body.reason,
      );
      return res.json(version);
    } catch (e) {
      next(e);
    }
  },

  async registerFromTraining(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      assertCompanyScope(req, companyId);
      const token = req.headers.authorization?.slice(7) ?? '';
      const version = await versionService.registerFromTraining({
        companyId,
        modelId: req.body.model_id,
        version: req.body.version,
        trainingJobId: req.body.training_job_id,
        createdBy: req.userId!,
        token,
      });
      return res.status(201).json(version);
    } catch (e) {
      next(e);
    }
  },
};
