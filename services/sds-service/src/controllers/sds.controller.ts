import type { Request, Response, NextFunction } from 'express';
import { sdsService } from '../services/sds.service';
import { assertCompanyScope } from '../middleware/auth.middleware';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const sdsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const doc = await sdsService.createDocument({
        companyId,
        productName: req.body.product_name ?? req.body.productName,
        manufacturer: req.body.manufacturer,
        casNumber: req.body.cas_number ?? req.body.casNumber,
        whmisClassification: req.body.whmis_classification ?? req.body.whmisClassification,
        ppeRequirements: req.body.ppe_requirements ?? req.body.ppeRequirements,
        firstAid: req.body.first_aid ?? req.body.firstAid,
        handlingStorage: req.body.handling_storage ?? req.body.handlingStorage,
        expiryDate: req.body.expiry_date ?? req.body.expiryDate,
        version: req.body.version,
        filePath: req.body.file_path ?? req.body.filePath,
        zoneId: req.body.zone_id ?? req.body.zoneId,
        requiredForZone: req.body.required_for_zone ?? req.body.requiredForZone,
      });

      return res.status(201).json(doc);
    } catch (e) {
      next(e);
    }
  },

  async acknowledge(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.body.company_id ?? req.body.companyId) as string;
      assertCompanyScope(req, companyId);

      const ack = await sdsService.acknowledge({
        companyId,
        sdsId: routeParam(req.params.id),
        workerId: req.body.worker_id ?? req.body.workerId ?? req.userId!,
      });

      return res.status(201).json(ack);
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const doc = await sdsService.getDocument(routeParam(req.params.id), companyId);
      return res.json(doc);
    } catch (e) {
      next(e);
    }
  },

  async getWorker(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      assertCompanyScope(req, companyId);

      const summary = await sdsService.getWorkerSds(
        routeParam(req.params.id),
        companyId,
        req.query.zone_id as string | undefined,
      );

      return res.json(summary);
    } catch (e) {
      next(e);
    }
  },
};
