/**
 * Example module feature routes protected by fine-grained permission keys.
 */
import { Router } from 'express';
import {
  requireAuth,
  requirePermission,
  refreshPermissions,
} from '../middleware/auth.middleware';
import { PERMISSION_KEYS } from '../rbac/permission-catalog';

export const moduleFeatureRouter = Router();

moduleFeatureRouter.use(requireAuth, refreshPermissions());

// VeriCore — view audits
moduleFeatureRouter.get(
  '/vericore/audits',
  requirePermission(PERMISSION_KEYS.VERICORE_AUDIT_VIEW),
  (_req, res) => {
    res.json({
      ok: true,
      required: PERMISSION_KEYS.VERICORE_AUDIT_VIEW,
      items: [],
    });
  },
);

// VeriCore — edit audits
moduleFeatureRouter.post(
  '/vericore/audits',
  requirePermission(PERMISSION_KEYS.VERICORE_AUDIT_EDIT),
  (_req, res) => {
    res.status(201).json({ ok: true, required: PERMISSION_KEYS.VERICORE_AUDIT_EDIT });
  },
);

// VeriPM — view projects
moduleFeatureRouter.get(
  '/veripm/projects',
  requirePermission(PERMISSION_KEYS.VERIPM_PROJECT_VIEW),
  (_req, res) => {
    res.json({ ok: true, required: PERMISSION_KEYS.VERIPM_PROJECT_VIEW, items: [] });
  },
);

// VeriPM — edit projects
moduleFeatureRouter.post(
  '/veripm/projects',
  requirePermission(PERMISSION_KEYS.VERIPM_PROJECT_EDIT),
  (_req, res) => {
    res.status(201).json({ ok: true, required: PERMISSION_KEYS.VERIPM_PROJECT_EDIT });
  },
);

// VeriHub — upload files
moduleFeatureRouter.post(
  '/verihub/files',
  requirePermission(PERMISSION_KEYS.VERIHUB_FILE_UPLOAD),
  (_req, res) => {
    res.status(201).json({ ok: true, required: PERMISSION_KEYS.VERIHUB_FILE_UPLOAD });
  },
);

// VeriHub — delete files (Owner/Admin/Manager only — User lacks this key)
moduleFeatureRouter.delete(
  '/verihub/files/:fileId',
  requirePermission(PERMISSION_KEYS.VERIHUB_FILE_DELETE),
  (req, res) => {
    res.json({
      ok: true,
      required: PERMISSION_KEYS.VERIHUB_FILE_DELETE,
      fileId: req.params.fileId,
    });
  },
);
