import type { Request, Response, NextFunction } from 'express';
import { rbacService } from '../services/rbac.service';

function routeParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export const rbacController = {
  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      rbacService.assertCompanyAccess(req.companyId!, companyId);
      const role = await rbacService.createRole(companyId, req.body.name);
      return res.status(201).json(role);
    } catch (e) {
      next(e);
    }
  },

  async createPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      rbacService.assertCompanyAccess(req.companyId!, companyId);
      const perm = await rbacService.createPermission(companyId, {
        name: req.body.name,
        resource: req.body.resource,
        action: req.body.action,
      });
      return res.status(201).json(perm);
    } catch (e) {
      next(e);
    }
  },

  async assignPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      rbacService.assertCompanyAccess(req.companyId!, companyId);
      const link = await rbacService.assignPermissionToRole(
        companyId,
        routeParam(req.params.id),
        req.body.permission_id,
      );
      return res.status(201).json(link);
    } catch (e) {
      next(e);
    }
  },

  async assignRoleToUser(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      rbacService.assertCompanyAccess(req.companyId!, companyId);
      const assignment = await rbacService.assignRoleToUser(
        companyId,
        routeParam(req.params.id),
        req.body.role_id,
      );
      return res.status(201).json(assignment);
    } catch (e) {
      next(e);
    }
  },

  async getUserPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = (req.query.company_id as string) || req.companyId!;
      rbacService.assertCompanyAccess(req.companyId!, companyId);
      const result = await rbacService.getUserPermissions(companyId, routeParam(req.params.id));
      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async evaluate(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.body.company_id as string;
      rbacService.assertCompanyAccess(req.companyId!, companyId);
      const result = await rbacService.evaluate({
        userId: req.body.user_id,
        companyId,
        action: req.body.action,
        resource: req.body.resource,
      });
      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  /** Auth service registration hook — no JWT required if service key set. */
  async hookUserRegistered(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, companyId, roles } = req.body as {
        userId: string;
        companyId: string;
        roles: string[];
      };
      const assigned = await rbacService.assignRolesByName(companyId, userId, roles);
      const { permissions } = await rbacService.getUserPermissions(companyId, userId, false);
      return res.json({ roles: assigned, permissions: permissions.map((p) => p.name) });
    } catch (e) {
      next(e);
    }
  },
};
