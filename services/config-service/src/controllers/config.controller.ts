import type { Request, Response, NextFunction } from 'express';
import { configService } from '../services/config.service';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function authPayload(req: Request) {
  return req.auth!;
}

export const configController = {
  async listNamespaces(_req: Request, res: Response, next: NextFunction) {
    try {
      const namespaces = await configService.listNamespaces();
      res.json({ namespaces });
    } catch (err) {
      next(err);
    }
  },

  async getEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await configService.getEntry(
        authPayload(req),
        routeParam(req.params.namespace),
        routeParam(req.params.key),
        req.query.company_id as string | undefined,
      );
      res.json(entry);
    } catch (err) {
      next(err);
    }
  },

  async listNamespace(req: Request, res: Response, next: NextFunction) {
    try {
      const namespace = routeParam(req.params.namespace);
      const entries = await configService.listNamespace(
        authPayload(req),
        namespace,
        req.query.company_id as string | undefined,
      );
      res.json({ namespace, entries });
    } catch (err) {
      next(err);
    }
  },

  async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as {
        value?: unknown;
        company_id?: string | null;
        namespace_description?: string;
      };
      const entry = await configService.upsert(
        authPayload(req),
        routeParam(req.params.namespace),
        routeParam(req.params.key),
        body.value,
        body.company_id,
        body.namespace_description,
      );
      res.status(200).json(entry);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.query.company_id as string | undefined;
      await configService.delete(
        authPayload(req),
        routeParam(req.params.namespace),
        routeParam(req.params.key),
        companyId === undefined ? undefined : companyId || null,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
