import type { Request, Response, NextFunction } from 'express';
import { trainingService } from '../services/training.service';
import { assertCompanyScope } from '../middleware/auth.middleware';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const trainingController = {
  async course(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const course = await trainingService.createCourse({
        companyId,
        name: req.body.name,
        category: req.body.category,
        provider: req.body.provider,
        durationHours: req.body.duration_hours ?? req.body.durationHours,
        expiryDays: req.body.expiry_days ?? req.body.expiryDays,
      });

      return res.status(201).json(course);
    } catch (e) {
      next(e);
    }
  },

  async matrix(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const matrix = await trainingService.upsertMatrix({
        companyId,
        role: req.body.role,
        requiredCourses: req.body.required_courses ?? req.body.requiredCourses ?? [],
      });

      return res.status(201).json(matrix);
    } catch (e) {
      next(e);
    }
  },

  async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const row = await trainingService.assign({
        companyId,
        workerId: req.body.worker_id ?? req.body.workerId,
        courseId: req.body.course_id ?? req.body.courseId,
      });

      return res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  },

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const row = await trainingService.complete({
        companyId,
        trainingId: req.body.training_id ?? req.body.trainingId,
        completionDate: req.body.completion_date ?? req.body.completionDate,
        competencyLevel: req.body.competency_level ?? req.body.competencyLevel,
        certificatePath: req.body.certificate_path ?? req.body.certificatePath,
        certificateDataUrl: req.body.certificate_data_url ?? req.body.certificateDataUrl,
        fileName: req.body.file_name ?? req.body.fileName,
      });

      return res.json(row);
    } catch (e) {
      next(e);
    }
  },

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const row = await trainingService.verify({
        companyId,
        trainingId: req.body.training_id ?? req.body.trainingId,
        verifiedBy: req.userId!,
        competencyLevel: req.body.competency_level ?? req.body.competencyLevel,
      });

      return res.json(row);
    } catch (e) {
      next(e);
    }
  },

  async getWorker(req: Request, res: Response, next: NextFunction) {
    try {
      const workerId = routeParam(req.params.id);
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const summary = await trainingService.getWorkerTraining(
        workerId,
        companyId,
        req.query.role as string | undefined,
      );

      return res.json(summary);
    } catch (e) {
      next(e);
    }
  },
};
