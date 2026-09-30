import type { Request, Response, NextFunction } from 'express';
import { TrainingJobStatus } from '@prisma/client';
import { assertCompanyScope } from '../middleware/auth.middleware';
import { trainingService } from '../services/training.service';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const trainingController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      assertCompanyScope(req, companyId);
      const job = await trainingService.create({
        companyId,
        name: req.body.name,
        modelType: req.body.model_type,
        config: req.body.config,
        createdBy: req.userId!,
        datasets: req.body.datasets,
      });
      return res.status(201).json(job);
    } catch (e) { next(e); }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);
      const status = req.query.status as TrainingJobStatus | undefined;
      const jobs = await trainingService.list(companyId, status);
      return res.json({ jobs });
    } catch (e) { next(e); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);
      const job = await trainingService.getById(routeParam(req.params.id), companyId);
      return res.json(job);
    } catch (e) { next(e); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      assertCompanyScope(req, companyId);
      const job = await trainingService.update(routeParam(req.params.id), companyId, {
        name: req.body.name,
        modelType: req.body.model_type,
        config: req.body.config,
      });
      return res.json(job);
    } catch (e) { next(e); }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      assertCompanyScope(req, companyId);
      const job = await trainingService.updateStatus(routeParam(req.params.id), companyId, req.body.status);
      return res.json(job);
    } catch (e) { next(e); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);
      await trainingService.delete(routeParam(req.params.id), companyId);
      return res.status(204).send();
    } catch (e) { next(e); }
  },

  async addArtifact(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      assertCompanyScope(req, companyId);
      const artifact = await trainingService.addArtifact(routeParam(req.params.id), companyId, {
        artifactUri: req.body.artifact_uri,
        artifactType: req.body.artifact_type,
        checksum: req.body.checksum,
        sizeBytes: req.body.size_bytes,
        metadata: req.body.metadata,
      });
      return res.status(201).json(artifact);
    } catch (e) { next(e); }
  },

  async handleEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      assertCompanyScope(req, companyId);
      const result = await trainingService.handleIngestionEvent({
        companyId,
        eventType: req.body.event_type,
        payload: req.body.payload ?? {},
        createdBy: req.userId!,
        autoCreateJob: req.body.auto_create_job,
      });
      return res.status(202).json(result);
    } catch (e) { next(e); }
  },
};
